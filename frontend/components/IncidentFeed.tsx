"use client";

import type { Incident } from "../lib/types";

type IncidentFeedProps = {
  incidents: Incident[];
};

const severityColors: Record<number, string> = {
  1: "#22c55e",
  2: "#22c55e",
  3: "#facc15",
  4: "#f97316",
  5: "#ef4444",
};

const severityLabels: Record<number, string> = {
  1: "LOW",
  2: "LOW",
  3: "MEDIUM",
  4: "HIGH",
  5: "CRITICAL",
};

export default function IncidentFeed({
  incidents,
}: IncidentFeedProps) {
  return (
    <section
      style={{
        height: "100%",
        minHeight: "500px",
        overflowY: "auto",
        padding: "14px",
        background: "#0a141d",
        border: "1px solid #1d3040",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#f8fafc",
            fontSize: "0.95rem",
            letterSpacing: "0.05em",
          }}
        >
          INCIDENT FEED
        </h2>

        <span
          style={{
            padding: "3px 8px",
            borderRadius: "999px",
            background: "#172635",
            color: "#8ea1b2",
            fontSize: "0.7rem",
          }}
        >
          {incidents.length} TOTAL
        </span>
      </div>

      {incidents.length === 0 ? (
        <div
          style={{
            padding: "20px 10px",
            textAlign: "center",
            color: "#71879a",
            fontSize: "0.85rem",
          }}
        >
          No incidents reported.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {incidents.map((incident) => {
            const severityColor =
              severityColors[incident.severity];

            return (
              <article
                key={incident.id}
                style={{
                  padding: "12px",
                  border: "1px solid #1d3040",
                  borderLeft: `4px solid ${severityColor}`,
                  borderRadius: "8px",
                  background: "#0d1822",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#f1f5f9",
                      fontSize: "0.88rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {incident.title}
                  </h3>

                  <span
                    style={{
                      flexShrink: 0,
                      padding: "3px 6px",
                      borderRadius: "5px",
                      background: `${severityColor}22`,
                      color: severityColor,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                    }}
                  >
                    {severityLabels[incident.severity]}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "9px",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 7px",
                      borderRadius: "4px",
                      background: "#172635",
                      color: "#aebdca",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {incident.type.replace("_", " ")}
                  </span>

                  <span
                    style={{
                      padding: "3px 7px",
                      borderRadius: "4px",
                      background:
                        incident.status === "active"
                          ? "#14532d"
                          : "#334155",
                      color:
                        incident.status === "active"
                          ? "#86efac"
                          : "#cbd5e1",
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {incident.status}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    color: "#8ea1b2",
                    fontSize: "0.72rem",
                  }}
                >
                  People affected:{" "}
                  <strong style={{ color: "#dbeafe" }}>
                    {incident.people_affected}
                  </strong>
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#8ea1b2",
                    fontSize: "0.72rem",
                  }}
                >
                  Needs:{" "}
                  <span style={{ color: "#cbd5e1" }}>
                    {incident.needs.join(", ")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}