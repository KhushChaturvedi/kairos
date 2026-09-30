"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import IncidentFeed from "../components/IncidentFeed";
import ApprovalCards from "../components/ApprovalCards";
import ChangesPanel from "../components/ChangesPanel";
import PlanPanel from "../components/PlanPanel";
import EmergencyForm from "../components/EmergencyForm";
import { approve, getState, reset, triggerEvent } from "../lib/api";
import type { Incident, State } from "../lib/types";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

const emptyState: State = {
  incidents: [],
  resources: [],
  facilities: [],
  plan: {
    version: 0,
    assignments: [],
    changes: [],
    summary: "Loading response plan...",
  },
  approvals: [],
  event_log: [],
  step: 0,
};

export default function Home() {
  const [state, setState] = useState<State>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    try {
      setError(null);

      const nextState = await getState();

      setState(nextState);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Kairos state.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const handleTriggerEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const nextState = await triggerEvent();

      setState(nextState);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to trigger the next event.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError(null);

      const nextState = await reset();

      setState(nextState);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset Kairos.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (
    approvalId: string,
    decision: "approve" | "reject",
  ) => {
    try {
      setLoading(true);
      setError(null);

      const nextState = await approve(approvalId, decision);

      setState(nextState);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit approval decision.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySubmit = (incident: Incident) => {
    setState((currentState) => ({
      ...currentState,
      incidents: [incident, ...currentState.incidents],
      event_log: [
        `Manual emergency reported: ${incident.title}.`,
        ...currentState.event_log,
      ],
    }));
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#071018",
        color: "#e6edf3",
      }}
    >
      <TopBar
        planVersion={state.plan.version}
        loading={loading}
        onTriggerEvent={handleTriggerEvent}
        onReset={handleReset}
      />

      {error && (
        <div
          style={{
            margin: "12px 16px 0",
            padding: "10px 12px",
            border: "1px solid #991b1b",
            borderRadius: "7px",
            background: "#1f1115",
            color: "#fca5a5",
            fontSize: ".78rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(220px, 25%) minmax(400px, 50%) minmax(260px, 25%)",
          gap: "12px",
          padding: "12px",
          minHeight: "calc(100vh - 72px)",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 96px)",
          }}
        >
          <EmergencyForm onSubmit={handleEmergencySubmit} />

          <IncidentFeed incidents={state.incidents} />
        </div>

        <div
          style={{
            minWidth: 0,
            minHeight: "500px",
          }}
        >
          <MapView
            incidents={state.incidents}
            resources={state.resources}
            facilities={state.facilities}
          />
        </div>

        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 96px)",
          }}
        >
          <ApprovalCards
            approvals={state.approvals}
            loading={loading}
            onDecision={handleDecision}
          />

          <ChangesPanel changes={state.plan.changes} />

          <PlanPanel
            summary={state.plan.summary}
            assignments={state.plan.assignments}
            incidents={state.incidents}
            resources={state.resources}
          />
        </div>
      </div>
    </main>
  );
}