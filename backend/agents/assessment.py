# agents/assessment.py
# ASSESSMENT AGENT: reads a raw emergency report (plain text) and turns it into
# a structured Incident: type, severity, people affected, and resources needed.
# Layer 1: AI (Gemini) reads the report.  Layer 2: rules, used as fallback.

import re
from typing import List, Optional, Tuple
from models import Incident
from agents.llm import ask_json

# Keyword lists for each incident type. Order matters: gas is checked before fire.
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

BASE_SEVERITY = {
    "gas_leak": 4,
    "fire": 4,
    "accident": 3,
    "medical": 3,
    "evacuation": 3,
}

CRITICAL_WORDS = [
    "trapped",
    "unconscious",
    "heart attack",
    "not breathing",
    "critical",
    "severe",
]
VAGUE_WORDS = ["unclear", "unknown", "not sure", "maybe", "some people"]


# ---------------- RULE-BASED LAYER ----------------


def detect_type(text: str) -> str:
    for incident_type, words in TYPE_KEYWORDS:
        if any(w in text for w in words):
            return incident_type
    return "evacuation"


def count_people(text: str) -> int:
    pattern = r"(\d+)\s+(?:people|persons|injured|trapped|residents|workers|passengers)"
    numbers = [int(n) for n in re.findall(pattern, text)]
    return max(numbers) if numbers else 1


def decide_needs(incident_type: str, people: int, text: str) -> List[str]:
    trapped = "trapped" in text
    if incident_type == "accident":
        ambulances = min(3, max(1, people // 2))
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
    return ["rescue_team", "ambulance"]


def assess_with_rules(report: dict) -> Tuple[Incident, float]:
    text = report["description"].lower()

    incident_type = detect_type(text)
    people = count_people(text)
    severity = BASE_SEVERITY[incident_type]

    if any(w in text for w in CRITICAL_WORDS):
        severity += 1
    if people >= 20:
        severity += 1

    confidence = 0.85
    has_number = bool(re.search(r"\d", text))
    if any(w in text for w in VAGUE_WORDS) or not has_number or len(text) < 25:
        confidence = 0.5
        severity += 1

    severity = max(1, min(5, severity))

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


# ---------------- AI LAYER ----------------

AI_PROMPT = """You are an emergency dispatch analyst for Ahmedabad, India.
Read the emergency report below and return ONLY a JSON object with these keys:
- "type": one of "accident", "fire", "medical", "evacuation", "gas_leak"
- "people_affected": integer, your best estimate of people involved (1 if unknown)
- "unclear": true if the report is vague, missing key facts, or unreliable; otherwise false
- "confidence": number from 0.0 to 1.0, how sure you are about this reading

Report:
\"\"\"{text}\"\"\"
"""


def assess_with_ai(report: dict) -> Optional[Tuple[Incident, float]]:
    """AI reads the report; the transparent formula decides severity."""
    data = ask_json(AI_PROMPT.format(text=report["description"]))
    if not data:
        return None

    try:
        incident_type = data["type"]
        if incident_type not in BASE_SEVERITY:
            return None
        people = max(1, min(int(data["people_affected"]), 10000))
        unclear = bool(data.get("unclear", False))
        ai_conf = max(0.0, min(float(data.get("confidence", 0.8)), 1.0))
    except Exception:
        return None

    text = report["description"].lower()
    rule_incident, rule_conf = assess_with_rules(report)

    severity = BASE_SEVERITY[incident_type]
    if any(w in text for w in CRITICAL_WORDS):
        severity += 1
    if people >= 20:
        severity += 1

    vague = unclear or rule_conf < 0.6
    if vague:
        severity += 1
        confidence = min(ai_conf, 0.5)
    else:
        confidence = rule_conf

    severity = max(1, min(5, severity))

    incident = rule_incident.model_copy(
        update={
            "type": incident_type,
            "severity": severity,
            "people_affected": people,
            "needs": decide_needs(incident_type, people, text),
        }
    )
    return incident, confidence


# ---------------- MAIN ENTRY POINT ----------------


def assess(report: dict) -> Tuple[Incident, float]:
    """Try the AI first, fall back to rules if it fails."""
    result = assess_with_ai(report)
    if result is not None:
        print(f"[Assessment] {report['id']}: assessed by AI")
        return result
    print(f"[Assessment] {report['id']}: assessed by rules (fallback)")
    return assess_with_rules(report)
