import { HealthPanel } from "./HealthPanel";

export default function Home() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Brewing SaaS (WIP)</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Desktop-first web app + native mobile apps, offline-first brew-day logging.
      </p>
      <HealthPanel />
    </main>
  );
}

