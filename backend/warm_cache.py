# warm_cache.py
# Pre-fills llm_cache.json with AI answers for every report in the demo,
# so the live demo is instant and works without internet.
# Run it from the backend folder:  python warm_cache.py

import time
from data.seed import initial_reports
from data.scenario import STEPS
from agents.assessment import assess_with_ai

reports = initial_reports() + [r for step in STEPS for r in step["new_reports"]]
print(f"Warming cache for {len(reports)} reports...")

for round_no in range(1, 7):  # up to 6 rounds
    failed = []
    for r in reports:
        if assess_with_ai(r) is None:  # None = AI failed (cached ones return instantly)
            failed.append(r["id"])
    if not failed:
        print("All reports cached. Demo is ready.")
        break
    print(f"Round {round_no}: still missing {failed}. Retrying in 20 seconds...")
    time.sleep(20)
else:
    print("Some reports still failed. Gemini is busy; try again later.")
