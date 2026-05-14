export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 130, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 300, height: 12, marginBottom: 20 }} />

      <div className="stats-row">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="stat-card" key={index}>
            <div className="skeleton" style={{ width: 84, height: 10, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 64, height: 28, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 96, height: 10 }} />
          </div>
        ))}
      </div>

      <div className="table-wrap" style={{ marginBottom: 16 }}>
        <div className="table-head" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="skeleton" key={index} style={{ width: 90, height: 10 }} />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="table-row" key={index} style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 9999 }} />
              <div className="skeleton" style={{ width: 100, height: 12 }} />
            </div>
            <div className="skeleton" style={{ width: 40, height: 12 }} />
            <div className="skeleton" style={{ width: 40, height: 12 }} />
            <div className="skeleton" style={{ width: 40, height: 12 }} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="skeleton" style={{ width: 140, height: 14 }} />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="wf-row" key={index}>
            <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "54%", height: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "70%", height: 10 }} />
            </div>
            <div className="skeleton" style={{ width: 68, height: 22, borderRadius: 9999 }} />
          </div>
        ))}
      </div>
    </div>
  )
}