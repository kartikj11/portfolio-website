import type { Metadata } from "next";
import { Fraunces, Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { StickyNav } from "@/components/nav/StickyNav";
import { profile } from "@/data/resume";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
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

// JSON-LD Person schema. Surfaces in Google knowledge panels and lets
// LLM-driven search aggregators cite the right role/employer without
// having to scrape prose. `sameAs` is read from `profile.links` in the
// resume data so social URLs stay authoritative in one place.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "DevOps Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Intuit",
  },
  url: SITE_URL,
  sameAs: [profile.links.linkedin, profile.links.github],
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
        <script
          type="application/ld+json"
          // JSON.stringify output is safe to inline here — profile data
          // is static and contains no user input. suppressHydrationWarning
          // avoids React's warning about inner HTML mismatches since the
          // script contents never change between server and client.
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
