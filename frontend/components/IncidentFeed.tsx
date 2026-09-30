"use client";

import type { Incident } from "../lib/types";

type IncidentFeedProps = {
  incidents: Incident[];
  onResolveIncident: (incidentId: string) => Promise<void>;
  busy: boolean;
};

function getSeverityColor(severity: Incident["severity"]): string {
  if (severity >= 5) return "#ef4444";
  if (severity >= 4) return "#f97316";
  if (severity >= 3) return "#f59e0b";
  return "#22c55e";
}

function getPeopleText(peopleAffected: number): string {
  if (peopleAffected === 0) {
    return "No people affected reported";
  }

  return `${peopleAffected} ${
    peopleAffected === 1 ? "person" : "people"
  } affected`;
}

export default function IncidentFeed({
  incidents,
  onResolveIncident,
  busy,
}: IncidentFeedProps) {
  const activeIncidents = incidents.filter(
    (incident) => incident.status === "active",
  );

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "resolved",
  );

  const orderedIncidents = [...activeIncidents, ...resolvedIncidents];

  return (
    <section className="control-panel" style={{ padding: "14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div className="panel-title">INCIDENT FEED</div>

        <div
          style={{
            fontSize: "0.7rem",
            color: "#8ea1b2",
          }}
        >
          {activeIncidents.length} active
        </div>
      </div>

      {orderedIncidents.length === 0 ? (
        <div
          style={{
            padding: "18px 10px",
            color: "#8ea1b2",
            fontSize: "0.78rem",
            lineHeight: 1.5,
            textAlign: "center",
            border: "1px dashed #294052",
            borderRadius: "7px",
          }}
        >
          No emergencies reported. Use the form above to report one.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "8px",
            maxHeight: "360px",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {orderedIncidents.map((incident) => {
            const isResolved = incident.status === "resolved";
            const severityColor = getSeverityColor(incident.severity);

            return (
              <article
                key={incident.id}
                style={{
                  border: `1px solid ${
                    isResolved ? "#253442" : "#294052"
                  }`,
                  borderLeft: `3px solid ${
                    isResolved ? "#475569" : severityColor
                  }`,
                  borderRadius: "7px",
                  padding: "10px",
                  background: isResolved ? "#0a141d" : "#0b1620",
                  opacity: isResolved ? 0.55 : 1,
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
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        color: isResolved ? "#94a3b8" : "#f8fafc",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      {incident.title}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#8ea1b2",
                        fontSize: "0.7rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {incident.description}
                    </div>
                  </div>

                  <div
                    style={{
                      flexShrink: 0,
                      color: isResolved ? "#64748b" : severityColor,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      border: `1px solid ${
                        isResolved ? "#334155" : severityColor
                      }`,
                      borderRadius: "999px",
                      padding: "3px 6px",
                    }}
                  >
                    S{incident.severity}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "8px",
                    color: "#8ea1b2",
                    fontSize: "0.66rem",
                  }}
                >
                  <span>
                    {incident.type.replace("_", " ").toUpperCase()}
                  </span>

                  <span>•</span>

                  <span>
                    {getPeopleText(incident.people_affected)}
                  </span>

                  {incident.address && (
                    <>
                      <span>•</span>

                      <span>{incident.address}</span>
                    </>
                  )}
                </div>

                {!isResolved ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void onResolveIncident(incident.id);
                    }}
                    style={{
                      marginTop: "9px",
                      padding: "5px 9px",
                      border: "1px solid #166534",
                      borderRadius: "5px",
                      background: busy ? "#1b3445" : "#10291d",
                      color: "#86efac",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      cursor: busy ? "not-allowed" : "pointer",
                    }}
                  >
                    Resolve
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: "8px",
                      color: "#64748b",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                    }}
                  >
                    RESOLVED
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}