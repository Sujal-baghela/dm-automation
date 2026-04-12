export default function Home() {
  return (
    <main style={{ 
      fontFamily: "monospace", 
      padding: "40px", 
      background: "#0a0a0a", 
      color: "#00ff88", 
      minHeight: "100vh" 
    }}>
      <h1>🤖 DM Automation System</h1>
      <p>Status: <strong>LIVE</strong></p>
      <hr style={{ borderColor: "#333" }} />
      <h2>Active Endpoints</h2>
      <ul>
        <li>POST /api/webhook/instagram</li>
        <li>POST /api/webhook/whatsapp</li>
        <li>GET  /api/webhook/instagram (verify)</li>
        <li>GET  /api/webhook/whatsapp (verify)</li>
      </ul>
      <hr style={{ borderColor: "#333" }} />
      <h2>Stack</h2>
      <ul>
        <li>Next.js 14 — Vercel</li>
        <li>PostgreSQL — Neon</li>
        <li>Redis + BullMQ — Upstash</li>
        <li>Meta Graph API — Instagram + WhatsApp</li>
      </ul>
    </main>
  );
}