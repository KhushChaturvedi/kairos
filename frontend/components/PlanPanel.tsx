"use client";

import type {
  Assignment,
  Incident,
  Resource,
} from "../lib/types";

type PlanPanelProps = {
  summary: string;
  assignments: Assignment[];
  incidents: Incident[];
  resources: Resource[];
};

export default function PlanPanel({
  summary,
  assignments,
  incidents,
  resources,
}: PlanPanelProps) {
  const incidentMap = new Map(
    incidents.map((incident) => [incident.id, incident]),
  );

  const resourceMap = new Map(
    resources.map((resource) => [resource.id, resource]),
  );

  return (
    <section
      style={{
        padding: "14px",
        background: "#0a141d",
        border: "1px solid #1d3040",
        borderRadius: "10px",
      }}
    >
      <h2
        style={{
          margin: "0 0 10px",
          color: "#f8fafc",
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
        }}
      >
        RESPONSE PLAN
      </h2>

      <div
        style={{
          marginBottom: "14px",
          padding: "10px",
          borderRadius: "7px",
          background: "#0d1822",
          color: "#aebdca",
          fontSize: "0.72rem",
          lineHeight: 1.5,
        }}
      >
        {summary}
      </div>

      {assignments.length === 0 ? (
        <div
          style={{
            padding: "18px 10px",
            textAlign: "center",
            color: "#71879a",
            fontSize: "0.8rem",
          }}
        >
          No resource assignments.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "9px",
            maxHeight: "330px",
            overflowY: "auto",
          }}
        >
          {assignments.map((assignment, index) => {
            const resource = resourceMap.get(
              assignment.resource_id,
            );

            const incident = incidentMap.get(
              assignment.incident_id,
            );

            return (
              <article
                key={`${assignment.resource_id}-${assignment.incident_id}-${index}`}
                style={{
                  padding: "10px",
                  border: "1px solid #1d3040",
                  borderRadius: "7px",
                  background: "#0d1822",
                }}
              >
                <div
                  style={{
                    color: "#dbeafe",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                  }}
                >
                  {resource?.name ?? assignment.resource_id}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#38bdf8",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  → {incident?.title ?? assignment.incident_id}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 6px",
                      borderRadius: "4px",
                      background: "#172635",
                      color: "#aebdca",
                      fontSize: "0.64rem",
                    }}
                  >
                    ETA {assignment.eta_minutes} min
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    color: "#8ea1b2",
                    fontSize: "0.68rem",
                    lineHeight: 1.45,
                  }}
                >
                  {assignment.reason}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}