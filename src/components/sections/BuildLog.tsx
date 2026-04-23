import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { experience } from "@/data/resume";
import { BuildLogEntry } from "./BuildLogEntry";

export function BuildLog() {
  // Reverse-chronological build numbers: newest role = 001.
  // experience[] is already reverse-chronological in the data layer.
  const numbered = experience.map((entry, i) => ({
    entry,
    buildNumber: String(i + 1).padStart(3, "0"),
  }));

  return (
    <section
      id="build-log"
      aria-labelledby="build-log-headline"
      className="relative px-6 pb-28 pt-6 sm:px-10 sm:pb-32 sm:pt-8 lg:px-16 lg:pb-40 lg:pt-12"
    >
      <div className="mx-auto max-w-[1680px]">
        {/* Section header — mirrors Hero's eyebrow + display rhythm */}
        <Reveal
          as="header"
          trigger="inView"
          stagger={0.08}
          delay={0.05}
          viewportMargin="-15% 0px"
        >
          <RevealItem
            as="p"
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
          >
            <span>02</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>The Build Log</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>Work History</span>
          </RevealItem>

          <RevealItem
            as="h2"
            className="mt-10 font-display text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.02] tracking-[-0.02em] text-ink sm:mt-12"
          >
            <span id="build-log-headline" className="block">
              The places I&rsquo;ve broken
              <br className="hidden sm:block" />{" "}
              <span className="font-serif italic tracking-[-0.01em]">
                and fixed things.
              </span>
            </span>
          </RevealItem>
        </Reveal>

        {/* Entries */}
        <div className="mt-20 space-y-24 sm:mt-24 lg:mt-28 lg:space-y-32">
          {numbered.map(({ entry, buildNumber }) => (
            <BuildLogEntry
              key={entry.id}
              entry={entry}
              buildNumber={buildNumber}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
