export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 150, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 280, height: 12, marginBottom: 20 }} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="skeleton" key={index} style={{ width: 120, height: 32, borderRadius: 9999 }} />
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: 90, height: 14, marginBottom: 16 }} />

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, alignItems: "start" }}>
          <div>
            <div className="skeleton" style={{ width: 120, height: 120, borderRadius: "50%", marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 118, height: 32, borderRadius: 10 }} />
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <div className="skeleton" style={{ width: 58, height: 10, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "100%", height: 36 }} />
            </div>
            <div>
              <div className="skeleton" style={{ width: 54, height: 10, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "100%", height: 36 }} />
            </div>
            <div className="skeleton" style={{ width: 240, height: 22 }} />
          </div>
        </div>
      </div>
    </div>
  )
}