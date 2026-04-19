import type { Metadata } from "next";
import "./globals.css";
 
export const metadata: Metadata = {
  title: "AXION — Laser Diagnostics Console",
  description: "Real-time laser system diagnostics dashboard",
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
 