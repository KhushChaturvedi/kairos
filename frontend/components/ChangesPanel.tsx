"use client";

import { useEffect, useState } from "react";
import type { Change } from "../lib/types";

type ChangesPanelProps = {
  changes: Change[];
};

function getChangeLabel(changeType: Change["change_type"]) {
  if (changeType === "new_assignment") {
    return "NEW ASSIGNMENT";
  }

  if (changeType === "reassigned") {
    return "REASSIGNED";
  }

  return "REMOVED";
}

function getChangeColor(changeType: Change["change_type"]) {
  if (changeType === "new_assignment") {
    return "#38bdf8";
  }

  if (changeType === "reassigned") {
    return "#facc15";
  }

  return "#ef4444";
}

export default function ChangesPanel({
  changes,
}: ChangesPanelProps) {
  const [highlighted, setHighlighted] = useState<string[]>([]);

  useEffect(() => {
    const changeKeys = changes.map(
      (change, index) =>
        `${change.resource_id}-${change.change_type}-${index}`,
    );

    setHighlighted(changeKeys);

    const timer = window.setTimeout(() => {
      setHighlighted([]);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [changes]);

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
          margin: "0 0 14px",
          color: "#f8fafc",
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
        }}
      >
        WHAT CHANGED
      </h2>

      {changes.length === 0 ? (
        <div
          style={{
            padding: "18px 10px",
            textAlign: "center",
            color: "#71879a",
            fontSize: "0.8rem",
          }}
        >
          No plan changes.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "9px",
          }}
        >
          {changes.map((change, index) => {
            const changeKey = `${change.resource_id}-${change.change_type}-${index}`;
            const color = getChangeColor(change.change_type);
            const isHighlighted =
              highlighted.includes(changeKey);

            return (
              <article
                key={changeKey}
                style={{
                  padding: "10px",
                  border: `1px solid ${
                    isHighlighted ? color : "#1d3040"
                  }`,
                  borderRadius: "7px",
                  background: isHighlighted
                    ? `${color}14`
                    : "#0d1822",
                  transition:
                    "background 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
                  boxShadow: isHighlighted
                    ? `0 0 14px ${color}22`
                    : "none",
                }}
              >
                <div
                  style={{
                    color,
                    fontSize: "0.64rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                  }}
                >
                  {getChangeLabel(change.change_type)}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    color: "#dbeafe",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                  }}
                >
                  Resource: {change.resource_id}
                </div>

                {change.from_incident && (
                  <div
                    style={{
                      marginTop: "4px",
                      color: "#8ea1b2",
                      fontSize: "0.7rem",
                    }}
                  >
                    From: {change.from_incident}
                  </div>
                )}

                {change.to_incident && (
                  <div
                    style={{
                      marginTop: "4px",
                      color: "#8ea1b2",
                      fontSize: "0.7rem",
                    }}
                  >
                    To: {change.to_incident}
                  </div>
                )}

                <div
                  style={{
                    marginTop: "7px",
                    color: "#aebdca",
                    fontSize: "0.7rem",
                    lineHeight: 1.45,
                  }}
                >
                  {change.reason}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}