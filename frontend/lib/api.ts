import { mockState } from "./mockState";
import type { State } from "./types";

const API_URL = "http://localhost:8000";

export const USE_MOCK = false;

let currentMockState: State = structuredClone(mockState);

const cloneState = (state: State): State => {
  return structuredClone(state);
};

async function postJSON(
  path: string,
  body?: Record<string, unknown>,
): Promise<State> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Backend offline. Start the Kairos backend on port 8000.",
      );
    }

    throw error;
  }
}

export async function getState(): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  try {
    const response = await fetch(`${API_URL}/state`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Backend offline. Start the Kairos backend on port 8000.",
      );
    }

    throw error;
  }
}

type ReportIncidentInput = {
  description: string;
  title?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export async function reportIncident(
  input: ReportIncidentInput,
): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  const body: Record<string, unknown> = {
    description: input.description,
  };

  if (input.title?.trim()) {
    body.title = input.title.trim();
  }

  if (input.address?.trim()) {
    body.address = input.address.trim();
  }

  if (input.lat !== undefined) {
    body.lat = input.lat;
  }

  if (input.lng !== undefined) {
    body.lng = input.lng;
  }

  return postJSON("/report", body);
}

export async function resolveIncident(
  incidentId: string,
): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  return postJSON("/resolve", {
    incident_id: incidentId,
  });
}

export async function setResourceStatus(
  resourceId: string,
  status: "available" | "unavailable",
): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  return postJSON("/resource-status", {
    resource_id: resourceId,
    status,
  });
}

export async function approve(
  approvalId: string,
  decision: "approve" | "reject",
): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  return postJSON("/approve", {
    approval_id: approvalId,
    decision,
  });
}

export async function triggerEvent(): Promise<State> {
  if (USE_MOCK) {
    return cloneState(currentMockState);
  }

  return postJSON("/event");
}

export async function reset(): Promise<State> {
  if (USE_MOCK) {
    currentMockState = structuredClone(mockState);
    return cloneState(currentMockState);
  }

  return postJSON("/reset");
}