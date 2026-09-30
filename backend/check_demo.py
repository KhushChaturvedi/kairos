# check_demo.py
# Tests the full app flow without the server. Run: python check_demo.py

from state import engine


def show(title):
    s = engine.get_state()
    names = {r.id: r.name.split(" (")[0] for r in s.resources}
    print(f"\n===== {title} (plan v{s.plan.version}) =====")
    for i in s.incidents:
        units = [f"{names[a.resource_id]} {a.eta_minutes:.0f}m"
                 for a in s.plan.assignments if a.incident_id == i.id]
        print(f"{i.id} [{i.status}] sev {i.severity}, {i.people_affected} ppl, at {i.address} -> {units}")
    print("Changes:", [f"{c.change_type} {c.resource_id}" for c in s.plan.changes])
    print("Pending approvals:", [a.proposed_action for a in s.approvals if a.status == "pending"])
    print("Summary:", s.plan.summary)


engine.reset()
show("1. EMPTY START")

engine.add_report("Bus overturned, around 15 passengers injured and 3 trapped.", address="Paldi")
show("2. OPERATOR REPORT (Paldi)")

engine.add_report("Major gas leak at a factory, around 25 workers feeling dizzy.", address="Naroda")
show("3. SECOND REPORT (Naroda gas leak)")

engine.set_resource_status("AMB-02", "unavailable")
show("4. AMB-02 OUT OF SERVICE")

engine.resolve_incident("INC-101")
show("5. PALDI INCIDENT RESOLVED")

engine.reset()
engine.trigger_event()
engine.trigger_event()
show("6. DEMO SCENARIO (after 2 steps)")

print("\nEvent log:")
for line in engine.get_state().event_log:
    print(" ", line)
