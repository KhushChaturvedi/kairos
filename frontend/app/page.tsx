"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import ApprovalCards from "../components/ApprovalCards";
import ChangesPanel from "../components/ChangesPanel";
import EmergencyForm from "../components/EmergencyForm";
import EventLog from "../components/EventLog";
import IncidentFeed from "../components/IncidentFeed";
import PlanPanel from "../components/PlanPanel";
import TopBar from "../components/TopBar";

import {
  approve,
  getState,
  reportIncident,
  reset,
  resolveIncident,
  setResourceStatus,
  triggerEvent,
} from "../lib/api";

import type { State } from "../lib/types";

const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

type PickedLocation = {
  lat: number;
  lng: number;
};

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickedLocation, setPickedLocation] =
    useState<PickedLocation | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        setError(null);

        const result = await getState();

        if (!cancelled) {
          setState(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Kairos state.",
          );
        }
      }
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function runAction(fn: () => Promise<State>) {
    try {
      setBusy(true);
      setError(null);

      const result = await fn();

      setState(result);

      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Kairos could not complete the action.";

      setError(message);

      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function handleReport(input: {
    description: string;
    title?: string;
    address?: string;
    lat?: number;
    lng?: number;
  }) {
    await runAction(() => reportIncident(input));
    setPickedLocation(null);
  }

  async function handleResolveIncident(incidentId: string) {
    await runAction(() => resolveIncident(incidentId));
  }

  async function handleResourceStatus(
    resourceId: string,
    status: "available" | "unavailable",
  ) {
    await runAction(() =>
      setResourceStatus(resourceId, status),
    );
  }

  async function handleApprove(approvalId: string) {
    await runAction(() => approve(approvalId, "approve"));
  }

  async function handleReject(approvalId: string) {
    await runAction(() => approve(approvalId, "reject"));
  }

  async function handleNextDemoEvent() {
    await runAction(() => triggerEvent());
  }

  async function handleReset() {
    await runAction(async () => {
      const result = await reset();
      setPickedLocation(null);
      return result;
    });
  }

  if (!state) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "16px",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <div
          style={{
            maxWidth: "1800px",
            margin: "0 auto",
          }}
        >
          <TopBar
            planVersion={0}
            step={0}
            onTriggerEvent={handleNextDemoEvent}
            onReset={handleReset}
            busy={busy}
          />

          <div
            style={{
              marginTop: "14px",
              padding: "20px",
              border: "1px solid #1d3040",
              borderRadius: "10px",
              background: "#0d1822",
              color: "#8ea1b2",
              fontSize: "0.8rem",
            }}
          >
            {error ?? "Connecting to Kairos backend..."}
          </div>
        </div>
      </main>
    );
  }

  const pendingApprovals = state.approvals.filter(
    (approval) => approval.status === "pending",
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "12px",
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        style={{
          maxWidth: "1800px",
          margin: "0 auto",
          display: "grid",
          gap: "10px",
        }}
      >
        <TopBar
          planVersion={state.plan.version}
          step={state.step}
          onTriggerEvent={handleNextDemoEvent}
          onReset={handleReset}
          busy={busy}
        />

        <section
          className="control-panel"
          style={{
            padding: "10px 14px",
            borderColor:
              state.plan.summary.includes("Awaiting resources")
                ? "#7c4a03"
                : undefined,
            background:
              state.plan.summary.includes("Awaiting resources")
                ? "#171207"
                : undefined,
          }}
        >
          <div
            style={{
              color: "#8ea1b2",
              fontSize: "0.62rem",
              letterSpacing: "0.08em",
              marginBottom: "4px",
            }}
          >
            CURRENT RESPONSE STATUS
          </div>

          <div
            style={{
              color: "#e6edf3",
              fontSize: "0.82rem",
              lineHeight: 1.45,
            }}
          >
            {state.plan.summary}
          </div>
        </section>

        {error && (
          <div
            style={{
              padding: "9px 12px",
              border: "1px solid #991b1b",
              borderRadius: "7px",
              background: "#1f1115",
              color: "#fca5a5",
              fontSize: "0.72rem",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(240px, 25%) minmax(420px, 50%) minmax(240px, 25%)",
            gap: "10px",
            alignItems: "start",
          }}
        >
          <aside
            style={{
              display: "grid",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <EmergencyForm
              onSubmit={handleReport}
              submitting={busy}
              pickedLocation={pickedLocation}
              onClearLocation={() => setPickedLocation(null)}
            />

            <IncidentFeed
              incidents={state.incidents}
              onResolveIncident={handleResolveIncident}
              busy={busy}
            />
          </aside>

          <section
            style={{
              minWidth: 0,
              minHeight: "520px",
            }}
          >
            <MapView
              incidents={state.incidents}
              resources={state.resources}
              assignments={state.plan.assignments}
              onMapClick={(lat, lng) => {
                setPickedLocation({ lat, lng });
              }}
              pickedLocation={pickedLocation}
              onResolveIncident={handleResolveIncident}
              onSetResourceStatus={handleResourceStatus}
              busy={busy}
            />
          </section>

          <aside
            style={{
              display: "grid",
              gap: "10px",
              minWidth: 0,
            }}
          >
            <ApprovalCards
              approvals={pendingApprovals}
              incidents={state.incidents}
              resources={state.resources}
              onApprove={handleApprove}
              onReject={handleReject}
              busy={busy}
            />

            <ChangesPanel
              changes={state.plan.changes}
              resources={state.resources}
              incidents={state.incidents}
            />

            <PlanPanel
              summary={state.plan.summary}
              assignments={state.plan.assignments}
              resources={state.resources}
              incidents={state.incidents}
            />

            <EventLog events={state.event_log} />
          </aside>
        </section>
      </div>
    </main>
  );
}