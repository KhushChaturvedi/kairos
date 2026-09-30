"use client";

import type { Approval, Incident, Resource } from "../lib/types";

type ApprovalCardsProps = {
  approvals: Approval[];
  incidents: Incident[];
  resources: Resource[];
  onApprove: (approvalId: string) => Promise<void>;
  onReject: (approvalId: string) => Promise<void>;
  busy: boolean;
};

function getIncidentTitle(
  incidents: Incident[],
  incidentId: string,
): string {
  return (
    incidents.find((incident) => incident.id === incidentId)?.title ??
    incidentId
  );
}

function findResourceNames(
  resources: Resource[],
  text: string,
): string[] {
  return resources
    .filter(
      (resource) =>
        text.includes(resource.id) ||
        text.includes(resource.name),
    )
    .map((resource) => resource.name);
}

function getReadableAction(
  proposedAction: string,
  resources: Resource[],
): string {
  let result = proposedAction;

  for (const resource of resources) {
    result = result.replaceAll(resource.id, resource.name);
  }

  return result;
}

export default function ApprovalCards({
  approvals,
  incidents,
  resources,
  onApprove,
  onReject,
  busy,
}: ApprovalCardsProps) {
  const pendingApprovals = approvals.filter(
    (approval) => approval.status === "pending",
  );

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
        <div className="panel-title">DECISIONS PENDING</div>

        {pendingApprovals.length > 0 && (
          <div
            style={{
              color: "#f59e0b",
              fontSize: "0.65rem",
              fontWeight: 700,
            }}
          >
            ACTION REQUIRED
          </div>
        )}
      </div>

      {pendingApprovals.length === 0 ? (
        <div
          style={{
            color: "#8ea1b2",
            fontSize: "0.75rem",
            padding: "10px 0",
          }}
        >
          No decisions pending
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "9px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {pendingApprovals.map((approval) => {
            const referencedResources = findResourceNames(
              resources,
              `${approval.reason} ${approval.proposed_action}`,
            );

            return (
              <article
                key={approval.id}
                style={{
                  padding: "10px",
                  border: "1px solid #7c4a03",
                  borderRadius: "7px",
                  background: "#171207",
                }}
              >
                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    lineHeight: 1.35,
                  }}
                >
                  {getIncidentTitle(
                    incidents,
                    approval.incident_id,
                  )}
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    color: "#f59e0b",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  {approval.reason}
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    color: "#cbd5e1",
                    fontSize: "0.7rem",
                    lineHeight: 1.45,
                  }}
                >
                  {getReadableAction(
                    approval.proposed_action,
                    resources,
                  )}
                </div>

                {referencedResources.length > 0 && (
                  <div
                    style={{
                      marginTop: "7px",
                      color: "#8ea1b2",
                      fontSize: "0.65rem",
                    }}
                  >
                    Resources: {referencedResources.join(", ")}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "7px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void onApprove(approval.id);
                    }}
                    style={{
                      padding: "7px",
                      border: "1px solid #166534",
                      borderRadius: "5px",
                      background: busy ? "#1b3445" : "#12301f",
                      color: "#86efac",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: busy ? "not-allowed" : "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      void onReject(approval.id);
                    }}
                    style={{
                      padding: "7px",
                      border: "1px solid #991b1b",
                      borderRadius: "5px",
                      background: busy ? "#1b3445" : "#301315",
                      color: "#fca5a5",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: busy ? "not-allowed" : "pointer",
                    }}
                  >
                    Reject
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}