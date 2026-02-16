import { redirect } from "next/navigation";

export default function RootRedirect() {
  redirect("/en");
}

import { HealthPanel } from "./HealthPanel";
import { DashboardClient } from "./DashboardClient";

export const metadata = {
  title: "Dashboard",
};

export default function Home() {
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Desktop-first web app + native mobile apps, offline-first brew-day logging.
      </p>
      <HealthPanel />
      <DashboardClient />
    </>
  );
}

