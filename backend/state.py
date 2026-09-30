# state.py
# STATE MANAGER: holds the live city in memory and runs the agents in order.
# Flow for every change:  Assessment → Allocation (uses Route) → Command → updated State
# The app starts EMPTY: incidents come from operator reports (or the optional demo scenario).

from typing import Dict, List, Optional
from models import State, Plan, Incident, Resource, Facility, Assignment, Approval
from data.seed import initial_resources, initial_facilities
from data.scenario import get_step
from agents.assessment import assess
from agents.allocation import allocate
from agents.command import build_plan, build_approvals, make_summary
from agents.route import eta_minutes
from agents.geocode import resolve_location

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
        """Start with an empty city: all units on standby, no incidents."""
        self.resources: List[Resource] = initial_resources()
        self.facilities: List[Facility] = initial_facilities()
        self.incidents: List[Incident] = []
        self.approvals: List[Approval] = []
        self.approval_data: Dict[str, Optional[dict]] = {}
        self.used_keys: set = set()
        self.event_log: List[str] = []
        self.step: int = 0
        self.report_count: int = 0
        self.plan = Plan(version=1, assignments=[], changes=[], summary="")
        self.log(f"Kairos online. All {len(self.resources)} units on standby.")
        self._refresh_summary()
        return self.get_state()

    def trigger_event(self) -> State:
        """Play the next step of the optional demo scenario."""
        step = get_step(self.step)
        if step is None:
            self.log("Demo scenario finished. Press Reset to start again.")
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
        existing = {i.id for i in self.incidents}
        for report in step["new_reports"]:
            if report["id"] in existing:
                continue
            incident, conf = assess(report)
            self.incidents.append(incident)
            confidences[incident.id] = conf

        for line in step["log"]:
            self.log(line)

        self.step += 1
        self._replan(self.plan.assignments, confidences)
        return self.get_state()

    def add_report(
        self,
        description: str,
        address: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        title: Optional[str] = None,
    ) -> State:
        """A live emergency typed by the operator. Location is optional."""
        self.report_count += 1
        incident_id = f"INC-{100 + self.report_count}"  # INC-101, INC-102, ...

        if not title:
            words = description.strip().split()
            title = " ".join(words[:6]).rstrip(",.;:")

        lat, lng, place, source = resolve_location(address, description, lat, lng)

        report = {
            "id": incident_id,
            "title": title,
            "description": description.strip(),
            "lat": lat,
            "lng": lng,
        }
        incident, conf = assess(report)
        incident = incident.model_copy(update={"address": place})
        self.incidents.append(incident)

        if source == "unknown":
            conf = min(conf, 0.5)  # triggers a "verify" approval for the operator
            self.log(
                f"New operator report: {title}. Location not found, placed at city centre. Please verify."
            )
        else:
            self.log(f"New operator report: {title} ({place})")

        self._replan(self.plan.assignments, {incident.id: conf})
        return self.get_state()

    def resolve_incident(self, incident_id: str) -> State:
        """Operator marks an incident as finished; its units become free."""
        incident = next((i for i in self.incidents if i.id == incident_id), None)
        if incident is None or incident.status == "resolved":
            return self.get_state()
        incident.status = "resolved"
        self.log(f"Operator closed incident: {incident.title}. Its units are now free.")
        self._replan(self.plan.assignments, {})
        return self.get_state()

    def set_resource_status(self, resource_id: str, status: str) -> State:
        """Operator marks a unit out of service, or back in service."""
        resource = next((r for r in self.resources if r.id == resource_id), None)
        if resource is None:
            return self.get_state()
        if status == "unavailable" and resource.status != "unavailable":
            resource.status = "unavailable"
            resource.assigned_to = None
            self.log(f"{resource.name} marked out of service.")
        elif status == "available" and resource.status == "unavailable":
            resource.status = "available"
            self.log(f"{resource.name} is back in service.")
        else:
            return self.get_state()
        self._replan(self.plan.assignments, {})
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
