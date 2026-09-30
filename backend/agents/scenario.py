# data/scenario.py
# SCENARIO ENGINE: the scripted story for the live demo.
# Each click on "Trigger Next Event" plays the next step in this list.

from typing import List

STEPS: List[dict] = [
    # Click 1: a critical incident AND a breakdown at the same time.
    {
        "log": [
            "New report: major gas leak near Kalupur Railway Station.",
            "AMB-04 reports engine failure and is out of service.",
        ],
        "new_reports": [
            {
                "id": "INC-04",
                "title": "Gas leak near Kalupur Station",
                "description": "Major gas leak at a chemical warehouse near Kalupur Railway Station. "
                "Around 30 residents and workers feeling dizzy, strong fumes "
                "spreading to nearby homes.",
                "lat": 23.0265,
                "lng": 72.6005,
            }
        ],
        "unavailable": ["AMB-04"],
        "resolve": [],
    },
    # Click 2: an incident finishes, freeing its ambulance.
    {
        "log": [
            "Maninagar cardiac patient handed over at LG Hospital. Incident closed."
        ],
        "new_reports": [],
        "unavailable": [],
        "resolve": ["INC-03"],
    },
    # Click 3: a vague report. The freed ambulance is reused immediately.
    {
        "log": ["New report: unclear call about people hurt near Kankaria Lake."],
        "new_reports": [
            {
                "id": "INC-05",
                "title": "Unclear report near Kankaria Lake",
                "description": "Some people hurt after a crash near Kankaria Lake, "
                "caller not sure how many.",
                "lat": 23.0063,
                "lng": 72.6010,
            }
        ],
        "unavailable": [],
        "resolve": [],
    },
]


def get_step(index: int) -> dict:
    """Returns the scripted step at this index, or None when the story is over."""
    if 0 <= index < len(STEPS):
        return STEPS[index]
    return None
