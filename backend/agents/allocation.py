# agents/allocation.py
# ALLOCATION AGENT: decides which resource goes to which incident.
# Rules:
#   1. Least disruption: resources already working on an incident stay there.
#   2. Most critical incidents are served first.
#   3. Each missing need gets the nearest FREE resource of that type.
#   4. If a critical incident would wait too long, propose pulling a closer
#      resource from a less serious incident. This is only a PROPOSAL:
#      a human must approve it (the Command agent creates the approval).

from typing import List, Tuple, Optional
from models import Incident, Resource, Assignment
from agents.route import eta_minutes

CRITICAL_SEVERITY = 5  # severity at which long waits are not acceptable
MAX_CRITICAL_ETA = 15.0  # minutes; a critical incident should get help faster than this
MIN_TIME_SAVED = 8.0  # only propose a pull if it saves at least 8 minutes

LABELS = {
    "ambulance": "ambulance",
    "rescue_team": "rescue team",
    "fire_truck": "fire truck",
}


def priority_score(incident: Incident) -> float:
    """Higher score = served first. Severity matters most; crowd size breaks ties."""
    return incident.severity * 10 + min(incident.people_affected, 50) / 5


def allocate(
    incidents: List[Incident],
    resources: List[Resource],
    previous: List[Assignment],
) -> Tuple[List[Assignment], List[dict]]:
    """Returns (assignments, proposals)."""
    by_id = {r.id: r for r in resources}
    active = {i.id: i for i in incidents if i.status == "active"}

    # Step 1: keep every previous assignment that is still valid.
    assignments = [
        a
        for a in previous
        if a.resource_id in by_id
        and by_id[a.resource_id].status != "unavailable"
        and a.incident_id in active
    ]
    busy = {a.resource_id for a in assignments}
    proposals: List[dict] = []
    proposed = set()  # resources already in a proposal, so we never propose them twice

    # Step 2: go through incidents, most critical first.
    for inc in sorted(active.values(), key=priority_score, reverse=True):

        # Step 3: work out which needs are still uncovered.
        missing = list(inc.needs)
        for a in assignments:
            if a.incident_id == inc.id:
                t = by_id[a.resource_id].type
                if t in missing:
                    missing.remove(t)

        # Step 4: fill each missing need with the nearest free resource.
        for need in missing:
            free = [
                r
                for r in resources
                if r.type == need and r.status != "unavailable" and r.id not in busy
            ]
            best: Optional[Resource] = None
            best_eta: Optional[float] = None
            if free:
                best = min(free, key=lambda r: eta_minutes(r, inc.lat, inc.lng))
                best_eta = eta_minutes(best, inc.lat, inc.lng)
                assignments.append(
                    Assignment(
                        incident_id=inc.id,
                        resource_id=best.id,
                        eta_minutes=best_eta,
                        reason=f"Nearest available {LABELS[need]}, arriving in about {best_eta:.0f} min.",
                    )
                )
                busy.add(best.id)

            # Step 5: critical incident waiting too long? Look for a faster option.
            too_slow = best is None or best_eta > MAX_CRITICAL_ETA
            if inc.severity >= CRITICAL_SEVERITY and too_slow:
                proposal = find_pull(
                    inc, need, best, best_eta, assignments, active, by_id, proposed
                )
                if proposal:
                    proposals.append(proposal)
                    proposed.add(proposal["pull_resource_id"])

    return assignments, proposals


def find_pull(
    inc, need, backfill, backfill_eta, assignments, active, by_id, proposed
) -> Optional[dict]:
    """Finds a resource of the needed type, working on a LESS serious incident,
    that could reach this critical incident much faster."""
    candidates = []
    for a in assignments:
        r = by_id[a.resource_id]
        other = active.get(a.incident_id)
        if (
            r.type == need
            and other is not None
            and other.id != inc.id
            and other.severity < inc.severity
            and r.id not in proposed
        ):
            candidates.append((eta_minutes(r, inc.lat, inc.lng), r, other))

    if not candidates:
        return None

    pull_eta, pull_res, from_inc = min(candidates, key=lambda c: c[0])
    time_saved = (backfill_eta - pull_eta) if backfill_eta is not None else None

    # Only worth it if it saves real time (or if nothing else is available at all).
    if time_saved is not None and time_saved < MIN_TIME_SAVED:
        return None

    if backfill:
        reason = (
            f"{pull_res.name} can reach {inc.title} in {pull_eta:.0f} min instead of "
            f"{backfill_eta:.0f} min. Swap it with {backfill.name}, which will cover "
            f"{from_inc.title} instead."
        )
    else:
        reason = (
            f"No free {LABELS[need]} for {inc.title}. {pull_res.name} can arrive in "
            f"{pull_eta:.0f} min if moved from {from_inc.title}."
        )

    return {
        "incident_id": inc.id,
        "need": need,
        "pull_resource_id": pull_res.id,
        "from_incident_id": from_inc.id,
        "backfill_resource_id": backfill.id if backfill else None,
        "time_saved": time_saved,
        "reason": reason,
    }
