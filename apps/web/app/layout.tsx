import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PrimaryNav } from "./_components/PrimaryNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Brewery App",
    template: "%s · Brewery App",
  },
  description: "Brewery operations, recipes, and water chemistry tools.",
};

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

