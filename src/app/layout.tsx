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

// PLACEHOLDER: Replace with the production domain at deploy time.
// metadataBase lets Next.js resolve relative URLs in openGraph/twitter
// metadata; if the site deploys somewhere other than kartikjindal.dev,
// update this one constant and every URL downstream re-resolves.
const SITE_URL = "https://kartikjindal.dev";
const SITE_TITLE = "Kartik Jindal — DevOps / Cloud Infrastructure";
const SITE_DESCRIPTION =
  "Cloud infrastructure that doesn't wake people up at 3am.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Kartik Jindal",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
        {/*
          Skip-to-content link — visually hidden until focused by keyboard.
          First focusable element on the page; lets keyboard users bypass
          the sticky nav (once it's visible) and jump straight to the Hero.
        */}
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:border focus:border-ink focus:bg-paper focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
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
