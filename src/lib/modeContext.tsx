"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type DashboardMode = "dm" | "social";

interface ModeContextType {
  mode: DashboardMode;
  setMode: (m: DashboardMode) => void;
}

const ModeContext = createContext<ModeContextType>({
  mode: "dm",
  setMode: () => {},
});

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DashboardMode>("dm");
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem("dashboardMode");
    if (savedMode === "dm" || savedMode === "social") {
      setMode(savedMode);
    }
  }, []);

  const handleSetMode = (m: DashboardMode) => {
    setMode(m);
    localStorage.setItem("dashboardMode", m);
    document.cookie = `dashboardMode=${m};path=/;max-age=31536000`;
    router.push("/dashboard");
  };

  return (
    <ModeContext.Provider value={{ mode, setMode: handleSetMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useDashboardMode() {
  return useContext(ModeContext);
}