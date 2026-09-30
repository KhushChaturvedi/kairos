"use client";

import type { Assignment, Incident, Resource } from "../lib/types";

type PlanPanelProps = {
  summary: string;
  assignments: Assignment[];
  resources: Resource[];
  incidents: Incident[];
};

function getResourceName(
  resources: Resource[],
  resourceId: string,
): string {
  return (
    resources.find((resource) => resource.id === resourceId)?.name ??
    resourceId
  );
}

function getIncidentTitle(
  incidents: Incident[],
  incidentId: string,
): string {
  return (
    incidents.find((incident) => incident.id === incidentId)?.title ??
    incidentId
  );
}

function renderSummary(summary: string) {
  const marker = "Awaiting resources";

  if (!summary.includes(marker)) {
    return summary;
  }

  const parts = summary.split(marker);

  return (
    <>
      {parts[0]}
      <span
        style={{
          color: "#f59e0b",
          fontWeight: 700,
        }}
      >
        {marker}
      </span>
      {parts.slice(1).join(marker)}
    </>
  );
}

export default function PlanPanel({
  summary,
  assignments,
  resources,
  incidents,
}: PlanPanelProps) {
  return (
    <section
      className="control-panel"
      style={{
        padding: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div className="panel-title">CURRENT PLAN</div>

        <div
          style={{
            color: "#8ea1b2",
            fontSize: "0.65rem",
          }}
        >
          {assignments.length} assignment
          {assignments.length === 1 ? "" : "s"}
        </div>
      </div>

      <div
        style={{
          padding: "10px",
          borderRadius: "7px",
          border: "1px solid #294052",
          background: "#0a141d",
          color: "#e6edf3",
          fontSize: "0.74rem",
          lineHeight: 1.5,
          marginBottom: "10px",
        }}
      >
        {summary || "All units on standby."}
      </div>

      {assignments.length === 0 ? (
        <div
          style={{
            color: "#8ea1b2",
            fontSize: "0.75rem",
            padding: "8px 0",
          }}
        >
          All units on standby.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "7px",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {assignments.map((assignment, index) => (
            <div
              key={`${assignment.incident_id}-${assignment.resource_id}-${index}`}
              style={{
                padding: "8px",
                border: "1px solid #223747",
                borderRadius: "6px",
                background: "#08121a",
              }}
            >
              <div
                style={{
                  color: "#f8fafc",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {getResourceName(
                  resources,
                  assignment.resource_id,
                )}
              </div>

              <div
                style={{
                  marginTop: "3px",
                  color: "#38bdf8",
                  fontSize: "0.68rem",
                  lineHeight: 1.35,
                }}
              >
                →{" "}
                {getIncidentTitle(
                  incidents,
                  assignment.incident_id,
                )}
              </div>

              <div
                style={{
                  marginTop: "4px",
                  color: "#8ea1b2",
                  fontSize: "0.64rem",
                  lineHeight: 1.4,
                }}
              >
                ETA: {assignment.eta_minutes.toFixed(1)} min
              </div>

              <div
                style={{
                  marginTop: "5px",
                  color: "#cbd5e1",
                  fontSize: "0.66rem",
                  lineHeight: 1.4,
                }}
              >
                {assignment.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}