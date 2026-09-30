"use client";

import { useEffect, useState } from "react";
import type { Change, Incident, Resource } from "../lib/types";

type ChangesPanelProps = {
  changes: Change[];
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
  incidentId: string | null,
): string {
  if (!incidentId) {
    return "None";
  }

  return (
    incidents.find((incident) => incident.id === incidentId)?.title ??
    incidentId
  );
}

function getChangeLabel(changeType: Change["change_type"]): string {
  if (changeType === "new_assignment") {
    return "NEW ASSIGNMENT";
  }

  if (changeType === "reassigned") {
    return "REASSIGNED";
  }

  return "REMOVED";
}

export default function ChangesPanel({
  changes,
  resources,
  incidents,
}: ChangesPanelProps) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (changes.length === 0) {
      return;
    }

    setFlash(true);

    const timer = window.setTimeout(() => {
      setFlash(false);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [changes]);

  return (
    <section
      className="control-panel"
      style={{
        padding: "14px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        borderColor: flash ? "#38bdf8" : undefined,
        boxShadow: flash ? "0 0 18px rgba(56, 189, 248, 0.18)" : "none",
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
        <div className="panel-title">WHAT CHANGED</div>

        {changes.length > 0 && (
          <div
            style={{
              color: "#38bdf8",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}
          >
            {changes.length} change{changes.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {changes.length === 0 ? (
        <div
          style={{
            color: "#8ea1b2",
            fontSize: "0.75rem",
            padding: "10px 0",
          }}
        >
          No changes yet
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "8px",
            maxHeight: "250px",
            overflowY: "auto",
          }}
        >
          {changes.map((change, index) => (
            <article
              key={`${change.resource_id}-${change.change_type}-${index}`}
              style={{
                padding: "9px",
                border: "1px solid #294052",
                borderRadius: "7px",
                background: "#0a141d",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}
                >
                  {getChangeLabel(change.change_type)}
                </div>

                <div
                  style={{
                    color: "#38bdf8",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                  }}
                >
                  {getResourceName(resources, change.resource_id)}
                </div>
              </div>

              <div
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.72rem",
                  lineHeight: 1.45,
                }}
              >
                {change.from_incident ? (
                  <>
                    <span style={{ color: "#8ea1b2" }}>From: </span>
                    {getIncidentTitle(
                      incidents,
                      change.from_incident,
                    )}
                  </>
                ) : (
                  <span style={{ color: "#8ea1b2" }}>
                    From: Unassigned
                  </span>
                )}

                <br />

                {change.to_incident ? (
                  <>
                    <span style={{ color: "#8ea1b2" }}>To: </span>
                    {getIncidentTitle(incidents, change.to_incident)}
                  </>
                ) : (
                  <span style={{ color: "#8ea1b2" }}>
                    To: Unassigned
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: "7px",
                  color: "#f8fafc",
                  fontSize: "0.72rem",
                  lineHeight: 1.45,
                }}
              >
                {change.reason}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}