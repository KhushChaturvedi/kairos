# models.py
# Every class here is a "blueprint" for one type of data in CONTRACT.md.
# Pydantic checks that our data always matches these blueprints.

from typing import List, Literal, Optional  # tools to describe types precisely
from pydantic import BaseModel  # base class that gives data-checking powers


class Incident(BaseModel):  # one emergency (accident, fire, etc.)
    id: str  # unique ID, e.g. "INC-01"
    title: str  # short name, e.g. "Truck overturned on SG Highway"
    description: str  # the raw text report
    type: Literal[
        "accident", "fire", "medical", "evacuation", "gas_leak"
    ]  # only these 5 values allowed
    severity: Literal[1, 2, 3, 4, 5]  # 1 = minor, 5 = most critical
    lat: float  # latitude on the map
    lng: float  # longitude on the map
    people_affected: int  # number of people involved
    needs: List[str]  # resources needed, e.g. ["ambulance", "rescue_team"]
    status: Literal["active", "resolved"]  # still going on, or finished
    address: Optional[str] = None  # place name, e.g. "Paldi" (optional)


class Resource(BaseModel):  # one unit that can respond (ambulance, etc.)
    id: str  # e.g. "AMB-01"
    name: str  # e.g. "Ambulance 01"
    type: Literal["ambulance", "rescue_team", "fire_truck"]
    lat: float  # current position
    lng: float
    status: Literal[
        "available", "assigned", "unavailable"
    ]  # free, busy, or broken down
    assigned_to: Optional[str] = None  # incident ID it's working on; None if free


class Facility(BaseModel):  # a hospital or shelter
    id: str
    name: str
    type: Literal["shelter", "hospital"]
    lat: float
    lng: float
    capacity: int  # maximum people it can hold
    occupied: int  # how many are already there


class Assignment(BaseModel):  # "this resource goes to this incident"
    incident_id: str
    resource_id: str
    eta_minutes: float  # estimated arrival time in minutes
    reason: str  # plain-language explanation of why


class Change(BaseModel):  # one difference between the old plan and the new plan
    change_type: Literal["new_assignment", "reassigned", "removed"]
    resource_id: str
    from_incident: Optional[str] = None  # where it was before (None if it was free)
    to_incident: Optional[str] = None  # where it goes now (None if removed)
    reason: str


class Approval(BaseModel):  # a risky decision waiting for a human
    id: str
    incident_id: str
    reason: str  # why it needs approval
    proposed_action: str  # what Kairos wants to do
    status: Literal["pending", "approved", "rejected"]


class Plan(BaseModel):  # the full response plan
    version: int  # goes up by 1 every time the plan is rebuilt
    assignments: List[Assignment]
    changes: List[Change]  # what changed since the last version
    summary: str  # short overview in plain language


class State(BaseModel):  # EVERYTHING the frontend needs, in one object
    incidents: List[Incident]
    resources: List[Resource]
    facilities: List[Facility]
    plan: Plan
    approvals: List[Approval]
    event_log: List[str]  # timeline of what happened, e.g. "Gas leak reported"
    step: int  # which scripted demo step we're on


class ApproveRequest(BaseModel):  # the body the frontend sends to POST /approve
    approval_id: str
    decision: Literal["approve", "reject"]


class ReportRequest(BaseModel):  # the body the frontend sends to POST /report
    description: str  # the emergency in plain text (required)
    address: Optional[str] = None  # area or address typed by the operator (optional)
    lat: Optional[float] = None  # set only if the operator clicked the map
    lng: Optional[float] = None
    title: Optional[str] = None  # optional; generated from the text if missing
