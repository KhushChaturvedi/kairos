import { mockState } from "./mockState";
import type { State } from "./types";

const API_URL = "http://localhost:8000";

export const USE_MOCK = true;

let currentMockState: State = structuredClone(mockState);

const cloneState = (state: State): State => {
  return structuredClone(state);
};

export async function getState(): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  const response = await fetch(`${API_URL}/state`);

  if (!response.ok) {
    throw new Error(`Failed to fetch state: ${response.status}`);
  }

  return response.json();
}

export async function triggerEvent(): Promise<State> {
  if (USE_MOCK) {
    const nextState = cloneState(currentMockState);

    nextState.step += 1;
    nextState.plan.version += 1;

    nextState.event_log = [
      `Scripted event ${nextState.step} triggered.`,
      "AI response plan recalculated.",
      ...nextState.event_log,
    ];

    nextState.plan.summary =
      `Plan version ${nextState.plan.version}: response plan recalculated after the latest emergency event.`;

    currentMockState = nextState;

    return cloneState(currentMockState);
  }

  const response = await fetch(`${API_URL}/event`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger event: ${response.status}`);
  }

  return response.json();
}

export async function approve(
  approvalId: string,
  decision: "approve" | "reject",
): Promise<State> {
  if (USE_MOCK) {
    const nextState = cloneState(currentMockState);

    nextState.approvals = nextState.approvals.map((approval) => {
      if (approval.id !== approvalId) {
        return approval;
      }

      return {
        ...approval,
        status: decision === "approve" ? "approved" : "rejected",
      };
    });

    nextState.event_log = [
      `Approval ${approvalId} was ${decision}d.`,
      ...nextState.event_log,
    ];

    currentMockState = nextState;

    return cloneState(currentMockState);
  }

  const response = await fetch(`${API_URL}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      approval_id: approvalId,
      decision,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit approval: ${response.status}`);
  }

  return response.json();
}

export async function reset(): Promise<State> {
  if (USE_MOCK) {
    currentMockState = structuredClone(mockState);
    return cloneState(currentMockState);
  }

  const response = await fetch(`${API_URL}/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to reset state: ${response.status}`);
  }

  return response.json();
}