export type Incident = {
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

export type Resource = {
  id: string;
  name: string;
  type: "ambulance" | "rescue_team" | "fire_truck";
  lat: number;
  lng: number;
  status: "available" | "assigned" | "unavailable";
  assigned_to: string | null;
};

export type Facility = {
  id: string;
  name: string;
  type: "shelter" | "hospital";
  lat: number;
  lng: number;
  capacity: number;
  occupied: number;
};

export type Assignment = {
  incident_id: string;
  resource_id: string;
  eta_minutes: number;
  reason: string;
};

export type Change = {
  change_type: "new_assignment" | "reassigned" | "removed";
  resource_id: string;
  from_incident: string | null;
  to_incident: string | null;
  reason: string;
};

export type Approval = {
  id: string;
  incident_id: string;
  reason: string;
  proposed_action: string;
  status: "pending" | "approved" | "rejected";
};

export type State = {
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