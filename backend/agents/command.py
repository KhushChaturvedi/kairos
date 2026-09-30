# agents/command.py
# COMMAND AGENT: the "shift supervisor". It takes the allocation result and produces:
#   1. The final plan (assignments + a short summary)
#   2. The list of changes since the last plan, each with a reason
#   3. Approval requests for risky decisions and unclear reports

import uuid
from typing import List, Dict, Tuple, Optional
from models import Incident, Resource, Facility, Assignment, Change, Approval, Plan
from agents.route import nearest_facility

LOW_CONFIDENCE = 0.6  # below this, a human should verify the report


def add_destinations(
    assignments: List[Assignment],
    incidents: List[Incident],
    resources: List[Resource],
    facilities: List[Facility],
) -> List[Assignment]:
    """For every ambulance, add which hospital the patients should go to."""
    inc = {i.id: i for i in incidents}
    res = {r.id: r for r in resources}
    result = []
    for a in assignments:
        r = res.get(a.resource_id)
        i = inc.get(a.incident_id)
        reason = a.reason
        if r and i and r.type == "ambulance" and "Patients go to" not in reason:
            hospital = nearest_facility(facilities, i.lat, i.lng, "hospital", people=1)
            if hospital:
                reason += f" Patients go to {hospital.name}."
        result.append(a.model_copy(update={"reason": reason}))
    return result


def diff_changes(
    old: List[Assignment],
    new: List[Assignment],
    resources: List[Resource],
    incidents: List[Incident],
) -> List[Change]:
    """Compares the old plan with the new one and explains every difference."""
    res = {r.id: r for r in resources}
    inc = {i.id: i for i in incidents}
    old_map = {a.resource_id: a.incident_id for a in old}
    new_map = {a.resource_id: a for a in new}

    def title(incident_id: Optional[str]) -> str:
        return inc[incident_id].title if incident_id in inc else str(incident_id)

    changes: List[Change] = []
    for rid in sorted(set(old_map) | set(new_map)):
        before = old_map.get(rid)
        after_a = new_map.get(rid)
        after = after_a.incident_id if after_a else None
        if before == after:
            continue  # nothing changed for this resource

        name = res[rid].name if rid in res else rid

        if before is None:
            changes.append(
                Change(
                    change_type="new_assignment",
                    resource_id=rid,
                    from_incident=None,
                    to_incident=after,
                    reason=f"{name} sent to {title(after)}. {after_a.reason}",
                )
            )
        elif after is None:
            if rid in res and res[rid].status == "unavailable":
                why = (
                    f"{name} is out of service and was withdrawn from {title(before)}."
                )
            else:
                why = f"{name} released from {title(before)}."
            changes.append(
                Change(
                    change_type="removed",
                    resource_id=rid,
                    from_incident=before,
                    to_incident=None,
                    reason=why,
                )
            )
        else:
            changes.append(
                Change(
                    change_type="reassigned",
                    resource_id=rid,
                    from_incident=before,
                    to_incident=after,
                    reason=f"{name} moved from {title(before)} to {title(after)}. {after_a.reason}",
                )
            )
    return changes


def build_approvals(
    proposals: List[dict],
    confidences: Dict[str, float],
    incidents: List[Incident],
    resources: List[Resource],
    existing_keys: set,
) -> List[Tuple[Approval, str, Optional[dict]]]:
    """Creates approval requests. Returns (approval, key, proposal) for each.
    'key' prevents asking the same question twice."""
    inc = {i.id: i for i in incidents}
    res = {r.id: r for r in resources}
    out = []

    # 1. Risky swaps proposed by the Allocation agent
    for p in proposals:
        key = f"pull:{p['pull_resource_id']}:{p['incident_id']}"
        if key in existing_keys:
            continue
        pull = res[p["pull_resource_id"]]
        target = inc[p["incident_id"]]
        source = inc[p["from_incident_id"]]
        if p["backfill_resource_id"]:
            backfill = res[p["backfill_resource_id"]]
            action = (
                f"Swap: send {pull.name} to {target.title}, "
                f"and send {backfill.name} to {source.title}."
            )
        else:
            action = f"Move {pull.name} from {source.title} to {target.title}."
        approval = Approval(
            id=f"APR-{uuid.uuid4().hex[:6].upper()}",
            incident_id=target.id,
            reason=p["reason"],
            proposed_action=action,
            status="pending",
        )
        out.append((approval, key, p))

    # 2. Unclear reports that a human should verify
    for incident_id, conf in confidences.items():
        key = f"verify:{incident_id}"
        if conf >= LOW_CONFIDENCE or key in existing_keys or incident_id not in inc:
            continue
        i = inc[incident_id]
        approval = Approval(
            id=f"APR-{uuid.uuid4().hex[:6].upper()}",
            incident_id=i.id,
            reason=(
                f"The report for {i.title} is unclear (confidence {conf:.0%}). "
                f"Severity was raised to {i.severity} as a precaution."
            ),
            proposed_action="Confirm the details with the caller. Units are already dispatched on the cautious estimate.",
            status="pending",
        )
        out.append((approval, key, None))

    return out


def make_summary(
    incidents: List[Incident],
    resources: List[Resource],
    assignments: List[Assignment],
    pending: int,
) -> str:
    active = [i for i in incidents if i.status == "active"]
    deployed = len({a.resource_id for a in assignments})
    free = len([r for r in resources if r.status == "available"])
    down = len([r for r in resources if r.status == "unavailable"])
    most = max(active, key=lambda i: (i.severity, i.people_affected), default=None)

    text = (
        f"{len(active)} active incidents, {deployed} units deployed, {free} available"
    )
    if down:
        text += f", {down} out of service"
    text += "."
    if most:
        text += f" Highest priority: {most.title} (severity {most.severity})."

    # Incidents that still don't have everything they need
    res_type = {r.id: r.type for r in resources}
    short = []
    for i in active:
        missing = list(i.needs)
        for a in assignments:
            t = res_type.get(a.resource_id)
            if a.incident_id == i.id and t in missing:
                missing.remove(t)
        if missing:
            short.append(f"{i.title} still needs {len(missing)} more unit(s)")
    if short:
        text += " Awaiting resources: " + "; ".join(short) + "."

    if pending:
        text += f" {pending} decision(s) waiting for your approval."
    return text


def build_plan(
    version: int,
    old_assignments: List[Assignment],
    new_assignments: List[Assignment],
    incidents: List[Incident],
    resources: List[Resource],
    facilities: List[Facility],
    pending_count: int,
) -> Plan:
    final = add_destinations(new_assignments, incidents, resources, facilities)
    changes = diff_changes(old_assignments, final, resources, incidents)
    summary = make_summary(incidents, resources, final, pending_count)
    return Plan(version=version, assignments=final, changes=changes, summary=summary)
