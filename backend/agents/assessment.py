# agents/assessment.py
# ASSESSMENT AGENT: reads a raw emergency report (plain text) and turns it into
# a structured Incident: type, severity, people affected, and resources needed.
# This file is the RULE-BASED layer. The AI layer will be added on top later,
# and these rules become the automatic fallback.

import re
from typing import List, Tuple
from models import Incident

# Keyword lists for each incident type. Order matters: we check gas before fire,
# because a gas leak report may also mention "fire risk".
TYPE_KEYWORDS = [
    ("gas_leak", ["gas", "leak", "chemical", "fumes"]),
    ("fire", ["fire", "smoke", "burning", "flames"]),
    ("accident", ["accident", "overturned", "collision", "crash", "truck", "hit"]),
    (
        "medical",
        ["heart", "cardiac", "collapsed", "unconscious", "breathing", "stroke"],
    ),
    ("evacuation", ["evacuat", "flood", "building collapse", "stranded"]),
]

# Starting severity for each type, before adjustments.
BASE_SEVERITY = {
    "gas_leak": 4,
    "fire": 4,
    "accident": 3,
    "medical": 3,
    "evacuation": 3,
}

# Words that signal a life-threatening situation.
CRITICAL_WORDS = [
    "trapped",
    "unconscious",
    "heart attack",
    "not breathing",
    "critical",
    "severe",
]

# Words that signal the report itself is unreliable.
VAGUE_WORDS = ["unclear", "unknown", "not sure", "maybe", "some people"]


def detect_type(text: str) -> str:
    for incident_type, words in TYPE_KEYWORDS:
        if any(w in text for w in words):
            return incident_type
    return "evacuation"  # safe default: treat unknown situations as needing rescue


def count_people(text: str) -> int:
    """Finds numbers followed by people-words, e.g. '4 people injured', '12 people inside'.
    Ignores ages like '65 year old'. Returns the largest number found, or 1."""
    pattern = r"(\d+)\s+(?:people|persons|injured|trapped|residents|workers|passengers)"
    numbers = [int(n) for n in re.findall(pattern, text)]
    return max(numbers) if numbers else 1


def decide_needs(incident_type: str, people: int, text: str) -> List[str]:
    """Which resources this incident needs. A repeated item means 'more than one'."""
    trapped = "trapped" in text
    if incident_type == "accident":
        ambulances = min(
            3, max(1, people // 2)
        )  # roughly 1 ambulance per 2 injured, max 3
        return ["ambulance"] * ambulances + (["rescue_team"] if trapped else [])
    if incident_type == "fire":
        needs = ["fire_truck", "ambulance"]
        if people >= 10 or trapped or "evacuat" in text:
            needs.append("rescue_team")
        return needs
    if incident_type == "gas_leak":
        ambulances = 3 if people >= 20 else 2
        return ["fire_truck", "rescue_team"] + ["ambulance"] * ambulances
    if incident_type == "medical":
        return ["ambulance"]
    return ["rescue_team", "ambulance"]  # evacuation


def assess_with_rules(report: dict) -> Tuple[Incident, float]:
    """Returns (Incident, confidence). Confidence is 0.0 to 1.0."""
    text = report["description"].lower()

    incident_type = detect_type(text)
    people = count_people(text)
    severity = BASE_SEVERITY[incident_type]

    if any(w in text for w in CRITICAL_WORDS):
        severity += 1  # life-threatening → more serious
    if people >= 20:
        severity += 1  # mass-casualty risk → more serious

    # Confidence: how sure are we about this assessment?
    confidence = 0.85
    has_number = bool(re.search(r"\d", text))
    if any(w in text for w in VAGUE_WORDS) or not has_number or len(text) < 60:
        confidence = 0.5
        severity += 1  # unclear report → be cautious, never under-serve

    severity = max(1, min(5, severity))  # keep within 1 to 5

    incident = Incident(
        id=report["id"],
        title=report["title"],
        description=report["description"],
        type=incident_type,
        severity=severity,
        lat=report["lat"],
        lng=report["lng"],
        people_affected=people,
        needs=decide_needs(incident_type, people, text),
        status="active",
    )
    return incident, confidence


def assess(report: dict) -> Tuple[Incident, float]:
    """Main entry point used by the rest of the system.
    For now it uses rules only. The AI layer will be added here later."""
    return assess_with_rules(report)
