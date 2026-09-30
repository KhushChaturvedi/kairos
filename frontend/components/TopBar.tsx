"use client";

type TopBarProps = {
  planVersion: number;
  loading: boolean;
  onTriggerEvent: () => void;
  onReset: () => void;
};

export default function TopBar({
  planVersion,
  loading,
  onTriggerEvent,
  onReset,
}: TopBarProps) {
  return (
    <header
      style={{
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid #1d3040",
        background: "#0a141d",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            letterSpacing: "0.16em",
            color: "#f8fafc",
          }}
        >
          KAIROS
        </div>

        <div
          style={{
            marginTop: "2px",
            fontSize: "0.7rem",
            color: "#71879a",
            letterSpacing: "0.08em",
          }}
        >
          AI EMERGENCY RESPONSE COMMAND
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            padding: "7px 11px",
            border: "1px solid #1d3040",
            borderRadius: "7px",
            background: "#0d1822",
            color: "#9fb2c1",
            fontSize: "0.8rem",
          }}
        >
          PLAN v{planVersion}
        </div>

        <button
          type="button"
          onClick={onTriggerEvent}
          disabled={loading}
          style={{
            border: "1px solid #0284c7",
            borderRadius: "7px",
            padding: "8px 13px",
            background: "#0369a1",
            color: "#ffffff",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : "Trigger Next Event"}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          style={{
            border: "1px solid #334155",
            borderRadius: "7px",
            padding: "8px 13px",
            background: "#111c27",
            color: "#d7e1e8",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Reset
        </button>
      </div>
    </header>
  );
}