# state.py
# STATE MANAGER: holds the live city in memory and runs the agents in order.
# Flow for every change:  Assessment → Allocation (uses Route) → Command → updated State

from typing import Dict, List, Optional
from models import State, Plan, Incident, Resource, Facility, Assignment, Approval
from data.seed import initial_reports, initial_resources, initial_facilities
from data.scenario import get_step
from agents.assessment import assess
from agents.allocation import allocate
from agents.command import build_plan, build_approvals, make_summary
from agents.route import eta_minutes

LABELS = {
    "ambulance": "ambulance",
    "rescue_team": "rescue team",
    "fire_truck": "fire truck",
}


class Engine:
    def __init__(self):
        self.reset()

    # ---------- public actions (called by the API) ----------

    def reset(self) -> State:
        """Start the simulation from scratch."""
        self.resources: List[Resource] = initial_resources()
        self.facilities: List[Facility] = initial_facilities()
        self.incidents: List[Incident] = []
        self.approvals: List[Approval] = []
        self.approval_data: Dict[str, Optional[dict]] = {}
        self.used_keys: set = set()
        self.event_log: List[str] = []
        self.step: int = 0
        self.report_count: int = 0
        self.plan = Plan(version=0, assignments=[], changes=[], summary="")

        confidences = {}
        for report in initial_reports():
            incident, conf = assess(report)
            self.incidents.append(incident)
            confidences[incident.id] = conf

        self.log("Kairos online. 3 active incidents loaded.")
        self._replan(self.plan.assignments, confidences)
        self.plan = self.plan.model_copy(update={"changes": []})
        return self.get_state()

    def trigger_event(self) -> State:
        """Play the next scripted event, then rebuild the plan."""
        step = get_step(self.step)
        if step is None:
            self.log("No more scripted events. Press Reset to replay the demo.")
            return self.get_state()

        for rid in step["unavailable"]:
            for r in self.resources:
                if r.id == rid:
                    r.status = "unavailable"
                    r.assigned_to = None

        for iid in step["resolve"]:
            for i in self.incidents:
                if i.id == iid:
                    i.status = "resolved"

        confidences = {}
        for report in step["new_reports"]:
            incident, conf = assess(report)
            self.incidents.append(incident)
            confidences[incident.id] = conf

        for line in step["log"]:
            self.log(line)

        self.step += 1
        self._replan(self.plan.assignments, confidences)
        return self.get_state()

    def add_report(
        self, description: str, lat: float, lng: float, title: Optional[str] = None
    ) -> State:
        """A live emergency typed by the operator."""
        self.report_count += 1
        incident_id = f"INC-{100 + self.report_count}"  # INC-101, INC-102, ...

        if not title:
            words = description.strip().split()
            title = " ".join(words[:6]).rstrip(",.;:")

        report = {
            "id": incident_id,
            "title": title,
            "description": description.strip(),
            "lat": lat,
            "lng": lng,
        }
        incident, conf = assess(report)
        self.incidents.append(incident)
        self.log(f"New operator report: {title}")
        self._replan(self.plan.assignments, {incident.id: conf})
        return self.get_state()

    def decide(self, approval_id: str, decision: str) -> State:
        """Operator approves or rejects a pending decision."""
        approval = next((a for a in self.approvals if a.id == approval_id), None)
        if approval is None or approval.status != "pending":
            return self.get_state()

        idx = self.approvals.index(approval)
        new_status = "approved" if decision == "approve" else "rejected"
        self.approvals[idx] = approval.model_copy(update={"status": new_status})
        proposal = self.approval_data.get(approval_id)

        if decision == "reject":
            self.log(f"Operator rejected: {approval.proposed_action}")
            self._refresh_summary()
            return self.get_state()

        self.log(f"Operator approved: {approval.proposed_action}")
        if proposal is None:
            self._refresh_summary()
            return self.get_state()

        base = self._apply_swap(proposal)
        self._replan(base, {})
        return self.get_state()

    def get_state(self) -> State:
        return State(
            incidents=self.incidents,
            resources=self.resources,
            facilities=self.facilities,
            plan=self.plan,
            approvals=self.approvals,
            event_log=self.event_log,
            step=self.step,
        )

    # ---------- internal helpers ----------

    def log(self, message: str):
        self.event_log.append(message)

    def _replan(self, base: List[Assignment], confidences: Dict[str, float]):
        """Runs Allocation + Command and stores the new plan."""
        old = self.plan.assignments
        assignments, proposals = allocate(self.incidents, self.resources, base)

        for approval, key, proposal in build_approvals(
            proposals, confidences, self.incidents, self.resources, self.used_keys
        ):
            self.approvals.append(approval)
            self.approval_data[approval.id] = proposal
            self.used_keys.add(key)

        pending = self._pending_count()
        self.plan = build_plan(
            self.plan.version + 1,
            old,
            assignments,
            self.incidents,
            self.resources,
            self.facilities,
            pending,
        )
        self._sync_resources()
        self._refresh_summary()

        if self.plan.version > 1:
            self.log(
                f"Plan updated to version {self.plan.version}: "
                f"{len(self.plan.changes)} change(s), {pending} pending approval(s)."
            )

    def _apply_swap(self, p: dict) -> List[Assignment]:
        """Applies an approved swap to the current assignments."""
        res = {r.id: r for r in self.resources}
        inc = {i.id: i for i in self.incidents}
        target = inc.get(p["incident_id"])
        source = inc.get(p["from_incident_id"])
        pull = res.get(p["pull_resource_id"])
        back = res.get(p["backfill_resource_id"]) if p["backfill_resource_id"] else None
        if not target or not source or not pull:
            return self.plan.assignments

        moving = {pull.id} | ({back.id} if back else set())
        base = [a for a in self.plan.assignments if a.resource_id not in moving]

        if pull.status != "unavailable" and target.status == "active":
            e = eta_minutes(pull, target.lat, target.lng)
            base.append(
                Assignment(
                    incident_id=target.id,
                    resource_id=pull.id,
                    eta_minutes=e,
                    reason=f"Operator-approved swap: closest {LABELS[pull.type]} to a critical incident, arriving in about {e:.0f} min.",
                )
            )
        if back and back.status != "unavailable" and source.status == "active":
            e = eta_minutes(back, source.lat, source.lng)
            base.append(
                Assignment(
                    incident_id=source.id,
                    resource_id=back.id,
                    eta_minutes=e,
                    reason=f"Operator-approved swap: now covering {source.title}, arriving in about {e:.0f} min.",
                )
            )
        return base

    def _sync_resources(self):
        """Updates each resource's status to match the current plan."""
        assigned = {a.resource_id: a.incident_id for a in self.plan.assignments}
        for r in self.resources:
            if r.status == "unavailable":
                r.assigned_to = None
            elif r.id in assigned:
                r.status = "assigned"
                r.assigned_to = assigned[r.id]
            else:
                r.status = "available"
                r.assigned_to = None

    def _pending_count(self) -> int:
        return sum(1 for a in self.approvals if a.status == "pending")

    def _refresh_summary(self):
        summary = make_summary(
            self.incidents, self.resources, self.plan.assignments, self._pending_count()
        )
        self.plan = self.plan.model_copy(update={"summary": summary})


# One shared engine for the whole app.
engine = Engine()
