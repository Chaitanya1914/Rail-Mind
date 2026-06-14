import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RailMind — Railway Operations Intelligence",
  description: "Autonomous multi-agent AI system for railway monitoring, delay prediction, rerouting, and safety management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
