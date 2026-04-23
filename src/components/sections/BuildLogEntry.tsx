import { Reveal, RevealItem } from "@/components/motion/Reveal";
import type { Experience } from "@/data/resume";

type BuildLogEntryProps = {
  entry: Experience;
  /** Reverse-chronological build number, zero-padded (e.g. "001"). */
  buildNumber: string;
};

const MONTH_ABBR: Record<string, string> = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

function compactPeriod(period: string): string {
  // "September 2025 – Present" -> "Sep 2025 — Present"
  return period.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
    (match) => MONTH_ABBR[match] ?? match
  );
}

export function BuildLogEntry({ entry, buildNumber }: BuildLogEntryProps) {
  const metaParts = [
    `Build ${buildNumber}`,
    entry.company,
    entry.location.split(",")[0],
    compactPeriod(entry.period),
  ];

  return (
    <Reveal
      as="article"
      trigger="inView"
      stagger={0.08}
      delay={0.05}
      viewportMargin="-15% 0px"
      className="relative"
    >
      {/* Eyebrow: mono metadata, matches Hero's dot-separated rhythm */}
      <RevealItem
        as="p"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
      >
        {metaParts.flatMap((part, i) =>
          i === 0
            ? [<span key={part}>{part}</span>]
            : [
                <span key={`${part}-sep`} aria-hidden className="text-mute/70">
                  ·
                </span>,
                <span key={part}>{part}</span>,
              ]
        )}
      </RevealItem>

      {/* Role title: Fraunces display, a notch smaller than Hero H1 */}
      <RevealItem
        as="h3"
        className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink"
      >
        {entry.role}
      </RevealItem>

      {/* Prose: constrained measure, ink on paper, quiet paragraph rhythm */}
      <div className="mt-8 max-w-[62ch] space-y-5 font-sans text-[1.0625rem] leading-[1.65] text-ink sm:text-[1.125rem]">
        {entry.narrative.map((paragraph, i) => (
          <RevealItem as="p" key={i}>
            {paragraph}
          </RevealItem>
        ))}
      </div>
    </Reveal>
  );
}
