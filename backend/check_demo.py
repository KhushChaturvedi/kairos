# check_demo.py
# Plays the full demo without the server and prints a short report.
# Run from the backend folder:  python check_demo.py

from state import engine


def show(title):
    s = engine.get_state()
    names = {r.id: r.name.split(" (")[0] for r in s.resources}
    print(f"\n===== {title} (plan v{s.plan.version}, step {s.step}) =====")
    for i in s.incidents:
        units = [
            f"{names[a.resource_id]} {a.eta_minutes:.0f}m"
            for a in s.plan.assignments
            if a.incident_id == i.id
        ]
        print(
            f"{i.id} [{i.status}] sev {i.severity}, {i.people_affected} ppl, "
            f"needs {i.needs} -> {units}"
        )
    down = [r.id for r in s.resources if r.status == "unavailable"]
    free = [r.id for r in s.resources if r.status == "available"]
    print(f"Out of service: {down} | Free: {free}")
    print("Changes:")
    for c in s.plan.changes:
        print(
            f"  - {c.change_type}: {c.resource_id} {c.from_incident} -> {c.to_incident}"
        )
    print("Approvals:")
    for a in s.approvals:
        print(f"  - {a.id} [{a.status}] {a.proposed_action}")
    print(f"Summary: {s.plan.summary}")


engine.reset()
show("START")

engine.trigger_event()
show("AFTER CLICK 1 (gas leak + breakdown)")

engine.trigger_event()
show("AFTER CLICK 2 (Maninagar closed + Kankaria report)")

pending = [a for a in engine.get_state().approvals if a.status == "pending"]
if pending:
    engine.decide(pending[0].id, "approve")
    show(f"AFTER APPROVING {pending[0].id}")

engine.trigger_event()
show("AFTER EXTRA CLICK (should say no more events)")
print("\nEvent log:")
for line in engine.get_state().event_log:
    print(f"  {line}")
