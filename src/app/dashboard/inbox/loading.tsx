export default function Loading() {
  return (
    <div className="content">
      <div className="skeleton" style={{ width: 120, height: 18, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 300, height: 12, marginBottom: 20 }} />

      <div className="two-col" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
        <div className="card">
          <div className="card-head" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
            <div className="skeleton" style={{ width: 110, height: 14 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="skeleton" key={index} style={{ width: 88, height: 28, borderRadius: 9999 }} />
              ))}
            </div>
          </div>

          {Array.from({ length: 6 }).map((_, index) => (
            <div className="wf-row" key={index}>
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "50%", height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "72%", height: 10 }} />
              </div>
              <div className="skeleton" style={{ width: 64, height: 10 }} />
            </div>
          ))}
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", minHeight: 520 }}>
          <div className="card-head">
            <div className="skeleton" style={{ width: 120, height: 14 }} />
          </div>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-gray)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="skeleton" key={index} style={{ width: 92, height: 22, borderRadius: 8 }} />
              ))}
            </div>
            <div className="skeleton" style={{ width: "100%", height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "84%", height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 110, height: 30, borderRadius: 10 }} />
          </div>

          <div style={{ padding: "16px 20px", marginTop: "auto" }}>
            <div className="skeleton" style={{ width: 48, height: 10, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "100%", height: 92, marginBottom: 10 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="skeleton" style={{ width: 84, height: 32, borderRadius: 10 }} />
              <div className="skeleton" style={{ width: 88, height: 32, borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}