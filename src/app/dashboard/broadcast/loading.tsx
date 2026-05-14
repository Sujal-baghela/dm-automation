export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 170, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 300, height: 12, marginBottom: 20 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div>
          <div className="broadcast-card">
            <div className="skeleton" style={{ width: 140, height: 12, marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              <div className="skeleton" style={{ width: 150, height: 30, borderRadius: 9999 }} />
              <div className="skeleton" style={{ width: 145, height: 30, borderRadius: 9999 }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "100%", height: 36 }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 92, height: 10, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "100%", height: 120 }} />
              <div className="skeleton" style={{ width: 60, height: 10, marginLeft: "auto", marginTop: 6 }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div className="skeleton" style={{ width: 88, height: 10, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <div className="skeleton" style={{ width: 90, height: 30, borderRadius: 9999 }} />
                <div className="skeleton" style={{ width: 140, height: 30, borderRadius: 9999 }} />
              </div>
            </div>

            <div className="skeleton" style={{ width: "100%", height: 64, marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <div className="skeleton" style={{ flex: 1, height: 36 }} />
              <div className="skeleton" style={{ flex: 2, height: 36 }} />
            </div>
          </div>

          <div className="card" style={{ padding: "18px 20px" }}>
            <div className="skeleton" style={{ width: 150, height: 14, marginBottom: 12 }} />
            <div style={{ display: "grid", gap: 10 }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="skeleton" key={index} style={{ width: "100%", height: 12 }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-head">
              <div className="skeleton" style={{ width: 110, height: 14 }} />
            </div>
            <div style={{ padding: "14px 20px" }}>
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div className="skeleton" style={{ width: 70, height: 10 }} />
                    <div className="skeleton" style={{ width: 40, height: 10 }} />
                  </div>
                  <div className="skeleton" style={{ width: "100%", height: 6 }} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="skeleton" style={{ width: 110, height: 14 }} />
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="act-row" key={index}>
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: 9999, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "76%", height: 11, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: 90, height: 9 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}