# Kairos API Contract (Team Golden Dawn)

Backend: FastAPI at http://localhost:8000
Frontend: Next.js at http://localhost:3000

## Endpoints

GET /state → returns State
POST /event → triggers next scripted event, returns State
POST /approve → body { "approval_id": string, "decision": "approve" | "reject" }, returns State
POST /reset → returns State

## Types

```ts
type Incident = {
  id: string;
  title: string;
  description: string;
  type: "accident" | "fire" | "medical" | "evacuation" | "gas_leak";
  severity: 1 | 2 | 3 | 4 | 5;
  lat: number;
  lng: number;
  people_affected: number;
  needs: string[];
  status: "active" | "resolved";
};

type Resource = {
  id: string;
  name: string;
  type: "ambulance" | "rescue_team" | "fire_truck";
  lat: number;
  lng: number;
  status: "available" | "assigned" | "unavailable";
  assigned_to: string | null;
};

type Facility = {
  id: string;
  name: string;
  type: "shelter" | "hospital";
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
};

type Assignment = {
  incident_id: string;
  resource_id: string;
  eta_minutes: number;
  reason: string;
};

type Change = {
  change_type: "new_assignment" | "reassigned" | "removed";
  resource_id: string;
  from_incident: string | null;
  to_incident: string | null;
  reason: string;
};

type Approval = {
  id: string;
  incident_id: string;
  reason: string;
  proposed_action: string;
  status: "pending" | "approved" | "rejected";
};

type State = {
  incidents: Incident[];
  resources: Resource[];
  facilities: Facility[];
  plan: {
    version: number;
    assignments: Assignment[];
    changes: Change[];
    summary: string;
  };
  approvals: Approval[];
  event_log: string[];
  step: number;
};
```

## Rule

Nobody changes this file without telling the other person first.
