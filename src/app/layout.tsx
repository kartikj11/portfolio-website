import type { Metadata } from "next";
import { Fraunces, Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { StickyNav } from "@/components/nav/StickyNav";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  variable: "--font-display-raw",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-serif-raw",
});

const geistSans = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-sans-raw",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  variable: "--font-mono-raw",
});

export const metadata: Metadata = {
  title: "Kartik Jindal — DevOps / Cloud Infrastructure",
  description:
    "Portfolio of Kartik Jindal. Cloud infrastructure that doesn't wake people up at 3am.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrumentSerif.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-sans">
        <LenisProvider>
          {/*
            StickyNav lives as a sibling of <main> so the mobile overlay
            can toggle `inert` on <main> without affecting itself. <main>
            is the landmark for all page content; the nav is chrome.
          */}
          <StickyNav />
          <main className="flex-1">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
