export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 140, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 280, height: 12, marginBottom: 20 }} />

      <div className="stats-row">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="stat-card" key={index}>
            <div className="skeleton" style={{ width: 90, height: 10, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 68, height: 28, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 110, height: 10 }} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="skeleton" style={{ width: 120, height: 14 }} />
          <div className="skeleton" style={{ width: 120, height: 32 }} />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="table-row" key={index}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
              <div>
                <div className="skeleton" style={{ width: 120, height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 80, height: 10 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: 50, height: 12 }} />
            <div className="skeleton" style={{ width: 70, height: 12 }} />
            <div className="skeleton" style={{ width: 62, height: 12 }} />
            <div className="skeleton" style={{ width: 70, height: 24, borderRadius: 9999 }} />
          </div>
        ))}
      </div>
    </div>
  )
}