import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
const display = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-display",
});
const body = VT323({ subsets: ["latin"], weight: "400", variable: "--f-body" });
export const metadata: Metadata = {
  title: "Jaspreet Singh – Blocky Portfolio",
  description: "A scroll-driven Minecraft-style portfolio.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
      <Analytics />
    </html>
  );
}
