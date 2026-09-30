import { State } from "./types";

export const mockState: State = {
  incidents: [
    {
      id: "inc-001",
      title: "SG Highway Traffic Accident",
      description:
        "Multi-vehicle collision reported near the SG Highway and Sindhu Bhavan Road junction.",
      type: "accident",
      severity: 5,
      lat: 23.0472,
      lng: 72.5065,
      people_affected: 8,
      needs: ["ambulance", "rescue_team"],
      status: "active",
    },
    {
      id: "inc-002",
      title: "Building Fire in Navrangpura",
      description:
        "Fire reported in a commercial building near the Navrangpura area.",
      type: "fire",
      severity: 4,
      lat: 23.0355,
      lng: 72.5602,
      people_affected: 15,
      needs: ["fire_truck", "ambulance", "rescue_team"],
      status: "active",
    },
    {
      id: "inc-003",
      title: "Cardiac Emergency in Maninagar",
      description:
        "Person experiencing a suspected cardiac emergency near Maninagar Cross Road.",
      type: "medical",
      severity: 3,
      lat: 22.9978,
      lng: 72.6041,
      people_affected: 1,
      needs: ["ambulance"],
      status: "active",
    },
  ],

  resources: [
    {
      id: "amb-001",
      name: "Ambulance A-01",
      type: "ambulance",
      lat: 23.035,
      lng: 72.52,
      status: "assigned",
      assigned_to: "inc-001",
    },
    {
      id: "amb-002",
      name: "Ambulance A-02",
      type: "ambulance",
      lat: 23.012,
      lng: 72.548,
      status: "available",
      assigned_to: null,
    },
    {
      id: "amb-003",
      name: "Ambulance A-03",
      type: "ambulance",
      lat: 23.022,
      lng: 72.575,
      status: "assigned",
      assigned_to: "inc-002",
    },
    {
      id: "amb-004",
      name: "Ambulance A-04",
      type: "ambulance",
      lat: 22.989,
      lng: 72.61,
      status: "assigned",
      assigned_to: "inc-003",
    },
    {
      id: "amb-005",
      name: "Ambulance A-05",
      type: "ambulance",
      lat: 23.055,
      lng: 72.535,
      status: "available",
      assigned_to: null,
    },
    {
      id: "amb-006",
      name: "Ambulance A-06",
      type: "ambulance",
      lat: 23.001,
      lng: 72.575,
      status: "available",
      assigned_to: null,
    },
    {
      id: "amb-007",
      name: "Ambulance A-07",
      type: "ambulance",
      lat: 23.065,
      lng: 72.555,
      status: "unavailable",
      assigned_to: null,
    },
    {
      id: "amb-008",
      name: "Ambulance A-08",
      type: "ambulance",
      lat: 22.975,
      lng: 72.6,
      status: "available",
      assigned_to: null,
    },

    {
      id: "res-001",
      name: "Rescue Team R-01",
      type: "rescue_team",
      lat: 23.04,
      lng: 72.525,
      status: "assigned",
      assigned_to: "inc-001",
    },
    {
      id: "res-002",
      name: "Rescue Team R-02",
      type: "rescue_team",
      lat: 23.025,
      lng: 72.57,
      status: "assigned",
      assigned_to: "inc-002",
    },
    {
      id: "res-003",
      name: "Rescue Team R-03",
      type: "rescue_team",
      lat: 23.075,
      lng: 72.59,
      status: "available",
      assigned_to: null,
    },

    {
      id: "fire-001",
      name: "Fire Truck F-01",
      type: "fire_truck",
      lat: 23.028,
      lng: 72.555,
      status: "assigned",
      assigned_to: "inc-002",
    },
    {
      id: "fire-002",
      name: "Fire Truck F-02",
      type: "fire_truck",
      lat: 23.08,
      lng: 72.57,
      status: "available",
      assigned_to: null,
    },
  ],

  facilities: [
    {
      id: "shelter-001",
      name: "Ahmedabad Relief Shelter",
      type: "shelter",
      lat: 23.045,
      lng: 72.545,
      capacity: 300,
      occupied: 112,
    },
    {
      id: "shelter-002",
      name: "Navrangpura Community Shelter",
      type: "shelter",
      lat: 23.041,
      lng: 72.565,
      capacity: 200,
      occupied: 76,
    },
    {
      id: "shelter-003",
      name: "Maninagar Relief Shelter",
      type: "shelter",
      lat: 22.995,
      lng: 72.605,
      capacity: 250,
      occupied: 91,
    },

    {
      id: "hospital-001",
      name: "Sterling Hospital",
      type: "hospital",
      lat: 23.0468,
      lng: 72.5266,
      capacity: 500,
      occupied: 382,
    },
    {
      id: "hospital-002",
      name: "Civil Hospital Ahmedabad",
      type: "hospital",
      lat: 23.052,
      lng: 72.602,
      capacity: 1200,
      occupied: 945,
    },
    {
      id: "hospital-003",
      name: "LG Hospital",
      type: "hospital",
      lat: 22.995,
      lng: 72.603,
      capacity: 700,
      occupied: 514,
    },
  ],

  plan: {
    version: 1,
    assignments: [
      {
        incident_id: "inc-001",
        resource_id: "amb-001",
        eta_minutes: 6,
        reason:
          "Closest available ambulance with sufficient capacity for the reported casualties.",
      },
      {
        incident_id: "inc-001",
        resource_id: "res-001",
        eta_minutes: 8,
        reason:
          "Rescue team assigned because multiple vehicles are involved in the collision.",
      },
      {
        incident_id: "inc-002",
        resource_id: "fire-001",
        eta_minutes: 5,
        reason:
          "Nearest available fire truck with direct access to the Navrangpura incident.",
      },
      {
        incident_id: "inc-002",
        resource_id: "amb-003",
        eta_minutes: 7,
        reason:
          "Ambulance assigned to handle potential smoke inhalation and injuries.",
      },
      {
        incident_id: "inc-002",
        resource_id: "res-002",
        eta_minutes: 9,
        reason:
          "Rescue team assigned to assist with building evacuation.",
      },
      {
        incident_id: "inc-003",
        resource_id: "amb-004",
        eta_minutes: 4,
        reason:
          "Nearest available ambulance assigned because cardiac emergencies require rapid response.",
      },
    ],
    changes: [
      {
        change_type: "new_assignment",
        resource_id: "amb-001",
        from_incident: null,
        to_incident: "inc-001",
        reason:
          "New accident requires immediate ambulance coverage.",
      },
      {
        change_type: "new_assignment",
        resource_id: "fire-001",
        from_incident: null,
        to_incident: "inc-002",
        reason:
          "Building fire requires immediate fire suppression capability.",
      },
    ],
    summary:
      "Current plan prioritizes the critical SG Highway accident, active Navrangpura building fire, and cardiac emergency in Maninagar.",
  },

  approvals: [
    {
      id: "approval-001",
      incident_id: "inc-002",
      reason:
        "The closest fire truck is already committed to another operation.",
      proposed_action:
        "Reassign Fire Truck F-02 from standby coverage to the Navrangpura building fire.",
      status: "pending",
    },
  ],

  event_log: [
    "Initial emergency response plan created.",
    "SG Highway traffic accident detected.",
    "Navrangpura building fire detected.",
    "Maninagar cardiac emergency detected.",
    "Response resources assigned based on proximity and incident requirements.",
  ],

  step: 0,
};