"use client";

type EventLogProps = {
  events: string[];
};

export default function EventLog({ events }: EventLogProps) {
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
        <div className="panel-title">EVENT LOG</div>

        <div
          style={{
            color: "#8ea1b2",
            fontSize: "0.65rem",
          }}
        >
          {events.length} event{events.length === 1 ? "" : "s"}
        </div>
      </div>

      {events.length === 0 ? (
        <div
          style={{
            color: "#8ea1b2",
            fontSize: "0.75rem",
            padding: "8px 0",
          }}
        >
          No events yet.
        </div>
      ) : (
        <div
          style={{
            maxHeight: "220px",
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "8px",
            }}
          >
            {events.map((event, index) => (
              <div
                key={`${event}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "10px 1fr",
                  gap: "8px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: "7px",
                    height: "7px",
                    marginTop: "5px",
                    borderRadius: "50%",
                    background:
                      index === 0 ? "#38bdf8" : "#38576d",
                    boxShadow:
                      index === 0
                        ? "0 0 7px rgba(56, 189, 248, 0.45)"
                        : "none",
                  }}
                />

                <div
                  style={{
                    color: index === 0 ? "#e6edf3" : "#8ea1b2",
                    fontSize: "0.68rem",
                    lineHeight: 1.45,
                  }}
                >
                  {event}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}