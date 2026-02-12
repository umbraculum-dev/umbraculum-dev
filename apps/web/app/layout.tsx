import type { ReactNode } from "react";
import { PrimaryNav } from "./_components/PrimaryNav";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="appShell">
          <PrimaryNav />
          <main id="main" style={{ marginTop: 16 }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

