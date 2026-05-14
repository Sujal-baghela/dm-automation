export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 180, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 260, height: 12, marginBottom: 20 }} />

      <div className="stats-row">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="stat-card" key={index}>
            <div className="skeleton" style={{ width: 92, height: 10, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 72, height: 28, marginBottom: 10 }} />
            <div className="skeleton" style={{ width: 110, height: 10 }} />
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div className="skeleton" style={{ width: 120, height: 14 }} />
            <div className="skeleton" style={{ width: 68, height: 28 }} />
          </div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="wf-row" key={index}>
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "55%", height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "70%", height: 10 }} />
              </div>
              <div className="skeleton" style={{ width: 44, height: 22, borderRadius: 9999 }} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-head">
              <div className="skeleton" style={{ width: 110, height: 14 }} />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="act-row" key={index}>
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: 9999, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "80%", height: 11, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: 90, height: 9 }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div className="skeleton" style={{ width: 100, height: 14, marginBottom: 13 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="skeleton" key={index} style={{ width: "100%", height: 34, borderRadius: 10 }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="checklist">
        <div className="skeleton" style={{ width: 120, height: 10, marginBottom: 14 }} />
        <div className="check-items">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="skeleton" key={index} style={{ width: 150, height: 14, borderRadius: 9999 }} />
          ))}
        </div>
      </div>
    </div>
  )
}