"use client";

import dynamic from "next/dynamic";

const DevDashboard = dynamic(() => import("./DevDashboard").then((m) => m.DevDashboard), {
  ssr: false,
  loading: () => <p className="muted">Loading dev dashboard…</p>,
});

export function DashboardClient() {
  return <DevDashboard />;
}

