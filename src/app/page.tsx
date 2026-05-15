"use client";

import Link from "next/link";
import "./dashboard/dashboard.css";

export default function HomePage() {
  return (
    <>
      <style>{`
        .landing {
          --canvas: #000000;
          --surface-card: #0a0a0c;
          --surface-elevated: #101012;
          --hairline: rgba(255,255,255,0.06);
          --hairline-strong: rgba(255,255,255,0.14);
          --ink: #fcfdff;
          --body-text: rgba(252,253,255,0.86);
          --mute: #a1a4a5;
          --glow-purple: rgba(113,50,245,0.28);
          --accent-green: #11ff99;
          --accent-blue: #3b9eff;
        }
        
        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="landing" style={{ paddingTop: 64 }}>
        {/* NAVBAR */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            height: 64,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12H20" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 7H20" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 17H20" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontWeight: 700, color: "var(--ink)" }}>DM-Automation</div>
            </div>

            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <Link href="/pricing" style={{ fontSize: 14, color: "var(--mute)", textDecoration: "none", transition: "color 0.2s" }}>Pricing</Link>
              <Link href="/demo" style={{ fontSize: 14, color: "var(--accent-green)", textDecoration: "none", fontWeight: 600 }}>Try Demo</Link>
              <Link href="/sign-in" style={{ fontSize: 14, color: "var(--mute)", textDecoration: "none", transition: "color 0.2s" }}>Sign in</Link>
              <Link href="/sign-up" style={{ background: "var(--ink)", color: "#000000", fontWeight: 600, borderRadius: 8, padding: "8px 16px", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Get started free</Link>
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <section style={{ background: "var(--canvas)", paddingTop: 140, paddingBottom: 100, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid var(--hairline-strong)", borderRadius: 9999, padding: "4px 14px", fontSize: 13, color: "var(--mute)", marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, background: "var(--accent-green)", borderRadius: "50%" }} />
              Now with AI-powered reply suggestions
            </div>

            <h1 style={{ fontSize: 72, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05, color: "var(--ink)", marginBottom: 24, fontFamily: "IBM Plex Sans" }}>
              Automate your
              <br />
              <span style={{ background: "linear-gradient(135deg, var(--purple) 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>social media.</span>
            </h1>

            <p style={{ fontSize: 18, color: "var(--mute)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
              Connect Instagram, LinkedIn, YouTube and more. Schedule posts, automate DM replies, and manage your inbox — all in one place.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <Link href="/sign-up" style={{ background: "var(--ink)", color: "#000000", fontWeight: 600, fontSize: 15, padding: "11px 28px", borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>Get started free →</Link>
              <Link href="/demo" style={{ background: "transparent", color: "var(--ink)", fontSize: 15, padding: "11px 28px", borderRadius: 8, border: "1px solid var(--hairline-strong)", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View demo →</Link>
            </div>

            <p style={{ fontSize: 13, color: "var(--mute)" }}>Free plan · No credit card required</p>
          </div>
        </section>

        {/* STATS ROW */}
        <section style={{ background: "var(--canvas)", paddingBottom: 80 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 64, flexWrap: "wrap", maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", letterSpacing: -1 }}>5</div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 4 }}>Platforms</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", letterSpacing: -1 }}>10x</div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 4 }}>Faster workflows</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: "var(--ink)", letterSpacing: -1 }}>24/7</div>
              <div style={{ fontSize: 13, color: "var(--mute)", marginTop: 4 }}>Auto-replies</div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section style={{ background: "var(--canvas)", padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--purple)", textTransform: "uppercase", letterSpacing: ".12em", textAlign: "center", marginBottom: 12 }}>EVERYTHING YOU NEED</div>
            <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5, color: "var(--ink)", textAlign: "center", marginBottom: 12 }}>One platform for all your social media</h2>
            <p style={{ fontSize: 16, color: "var(--mute)", textAlign: "center", marginBottom: 56 }}>Manage all your social media from one beautiful dashboard.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--hairline)", border: "1px solid var(--hairline)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ background: "var(--surface-card)", padding: 32 }}>
                <div style={{ fontSize: 28, marginBottom: 16, display: "block" }}>📅</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Content Scheduling</div>
                <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.65 }}>Schedule posts across Instagram, LinkedIn, YouTube and Google Business.</div>
              </div>

              <div style={{ background: "var(--surface-card)", padding: 32, borderLeft: "1px solid var(--hairline)", borderRight: "1px solid var(--hairline)" }}>
                <div style={{ fontSize: 28, marginBottom: 16, display: "block" }}>✨</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>AI Reply Suggestions</div>
                <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.65 }}>Let AI draft replies to customer messages. Review, edit and send with one click.</div>
              </div>

              <div style={{ background: "var(--surface-card)", padding: 32 }}>
                <div style={{ fontSize: 28, marginBottom: 16, display: "block" }}>⚡</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Workflow Automation</div>
                <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.65 }}>Build keyword-triggered auto-reply workflows. Respond 24/7 automatically.</div>
              </div>

              <div style={{ background: "var(--surface-card)", padding: 32, borderTop: "1px solid var(--hairline)" }}>
                <div style={{ fontSize: 28, marginBottom: 16, display: "block" }}>📥</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Unified Inbox</div>
                <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.65 }}>All messages from every platform in one place. Reply without switching apps.</div>
              </div>

              <div style={{ background: "var(--surface-card)", padding: 32, borderTop: "1px solid var(--hairline)", borderLeft: "1px solid var(--hairline)", borderRight: "1px solid var(--hairline)" }}>
                <div style={{ fontSize: 28, marginBottom: 16, display: "block" }}>📣</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Broadcast Messages</div>
                <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.65 }}>Send bulk messages to contacts on Instagram and WhatsApp at once.</div>
              </div>

              <div style={{ background: "var(--surface-card)", padding: 32, borderTop: "1px solid var(--hairline)" }}>
                <div style={{ fontSize: 28, marginBottom: 16, display: "block" }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Analytics</div>
                <div style={{ fontSize: 14, color: "var(--mute)", lineHeight: 1.65 }}>Track post performance, engagement and growth across all platforms.</div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section style={{ background: "var(--canvas)", padding: "80px 24px", textAlign: "center", borderTop: "1px solid var(--hairline)" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, color: "var(--ink)", marginBottom: 12 }}>Start free, scale as you grow</h2>
            <p style={{ fontSize: 16, color: "var(--mute)", marginBottom: 32 }}>Free forever for 1 platform. Pro at $29/month. Agency at $99/month.</p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/pricing" style={{ background: "transparent", color: "var(--ink)", fontSize: 15, padding: "11px 28px", borderRadius: 8, border: "1px solid var(--hairline-strong)", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>See all plans</Link>
              <Link href="/sign-up" style={{ background: "var(--ink)", color: "#000000", fontWeight: 600, fontSize: 15, padding: "11px 28px", borderRadius: 8, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Get started free</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "var(--canvas)", borderTop: "1px solid var(--hairline)", padding: "40px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span style={{ fontSize: 13, color: "var(--mute)" }}>© 2025 DM-Automation. All rights reserved.</span>

            <div style={{ display: "flex", gap: 24 }}>
              <Link href="/pricing" style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", transition: "color 0.2s" }}>Pricing</Link>
              <Link href="/sign-in" style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", transition: "color 0.2s" }}>Sign in</Link>
              <Link href="/sign-up" style={{ fontSize: 13, color: "var(--mute)", textDecoration: "none", transition: "color 0.2s" }}>Sign up</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}