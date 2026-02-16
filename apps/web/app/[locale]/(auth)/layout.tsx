import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="appShell">
      <main id="main" style={{ marginTop: 16 }}>
        {children}
      </main>
    </div>
  );
}

