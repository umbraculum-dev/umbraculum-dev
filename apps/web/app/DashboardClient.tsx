"use client";

import { useEffect, useState } from "react";
import { DevDashboard } from "./DevDashboard";

export function DashboardClient() {
  // Avoid hydration mismatches caused by browser extensions (e.g. password managers)
  // injecting DOM into form fields before React hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <p className="muted">Loading dev dashboard…</p>;
  return <DevDashboard />;
}

