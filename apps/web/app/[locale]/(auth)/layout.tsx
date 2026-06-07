import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="brew-app-shared-layout">
      <main id="main" className="brew-main-margin">
        {children}
      </main>
    </div>
  );
}

