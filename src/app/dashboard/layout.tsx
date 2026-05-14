"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ReactNode } from "react";
import { ModeProvider, useDashboardMode } from "@/lib/modeContext";
import "./dashboard.css";

function DashboardSidebar() {
  const pathname = usePathname();
  const { mode, setMode } = useDashboardMode();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sidebar">
      {/* LOGO */}
      <div className="logo-area">
        <div className="logo-icon">
          <svg viewBox="0 0 18 18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M2 5h14M2 9h9M2 13h6" />
          </svg>
        </div>
        <div>
          <div className="logo-name">DM-Automation</div>
          <div className="logo-tag">
            {mode === "dm" ? "DM Automation" : "Social Publishing"}
          </div>
        </div>
      </div>

      {/* MODE SWITCHER */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-gray)" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: "var(--silver-blue)",
          textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8
        }}>
          Mode
        </div>
        <div style={{
          display: "flex", background: "var(--surface)",
          borderRadius: "var(--r)", padding: 3, gap: 3,
          border: "1px solid var(--border-gray)"
        }}>
          <button
            onClick={() => setMode("dm")}
            style={{
              flex: 1, fontSize: 12, fontWeight: 600,
              padding: "6px 0", borderRadius: "var(--r-sm)",
              border: "none", cursor: "pointer", textAlign: "center",
              transition: "all .15s",
              background: mode === "dm" ? "var(--purple)" : "transparent",
              color: mode === "dm" ? "white" : "var(--silver-blue)",
              boxShadow: mode === "dm" ? "0 1px 3px rgba(113,50,245,0.3)" : "none",
            }}
          >
            ⚡ DM Auto
          </button>
          <button
            onClick={() => setMode("social")}
            style={{
              flex: 1, fontSize: 12, fontWeight: 600,
              padding: "6px 0", borderRadius: "var(--r-sm)",
              border: "none", cursor: "pointer", textAlign: "center",
              transition: "all .15s",
              background: mode === "social" ? "var(--green)" : "transparent",
              color: mode === "social" ? "white" : "var(--silver-blue)",
              boxShadow: mode === "social" ? "0 1px 3px rgba(20,158,97,0.3)" : "none",
            }}
          >
            📱 Social
          </button>
        </div>

        {/* MODE INDICATOR — inside sidebar, not floating */}
        <div style={{
          marginTop: 8, textAlign: "center", fontSize: 11,
          color: mode === "dm" ? "var(--purple)" : "var(--green)",
          fontWeight: 600, letterSpacing: ".04em",
        }}>
          {mode === "dm" ? "⚡ DM Automation mode" : "📱 Social Media mode"}
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="nav-section">
        <div className="nav-label">Overview</div>
        <Link href="/dashboard" className="nav-item" aria-current={isActive("/dashboard") ? "page" : undefined}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="1" y="1" width="6" height="6" rx="1.5" />
            <rect x="9" y="1" width="6" height="6" rx="1.5" />
            <rect x="1" y="9" width="6" height="6" rx="1.5" />
            <rect x="9" y="9" width="6" height="6" rx="1.5" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* DM MODE NAV */}
      {mode === "dm" && (
        <>
          <div className="nav-section">
            <div className="nav-label">Automation</div>
            <Link href="/dashboard/workflows" className="nav-item" aria-current={isActive("/dashboard/workflows") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="4" width="3" height="3" rx="0.5" />
                <rect x="6" y="4" width="3" height="3" rx="0.5" />
                <rect x="11" y="4" width="3" height="3" rx="0.5" />
                <path d="M4 5.5h2M9 5.5h2" />
              </svg>
              Workflows
            </Link>
            <Link href="/dashboard/broadcast" className="nav-item" aria-current={isActive("/dashboard/broadcast") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 8l10-6v12L2 8z" />
                <path d="M12 5l2 1M12 11l2-1M12 8h2" />
              </svg>
              Broadcast
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-label">Contacts</div>
            <Link href="/dashboard/contacts" className="nav-item" aria-current={isActive("/dashboard/contacts") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                <path d="M2 13c0-2 2-3 6-3s6 1 6 3" />
              </svg>
              Contacts
            </Link>
            <Link href="/dashboard/inbox" className="nav-item" aria-current={isActive("/dashboard/inbox") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="3" width="12" height="10" rx="1" />
                <path d="M2 3l6 4 6-4" />
              </svg>
              Inbox
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-label">Data</div>
            <Link href="/dashboard/logs" className="nav-item" aria-current={isActive("/dashboard/logs") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 4h12M2 8h8M2 12h10" />
              </svg>
              Audit Logs
            </Link>
          </div>
        </>
      )}

      {/* SOCIAL MODE NAV */}
      {mode === "social" && (
        <>
          <div className="nav-section">
            <div className="nav-label">Publishing</div>
            <Link href="/dashboard/compose" className="nav-item" aria-current={isActive("/dashboard/compose") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M11 2H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                <path d="M7 6h2M7 9h2" />
              </svg>
              Compose
            </Link>
            <Link href="/dashboard/calendar" className="nav-item" aria-current={isActive("/dashboard/calendar") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="3" width="12" height="11" rx="1" />
                <path d="M2 6h12M4 1v4M12 1v4" />
              </svg>
              Calendar
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-label">Engagement</div>
            <Link href="/dashboard/inbox" className="nav-item" aria-current={isActive("/dashboard/inbox") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="3" width="12" height="10" rx="1" />
                <path d="M2 3l6 4 6-4" />
              </svg>
              Inbox
            </Link>
            <Link href="/dashboard/accounts" className="nav-item" aria-current={isActive("/dashboard/accounts") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
                <path d="M2 13c0-2 2-3 6-3s6 1 6 3" />
                <circle cx="13" cy="3" r="1.5" />
              </svg>
              Accounts
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-label">Data</div>
            <Link href="/dashboard/analytics" className="nav-item" aria-current={isActive("/dashboard/analytics") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="2" y="10" width="2" height="4" rx="0.5" />
                <rect x="7" y="6" width="2" height="8" rx="0.5" />
                <rect x="12" y="2" width="2" height="12" rx="0.5" />
              </svg>
              Analytics
            </Link>
            <Link href="/dashboard/logs" className="nav-item" aria-current={isActive("/dashboard/logs") ? "page" : undefined}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 4h12M2 8h8M2 12h10" />
              </svg>
              Audit Logs
            </Link>
          </div>
        </>
      )}

      <div className="nav-spacer" />

      <Link
        href="/dashboard/settings"
        className="nav-item"
        aria-current={isActive("/dashboard/settings") ? "page" : undefined}
        style={{ margin: "0 12px 12px" }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8" cy="8" r="2.5" />
          <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" />
        </svg>
        Settings
      </Link>

      <div className="sidebar-footer">
        <UserButton />
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ModeProvider>
      <div className="db-shell">
        <DashboardSidebar />
        <main className="db-main">{children}</main>
      </div>
    </ModeProvider>
  );
}