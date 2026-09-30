# data/scenario.py
# DEMO SCENARIO: optional scripted story, played by the "Next Demo Event" button.
# The app itself starts EMPTY; this is only for a quick demonstration.

from typing import List
from data.seed import initial_reports

STEPS: List[dict] = [
    # Demo step 1: three emergencies are reported across the city.
    {
        "log": ["Demo scenario: 3 emergencies reported across the city."],
        "new_reports": initial_reports(),
        "unavailable": [],
        "resolve": [],
    },
    # Demo step 2: a critical incident AND a breakdown at the same time.
    {
        "log": [
            "Demo: major gas leak reported near Kalupur Railway Station.",
            "Demo: AMB-04 reports engine failure and is out of service.",
        ],
        "new_reports": [
            {
                "id": "INC-04",
                "title": "Gas leak near Kalupur Station",
                "description": "Major gas leak at a chemical warehouse near Kalupur Railway Station. "
                               "Around 30 residents and workers feeling dizzy, strong fumes "
                               "spreading to nearby homes.",
                "lat": 23.0265, "lng": 72.6005,
            }
        ],
        "unavailable": ["AMB-04"],
        "resolve": [],
    },
    # Demo step 3: one incident closes, and a vague new report arrives nearby.
    {
        "log": [
            "Demo: Maninagar cardiac patient handed over at LG Hospital. Incident closed.",
            "Demo: unclear call about people hurt near Kankaria Lake.",
        ],
        "new_reports": [
            {
                "id": "INC-05",
                "title": "Unclear report near Kankaria Lake",
                "description": "Some people hurt after a crash near Kankaria Lake, "
                               "caller not sure how many.",
                "lat": 23.0063, "lng": 72.6010,
            }
        ],
        "unavailable": [],
        "resolve": ["INC-03"],
    },
]


def get_step(index: int) -> dict:
    """Returns the scripted step at this index, or None when the story is over."""
    if 0 <= index < len(STEPS):
        return STEPS[index]
    return None
