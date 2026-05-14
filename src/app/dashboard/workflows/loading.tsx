export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 180, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 240, height: 12, marginBottom: 20 }} />

      <div className="stats-row">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="stat-card" key={index}>
            <div className="skeleton" style={{ width: 84, height: 10, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 64, height: 28, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 108, height: 10 }} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="skeleton" style={{ width: 120, height: 14 }} />
          <div className="skeleton" style={{ width: 88, height: 30 }} />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="wf-row" key={index}>
            <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: "50%", height: 12, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "68%", height: 10 }} />
            </div>
            <div className="wf-right">
              <div className="skeleton" style={{ width: 46, height: 22, borderRadius: 9999 }} />
              <div className="skeleton" style={{ width: 46, height: 22, borderRadius: 9999 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <div className="skeleton" style={{ width: 150, height: 14 }} />
        </div>
        <div style={{ padding: "14px 20px" }}>
          <div className="skeleton" style={{ width: "100%", height: 12, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: "84%", height: 12, marginBottom: 10 }} />
          <div className="skeleton" style={{ width: "72%", height: 12 }} />
        </div>
      </div>
    </div>
  )
}