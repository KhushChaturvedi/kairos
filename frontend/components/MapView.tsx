"use client";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { Incident, Resource } from "../lib/types";

type PickedLocation = {
  lat: number;
  lng: number;
};

type MapViewProps = {
  incidents: Incident[];
  resources: Resource[];
  assignments: {
    incident_id: string;
    resource_id: string;
    eta_minutes: number;
    reason: string;
  }[];
  onMapClick: (lat: number, lng: number) => void;
  pickedLocation: PickedLocation | null;
  onResolveIncident: (incidentId: string) => Promise<void>;
  onSetResourceStatus: (
    resourceId: string,
    status: "available" | "unavailable",
  ) => Promise<void>;
  busy: boolean;
};

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function getIncidentColor(incident: Incident): string {
  if (incident.status === "resolved") {
    return "#64748b";
  }

  if (incident.severity >= 5) {
    return "#ef4444";
  }

  if (incident.severity >= 4) {
    return "#f97316";
  }

  if (incident.severity >= 3) {
    return "#f59e0b";
  }

  return "#22c55e";
}

function getResourceColor(resource: Resource): string {
  if (resource.status === "unavailable") {
    return "#64748b";
  }

  if (resource.status === "assigned") {
    return "#38bdf8";
  }

  return "#22c55e";
}

function getIncidentById(
  incidents: Incident[],
  incidentId: string,
): Incident | undefined {
  return incidents.find((incident) => incident.id === incidentId);
}

function getResourceById(
  resources: Resource[],
  resourceId: string,
): Resource | undefined {
  return resources.find((resource) => resource.id === resourceId);
}

export default function MapView({
  incidents,
  resources,
  assignments,
  onMapClick,
  pickedLocation,
  onResolveIncident,
  onSetResourceStatus,
  busy,
}: MapViewProps) {
  const center: LatLngExpression = [23.0225, 72.5714];

  const activeIncidents = incidents.filter(
    (incident) => incident.status === "active",
  );

  const activeIncidentIds = new Set(
    activeIncidents.map((incident) => incident.id),
  );

  const activeAssignments = assignments.filter((assignment) =>
    activeIncidentIds.has(assignment.incident_id),
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "520px",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1d3040",
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{
          width: "100%",
          height: "100%",
          minHeight: "520px",
          background: "#08121a",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />

        {pickedLocation && (
          <CircleMarker
            center={[pickedLocation.lat, pickedLocation.lng]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#ffffff",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div
                style={{
                  minWidth: "150px",
                  fontSize: "12px",
                }}
              >
                <strong>Selected location</strong>
                <div style={{ marginTop: "4px" }}>
                  {pickedLocation.lat.toFixed(5)},{" "}
                  {pickedLocation.lng.toFixed(5)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {incidents.map((incident) => {
          const color = getIncidentColor(incident);

          return (
            <CircleMarker
              key={incident.id}
              center={[incident.lat, incident.lng]}
              radius={incident.status === "resolved" ? 8 : 10}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity:
                  incident.status === "resolved" ? 0.35 : 0.8,
                weight: 2,
              }}
            >
              <Popup>
                <div
                  style={{
                    minWidth: "210px",
                    fontSize: "12px",
                    color: "#111827",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    {incident.title}
                  </div>

                  <div style={{ marginBottom: "4px" }}>
                    {incident.description}
                  </div>

                  <div style={{ marginBottom: "4px" }}>
                    Severity: {incident.severity}
                  </div>

                  <div style={{ marginBottom: "4px" }}>
                    Status: {incident.status}
                  </div>

                  {incident.address && (
                    <div style={{ marginBottom: "7px" }}>
                      Address: {incident.address}
                    </div>
                  )}

                  {incident.status === "active" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        void onResolveIncident(incident.id);
                      }}
                      style={{
                        width: "100%",
                        padding: "7px 9px",
                        border: "1px solid #16a34a",
                        borderRadius: "5px",
                        background: busy ? "#d1d5db" : "#16a34a",
                        color: "#ffffff",
                        fontWeight: 700,
                        cursor: busy ? "not-allowed" : "pointer",
                      }}
                    >
                      Mark resolved
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {resources.map((resource: Resource) => {
          const assignedIncident = resource.assigned_to
            ? getIncidentById(incidents, resource.assigned_to)
            : undefined;

          const color = getResourceColor(resource);

          return (
            <CircleMarker
              key={resource.id}
              center={[resource.lat, resource.lng]}
              radius={6}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: resource.status === "unavailable" ? 0.35 : 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div
                  style={{
                    minWidth: "190px",
                    fontSize: "12px",
                    color: "#111827",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "5px",
                    }}
                  >
                    {resource.name}
                  </div>

                  <div style={{ marginBottom: "4px" }}>
                    Status: {resource.status}
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    Assigned to:{" "}
                    {assignedIncident
                      ? assignedIncident.title
                      : "None"}
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void onSetResourceStatus(
                        resource.id,
                        resource.status === "unavailable"
                          ? "available"
                          : "unavailable",
                      );
                    }}
                    style={{
                      width: "100%",
                      padding: "7px 9px",
                      border: "1px solid #334155",
                      borderRadius: "5px",
                      background: busy ? "#d1d5db" : "#334155",
                      color: "#ffffff",
                      fontWeight: 700,
                      cursor: busy ? "not-allowed" : "pointer",
                    }}
                  >
                    {resource.status === "unavailable"
                      ? "Back in service"
                      : "Mark out of service"}
                  </button>

                  {resource.status === "unavailable" && (
                    <div
                      style={{
                        marginTop: "7px",
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      Out of service
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {activeAssignments.map((assignment) => {
          const incident = getIncidentById(
            incidents,
            assignment.incident_id,
          );

          const resource = getResourceById(
            resources,
            assignment.resource_id,
          );

          if (!incident || !resource) {
            return null;
          }

          return (
            <Polyline
              key={`${assignment.incident_id}-${assignment.resource_id}`}
              positions={[
                [resource.lat, resource.lng],
                [incident.lat, incident.lng],
              ]}
              pathOptions={{
                color: "#38bdf8",
                weight: 2,
                opacity: 0.7,
                dashArray: "6 6",
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}