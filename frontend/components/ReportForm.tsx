"use client";

import { FormEvent, useState } from "react";

type ReportFormProps = {
  selectedLocation: {
    lat: number;
    lng: number;
  } | null;
  onSubmit: (
    description: string,
    address?: string,
    lat?: number,
    lng?: number,
  ) => Promise<void>;
};

export default function ReportForm({
  selectedLocation,
  onSubmit,
}: ReportFormProps) {
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasDescription = description.trim().length > 0;
  const hasLocation =
    Boolean(selectedLocation) || address.trim().length > 0;

  const canSubmit =
    hasDescription && hasLocation && !submitting;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await onSubmit(
        description.trim(),
        address.trim() || undefined,
        selectedLocation?.lat,
        selectedLocation?.lng,
      );

      setDescription("");
      setAddress("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to report the emergency.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="panel-title">
          REPORT EMERGENCY
        </div>

        <div
          style={{
            fontSize: "0.65rem",
            color: "#38bdf8",
            border: "1px solid #1d4ed8",
            borderRadius: "999px",
            padding: "4px 8px",
          }}
        >
          OPERATOR INPUT
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "9px",
        }}
      >
        <textarea
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Describe the emergency..."
          rows={3}
          disabled={submitting}
          required
          style={{
            width: "100%",
            padding: "9px",
            background: "#08121a",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#e6edf3",
            resize: "vertical",
            outline: "none",
          }}
        />

        <input
          value={address}
          onChange={(event) =>
            setAddress(event.target.value)
          }
          placeholder="Address (optional), e.g. Paldi"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "9px",
            background: "#08121a",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#e6edf3",
            outline: "none",
          }}
        />

        <div
          style={{
            padding: "9px",
            borderRadius: "6px",
            border: "1px solid #294052",
            background: "#08121a",
            fontSize: "0.72rem",
          }}
        >
          <div
            style={{
              color: "#8ea1b2",
              marginBottom: "4px",
            }}
          >
            MAP LOCATION
          </div>

          {selectedLocation ? (
            <div style={{ color: "#e6edf3" }}>
              {selectedLocation.lat.toFixed(5)},{" "}
              {selectedLocation.lng.toFixed(5)}
            </div>
          ) : (
            <div style={{ color: "#f59e0b" }}>
              Click on the map to set location
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #991b1b",
              background: "#1f1115",
              color: "#fca5a5",
              fontSize: "0.72rem",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: "10px",
            border: "1px solid #0284c7",
            borderRadius: "6px",
            background: canSubmit ? "#0284c7" : "#1b3445",
            color: "#ffffff",
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {submitting
            ? "Kairos is assessing..."
            : "REPORT EMERGENCY"}
        </button>
      </form>
    </section>
  );
}