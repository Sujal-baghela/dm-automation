"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../dashboard/dashboard.css";

type PlanId = "free" | "pro" | "agency";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string | null;
  highlighted: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["1 platform", "10 posts/month", "Basic inbox", "Keyword triggers"],
    cta: "Get started free",
    href: "/sign-up",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For serious social media managers",
    features: [
      "4 platforms",
      "Unlimited posts",
      "AI reply suggestions",
      "Broadcast messages",
      "Workflow automation",
      "Content calendar",
      "Analytics",
    ],
    cta: "Start Pro",
    href: null,
    highlighted: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    period: "per month",
    description: "For teams and agencies",
    features: [
      "10 platforms",
      "Everything in Pro",
      "Team access",
      "Priority support",
      "Advanced analytics",
      "Custom workflows",
    ],
    cta: "Start Agency",
    href: null,
    highlighted: false,
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleCheckout(plan: "pro" | "agency") {
    try {
      setIsLoading(plan);
      const resp = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await resp.json()) as { url?: string; error?: string };

      if (resp.ok && data.url) {
        router.push(data.url);
        return;
      }

      alert(data.error ?? "Something went wrong");
    } catch {
      alert("Something went wrong");
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <>
      <style>{`
        .pricing-page {
          --canvas: #000000;
          --surface-card: #0a0a0c;
          --surface-elevated: #101012;
          --hairline: rgba(255,255,255,0.06);
          --hairline-strong: rgba(255,255,255,0.14);
          --ink: #fcfdff;
          --mute: #a1a4a5;
          --glow-purple: rgba(113,50,245,0.28);
          --accent-green: #11ff99;
        }
      `}</style>

      <div className="pricing-page" style={{ paddingTop: 64, background: "var(--canvas)", minHeight: "100vh" }}>
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
              <Link href="/sign-in" style={{ fontSize: 14, color: "var(--mute)", textDecoration: "none", transition: "color 0.2s" }}>Sign in</Link>
              <Link href="/sign-up" style={{ background: "var(--ink)", color: "#000000", fontWeight: 600, borderRadius: 8, padding: "8px 16px", fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Get started free</Link>
            </div>
          </div>
        </div>

        {/* HEADER SECTION */}
        <section style={{ background: "var(--canvas)", paddingTop: 120, paddingBottom: 64, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--purple)", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 12 }}>TRANSPARENT PRICING</div>
            <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: -2, color: "var(--ink)", marginBottom: 16 }}>Simple, transparent pricing</h1>
            <p style={{ fontSize: 18, color: "var(--mute)" }}>Start free. Upgrade when you need more.</p>
          </div>
        </section>

        {/* PLANS GRID */}
        <section style={{ padding: "0 24px 100px", background: "var(--canvas)" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--hairline)", border: "1px solid var(--hairline-strong)", borderRadius: 16, overflow: "hidden" }}>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: plan.highlighted ? "var(--surface-elevated)" : "var(--surface-card)",
                  padding: 32,
                }}
              >
                {plan.highlighted && (
                  <span
                    style={{
                      display: "inline-block",
                      marginBottom: 16,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--purple)",
                      background: "rgba(113,50,245,0.15)",
                      border: "1px solid rgba(113,50,245,0.3)",
                      borderRadius: 9999,
                      padding: "3px 12px",
                    }}
                  >
                    Most Popular
                  </span>
                )}

                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--mute)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
                  {plan.name}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: -2, color: "var(--ink)" }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: "var(--mute)" }}>{plan.period}</span>
                </div>

                <p style={{ fontSize: 14, color: "var(--mute)", marginBottom: 28, lineHeight: 1.6 }}>{plan.description}</p>

                <hr style={{ border: "none", borderTop: "1px solid var(--hairline-strong)", marginBottom: 24 }} />

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, padding: 0 }}>
                  {plan.features.map((feat) => (
                    <li key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--mute)" }}>
                      <span style={{ fontSize: 13, color: "var(--accent-green)" }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.href ? (
                  <Link
                    href={plan.href}
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "11px 0",
                      borderRadius: 8,
                      border: "1px solid var(--hairline-strong)",
                      color: "var(--ink)",
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {plan.cta}
                  </Link>
                ) : plan.id === "pro" || plan.id === "agency" ? (
                  <button
                    type="button"
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "11px 0",
                      borderRadius: 8,
                      border: plan.highlighted ? "none" : "1px solid var(--hairline-strong)",
                      background: plan.highlighted ? "var(--ink)" : "var(--surface-elevated)",
                      color: plan.highlighted ? "#000" : "var(--ink)",
                      fontWeight: plan.highlighted ? 600 : 500,
                      fontSize: 14,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                    onClick={() => void handleCheckout(plan.id as "pro" | "agency")}
                    disabled={isLoading === plan.id}
                  >
                    {isLoading === plan.id ? "Redirecting..." : plan.cta}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48, fontSize: 13, color: "var(--mute)" }}>
            All plans include a 14-day free trial on paid features. No credit card required for free plan.
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
