"use client";

import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility, Incident, Resource } from "../lib/types";

type MapViewProps = {
  incidents: Incident[];
  resources: Resource[];
  facilities: Facility[];
};

const AHMEDABAD_CENTER: [number, number] = [23.0225, 72.5714];

const severityColors: Record<number, string> = {
  1: "#22c55e",
  2: "#22c55e",
  3: "#facc15",
  4: "#f97316",
  5: "#ef4444",
};

const resourceColors: Record<Resource["type"], string> = {
  ambulance: "#38bdf8",
  rescue_team: "#a78bfa",
  fire_truck: "#fb7185",
};

function createResourceIcon(
  resource: Resource,
): L.DivIcon {
  const color =
    resource.status === "unavailable"
      ? "#64748b"
      : resourceColors[resource.type];

  const symbol =
    resource.type === "ambulance"
      ? "A"
      : resource.type === "rescue_team"
        ? "R"
        : "F";

  return L.divIcon({
    className: "kairos-resource-marker",
    html: `
      <div
        style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #071018;
          font-size: 12px;
          font-weight: 800;
        "
      >
        ${symbol}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function createFacilityIcon(
  facility: Facility,
): L.DivIcon {
  const isHospital = facility.type === "hospital";
  const color = isHospital ? "#f43f5e" : "#22c55e";
  const symbol = isHospital ? "H" : "S";

  return L.divIcon({
    className: "kairos-facility-marker",
    html: `
      <div
        style="
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #071018;
          font-size: 12px;
          font-weight: 800;
        "
      >
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [map]);

  return null;
}

export default function MapView({
  incidents,
  resources,
  facilities,
}: MapViewProps) {
  const incidentById = useMemo(() => {
    return new Map(incidents.map((incident) => [incident.id, incident]));
  }, [incidents]);

  const assignmentLines = useMemo(() => {
    return resources
      .filter(
        (resource) =>
          resource.status === "assigned" && resource.assigned_to,
      )
      .map((resource) => {
        const incident = incidentById.get(resource.assigned_to!);

        if (!incident) {
          return null;
        }

        return {
          resource,
          incident,
        };
      })
      .filter(
        (
          item,
        ): item is {
          resource: Resource;
          incident: Incident;
        } => item !== null,
      );
  }, [incidentById, resources]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        overflow: "hidden",
        border: "1px solid #1d3040",
        borderRadius: "10px",
        background: "#0d1822",
      }}
    >
      <MapContainer
        center={AHMEDABAD_CENTER}
        zoom={12}
        scrollWheelZoom
        style={{
          width: "100%",
          height: "100%",
          minHeight: "500px",
          background: "#dbeafe",
        }}
      >
        <MapResizeHandler />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) => (
          <CircleMarker
            key={incident.id}
            center={[incident.lat, incident.lng]}
            radius={10 + incident.severity * 2}
            pathOptions={{
              color: severityColors[incident.severity],
              fillColor: severityColors[incident.severity],
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: "220px" }}>
                <strong>{incident.title}</strong>

                <p style={{ margin: "8px 0" }}>
                  {incident.description}
                </p>

                <div>
                  <strong>Type:</strong> {incident.type}
                </div>

                <div>
                  <strong>Severity:</strong> {incident.severity}/5
                </div>

                <div>
                  <strong>People affected:</strong>{" "}
                  {incident.people_affected}
                </div>

                <div>
                  <strong>Status:</strong> {incident.status}
                </div>

                <div>
                  <strong>Needs:</strong>{" "}
                  {incident.needs.join(", ")}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {resources.map((resource) => (
          <Marker
            key={resource.id}
            position={[resource.lat, resource.lng]}
            icon={createResourceIcon(resource)}
          >
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <strong>{resource.name}</strong>

                <p style={{ margin: "8px 0" }}>
                  <strong>Type:</strong>{" "}
                  {resource.type.replace("_", " ")}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <strong>Status:</strong> {resource.status}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <strong>Assigned to:</strong>{" "}
                  {resource.assigned_to ?? "None"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lng]}
            icon={createFacilityIcon(facility)}
          >
            <Popup>
              <div style={{ minWidth: "190px" }}>
                <strong>{facility.name}</strong>

                <p style={{ margin: "8px 0" }}>
                  <strong>Type:</strong> {facility.type}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <strong>Capacity:</strong> {facility.capacity}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <strong>Occupied:</strong> {facility.occupied}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <strong>Available:</strong>{" "}
                  {facility.capacity - facility.occupied}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {assignmentLines.map(({ resource, incident }) => (
          <Polyline
            key={`${resource.id}-${incident.id}`}
            positions={[
              [resource.lat, resource.lng],
              [incident.lat, incident.lng],
            ]}
            pathOptions={{
              color: resourceColors[resource.type],
              weight: 3,
              opacity: 0.65,
              dashArray: "8 8",
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}