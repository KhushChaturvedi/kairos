"use client";

import { FormEvent, useEffect, useState } from "react";

type PickedLocation = {
  lat: number;
  lng: number;
};

type EmergencyFormInput = {
  description: string;
  title?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

type EmergencyFormProps = {
  onSubmit: (input: EmergencyFormInput) => Promise<void>;
  submitting: boolean;
  pickedLocation: PickedLocation | null;
  onClearLocation: () => void;
};

export default function EmergencyForm({
  onSubmit,
  submitting,
  pickedLocation,
  onClearLocation,
}: EmergencyFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasDescription = description.trim().length > 0;

  useEffect(() => {
    if (!submitting) {
      setError(null);
    }
  }, [submitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasDescription || submitting) {
      return;
    }

    try {
      setError(null);

      await onSubmit({
        description: description.trim(),
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(pickedLocation
          ? {
              lat: pickedLocation.lat,
              lng: pickedLocation.lng,
            }
          : {}),
      });

      setTitle("");
      setDescription("");
      setAddress("");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to report the emergency.",
      );
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
        <div className="panel-title">REPORT EMERGENCY</div>

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
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title (optional)"
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

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the emergency..."
          rows={4}
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
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Area or landmark, e.g. Paldi, near Kankaria Lake"
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
            minHeight: "28px",
            fontSize: "0.72rem",
          }}
        >
          {pickedLocation ? (
            <>
              <div style={{ color: "#e6edf3" }}>
                Map pin: {pickedLocation.lat.toFixed(4)},{" "}
                {pickedLocation.lng.toFixed(4)}
              </div>

              <button
                type="button"
                onClick={onClearLocation}
                disabled={submitting}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#38bdf8",
                  padding: 0,
                  cursor: submitting ? "not-allowed" : "pointer",
                  textDecoration: "underline",
                  fontSize: "0.72rem",
                }}
              >
                clear
              </button>
            </>
          ) : (
            <div style={{ color: "#8ea1b2" }}>
              Optional: click the map to pin the exact location
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
          disabled={!hasDescription || submitting}
          style={{
            padding: "10px",
            border: "1px solid #0284c7",
            borderRadius: "6px",
            background:
              hasDescription && !submitting ? "#0284c7" : "#1b3445",
            color: "#fff",
            fontWeight: 700,
            cursor:
              hasDescription && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "Kairos is assessing..." : "REPORT EMERGENCY"}
        </button>
      </form>
    </section>
  );
}