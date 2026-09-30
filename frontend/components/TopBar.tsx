"use client";

type TopBarProps = {
  planVersion: number;
  step: number;
  onTriggerEvent: () => Promise<void>;
  onReset: () => Promise<void>;
  busy: boolean;
};

export default function TopBar({
  planVersion,
  step,
  onTriggerEvent,
  onReset,
  busy,
}: TopBarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "12px 16px",
        background: "#0b1620",
        border: "1px solid #1d3040",
        borderRadius: "10px",
        minHeight: "58px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 9px rgba(34, 197, 94, 0.55)",
            flexShrink: 0,
          }}
        />

        <div
          style={{
            minWidth: 0,
          }}
        >
          <div
            style={{
              color: "#f8fafc",
              fontSize: "1rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              lineHeight: 1.1,
            }}
          >
            KAIROS
          </div>

          <div
            style={{
              color: "#8ea1b2",
              fontSize: "0.62rem",
              marginTop: "3px",
              letterSpacing: "0.05em",
            }}
          >
            EMERGENCY RESPONSE COMMAND
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            padding: "6px 9px",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#cbd5e1",
            fontSize: "0.68rem",
            fontWeight: 700,
          }}
        >
          PLAN V{planVersion}
        </div>

        <div
          style={{
            padding: "6px 9px",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#8ea1b2",
            fontSize: "0.68rem",
          }}
        >
          STEP {step}
        </div>

        <button
          type="button"
          title="Plays the next step of the demo scenario"
          disabled={busy}
          onClick={() => {
            void onTriggerEvent();
          }}
          style={{
            padding: "6px 9px",
            border: "1px solid #294052",
            borderRadius: "6px",
            background: busy ? "#142532" : "#101e29",
            color: "#94a3b8",
            fontSize: "0.68rem",
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          Next Demo Event
        </button>

        <button
          type="button"
          title="Clears all incidents and starts with an empty city"
          disabled={busy}
          onClick={() => {
            void onReset();
          }}
          style={{
            padding: "6px 10px",
            border: "1px solid #7f1d1d",
            borderRadius: "6px",
            background: busy ? "#24151a" : "#211216",
            color: "#fca5a5",
            fontSize: "0.68rem",
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </header>
  );
}