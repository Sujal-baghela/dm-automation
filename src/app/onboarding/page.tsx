"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../dashboard/dashboard.css";

const STEPS = [
  { id: 1, title: "Welcome to DM-Automation", sub: "Let's get you set up in 3 quick steps." },
  { id: 2, title: "Connect your platforms", sub: "Choose which platforms you want to manage." },
  { id: 3, title: "Set up your first workflow", sub: "Automate replies with keyword triggers." },
  { id: 4, title: "You're all set!", sub: "Start publishing and automating." },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼" },
  { id: "youtube", label: "YouTube", emoji: "🎥" },
  { id: "gmb", label: "Google Business", emoji: "📍" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💬" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<number>(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [autoReply, setAutoReply] = useState<string>("");
  const router = useRouter();

  function togglePlatform(id: string) {
    setSelectedPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  const percent = Math.round((step / STEPS.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: 40 }}>
        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: "var(--silver-blue)" }}>Step {step} of {STEPS.length}</span>
          <span style={{ fontSize: 12, color: "var(--silver-blue)" }}>{percent}% complete</span>
        </div>
        <div style={{ height: 4, background: "var(--border-gray)", borderRadius: 9999, marginBottom: 32 }}>
          <div style={{ height: 4, background: "var(--purple)", borderRadius: 9999, width: `${(step / STEPS.length) * 100}%` }} />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", marginBottom: 6 }}>{STEPS[step - 1].title}</h2>
        <p style={{ fontSize: 14, color: "var(--silver-blue)", marginBottom: 28 }}>{STEPS[step - 1].sub}</p>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, marginBottom: 12 }}>
              <span style={{ color: "var(--purple)", fontSize: 18 }}>✦</span>
              <div>Connect your social accounts</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, marginBottom: 12 }}>
              <span style={{ color: "var(--purple)", fontSize: 18 }}>✦</span>
              <div>Set up automated reply workflows</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, marginBottom: 12 }}>
              <span style={{ color: "var(--purple)", fontSize: 18 }}>✦</span>
              <div>Schedule and publish content</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PLATFORMS.map((p) => {
              const selected = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  style={{
                    padding: "12px 16px",
                    border: `1.5px solid ${selected ? "var(--purple)" : "var(--border-gray)"}`,
                    borderRadius: "var(--r)",
                    background: selected ? "var(--purple-subtle)" : "var(--white)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: 18, color: selected ? "var(--purple)" : "var(--near-black)" }}>{p.emoji}</span>
                  <span style={{ color: selected ? "var(--purple)" : "var(--near-black)" }}>{p.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="form-label">Trigger keyword</label>
            <input className="form-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. price, order, hello" />

            <label className="form-label" style={{ marginTop: 8 }}>Auto-reply message</label>
            <textarea className="textarea" value={autoReply} onChange={(e) => setAutoReply(e.target.value)} placeholder="e.g. Thanks for reaching out! We'll get back to you shortly." />
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ textAlign: "center", fontSize: 56, marginBottom: 16 }}>🎉</div>
            <p style={{ fontSize: 14, color: "var(--silver-blue)", textAlign: "center" }}>Your account is ready. Head to the dashboard to start publishing and automating your social media.</p>
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
          <div>
            {step > 1 ? (
              <button type="button" className="btn btn-gray btn-sm" onClick={() => setStep((s) => s - 1)}>← Back</button>
            ) : (
              <Link href="/" className="btn btn-gray btn-sm">← Home</Link>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setStep((s) => s + 1)}>Continue →</button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => router.push("/dashboard")}>Go to Dashboard →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
