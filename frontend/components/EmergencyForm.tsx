"use client";

import { FormEvent, useState } from "react";
import type { Incident } from "../lib/types";

type EmergencyFormProps = {
  onSubmit: (incident: Incident) => void;
};

export default function EmergencyForm({
  onSubmit,
}: EmergencyFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] =
    useState<Incident["type"]>("accident");
  const [severity, setSeverity] =
    useState<Incident["severity"]>(3);

  const [address, setAddress] = useState("");

  const [peopleAffected, setPeopleAffected] = useState("");
  const [needs, setNeeds] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const incident: Incident = {
      id: `manual-${Date.now()}`,
      title,
      description: `${description} Location: ${address}`,
      type,
      severity,

      // Temporary Ahmedabad coordinates.
      // Step 36 will replace these with coordinates
      // automatically generated from the address.
      lat: 23.0225,
      lng: 72.5714,

      people_affected: Number(peopleAffected),

      needs: needs
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      status: "active",
    };

    onSubmit(incident);

    setTitle("");
    setDescription("");
    setType("accident");
    setSeverity(3);
    setAddress("");
    setPeopleAffected("");
    setNeeds("");
  };

  return (
    <div className="control-panel" style={{ padding: "16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div className="panel-title">
          REPORT NEW EMERGENCY
        </div>

        <div
          style={{
            fontSize: "0.68rem",
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
          gap: "10px",
        }}
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Emergency title"
          required
          style={{
            width: "100%",
            padding: "10px",
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
          placeholder="Describe the emergency"
          required
          rows={3}
          style={{
            width: "100%",
            padding: "10px",
            background: "#08121a",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#e6edf3",
            resize: "vertical",
            outline: "none",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as Incident["type"])
            }
            style={{
              width: "100%",
              padding: "10px",
              background: "#08121a",
              border: "1px solid #294052",
              borderRadius: "6px",
              color: "#e6edf3",
            }}
          >
            <option value="accident">Accident</option>
            <option value="fire">Fire</option>
            <option value="medical">Medical</option>
            <option value="evacuation">Evacuation</option>
            <option value="gas_leak">Gas Leak</option>
          </select>

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                Number(event.target.value) as Incident["severity"],
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              background: "#08121a",
              border: "1px solid #294052",
              borderRadius: "6px",
              color: "#e6edf3",
            }}
          >
            <option value={1}>Severity 1 — Low</option>
            <option value={2}>Severity 2 — Low</option>
            <option value={3}>Severity 3 — Medium</option>
            <option value={4}>Severity 4 — High</option>
            <option value={5}>Severity 5 — Critical</option>
          </select>
        </div>

        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Emergency address, e.g. SG Highway, Ahmedabad"
          required
          style={{
            width: "100%",
            padding: "10px",
            background: "#08121a",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#e6edf3",
            outline: "none",
          }}
        />

        <input
          type="number"
          min="1"
          value={peopleAffected}
          onChange={(event) =>
            setPeopleAffected(event.target.value)
          }
          placeholder="Number of people affected"
          required
          style={{
            width: "100%",
            padding: "10px",
            background: "#08121a",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#e6edf3",
            outline: "none",
          }}
        />

        <input
          value={needs}
          onChange={(event) => setNeeds(event.target.value)}
          placeholder="Needs, e.g. ambulance, rescue_team"
          style={{
            width: "100%",
            padding: "10px",
            background: "#08121a",
            border: "1px solid #294052",
            borderRadius: "6px",
            color: "#e6edf3",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "4px",
            padding: "11px",
            border: "1px solid #0284c7",
            borderRadius: "6px",
            background: "#0284c7",
            color: "#ffffff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          REPORT EMERGENCY
        </button>
      </form>
    </div>
  );
}