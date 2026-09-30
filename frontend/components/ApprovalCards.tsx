"use client";

import type { Approval } from "../lib/types";

type ApprovalCardsProps = {
  approvals: Approval[];
  loading: boolean;
  onDecision: (
    approvalId: string,
    decision: "approve" | "reject",
  ) => void;
};

export default function ApprovalCards({
  approvals,
  loading,
  onDecision,
}: ApprovalCardsProps) {
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "pending",
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
          APPROVAL REQUIRED
        </h2>

        <span
          style={{
            padding: "3px 8px",
            borderRadius: "999px",
            background:
              pendingApprovals.length > 0
                ? "#7f1d1d"
                : "#172635",
            color:
              pendingApprovals.length > 0
                ? "#fca5a5"
                : "#8ea1b2",
            fontSize: "0.7rem",
            fontWeight: 700,
          }}
        >
          {pendingApprovals.length}
        </span>
      </div>

      {pendingApprovals.length === 0 ? (
        <div
          style={{
            padding: "18px 10px",
            textAlign: "center",
            color: "#71879a",
            fontSize: "0.8rem",
          }}
        >
          No decisions require operator approval.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {pendingApprovals.map((approval) => (
            <article
              key={approval.id}
              style={{
                padding: "12px",
                border: "1px solid #7f1d1d",
                borderRadius: "8px",
                background: "#1a1115",
              }}
            >
              <div
                style={{
                  color: "#fca5a5",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                }}
              >
                RISKY DECISION
              </div>

              <h3
                style={{
                  margin: "7px 0 8px",
                  color: "#f1f5f9",
                  fontSize: "0.86rem",
                  lineHeight: 1.35,
                }}
              >
                {approval.proposed_action}
              </h3>

              <div
                style={{
                  marginBottom: "10px",
                  color: "#aebdca",
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "#dbeafe" }}>
                  Why:
                </strong>{" "}
                {approval.reason}
              </div>

              <div
                style={{
                  marginBottom: "12px",
                  color: "#71879a",
                  fontSize: "0.68rem",
                }}
              >
                Incident: {approval.incident_id}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    onDecision(approval.id, "approve")
                  }
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #15803d",
                    borderRadius: "6px",
                    background: "#166534",
                    color: "#dcfce7",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Approve
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    onDecision(approval.id, "reject")
                  }
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #b91c1c",
                    borderRadius: "6px",
                    background: "#991b1b",
                    color: "#fee2e2",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}