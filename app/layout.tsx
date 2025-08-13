import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Fantasy Football AI — Free Logo MVP",
  description: "Load Sleeper league and generate free team logos"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </body>
    </html>
  );
}
