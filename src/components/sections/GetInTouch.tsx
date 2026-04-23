import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { contact } from "@/data/resume";

type LinkRow = {
  key: string;
  label: string;
  href: string;
  external: boolean;
  ariaLabel: string;
};

export function GetInTouch() {
  const links: LinkRow[] = [
    {
      key: "email",
      label: "Email",
      href: contact.email.href,
      external: false,
      ariaLabel: `Email Kartik at ${contact.email.display}`,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: contact.linkedin.href,
      external: true,
      ariaLabel: "Kartik Jindal on LinkedIn",
    },
    {
      key: "github",
      label: "GitHub",
      href: contact.github.href,
      external: true,
      ariaLabel: "Kartik Jindal on GitHub",
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative px-6 pb-16 pt-6 sm:px-10 sm:pb-20 sm:pt-8 lg:px-16 lg:pb-24 lg:pt-12"
    >
      <div className="mx-auto max-w-[1680px]">
        <h2 id="contact-heading" className="sr-only">
          Get in Touch
        </h2>

        {/* Section eyebrow. */}
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
            <span>07</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>Get in Touch</span>
          </RevealItem>
        </Reveal>

        {/*
          Portrait slot — reserved for future <Image>.

          Layout note: the Get in Touch section is now compact (eyebrow +
          intro line + single inline link row). A large portrait would
          overwhelm this content.

          When added:
          - Use next/image with explicit width/height props (per CLAUDE.md).
          - Target aspect ratio 1:1 (square), ~200–280px rendered on desktop.
          - Inline-to-right placement preferred: a small portrait beside the
            intro line + link block, not stacked above. On mobile, either
            stack above at reduced size (~120–160px) or omit on mobile
            entirely.
          - Photo style: professional-but-relaxed. Desk/workspace or neutral
            backdrop. Not a beach shot, not a social/party crop. Closer to a
            thoughtful portrait than a LinkedIn headshot.
          - If added, the layout becomes a 2-column flex/grid with intro +
            links in one column and portrait in the other, vertically
            centered.
        */}

        {/* Intro line — Fraunces, the site's most direct moment.
            Two sentences, period-separated. Natural width — at display
            scale the line is short enough that measure control isn't
            needed. Wraps naturally on phone. */}
        <Reveal
          as="div"
          trigger="inView"
          stagger={0}
          delay={0.05}
          viewportMargin="-15% 0px"
          className="mt-16 sm:mt-20 lg:mt-24"
        >
          <RevealItem
            as="p"
            className="font-display text-[clamp(1.25rem,2.25vw,1.75rem)] font-normal leading-[1.3] tracking-[-0.01em] text-ink"
          >
            {contact.introLine}
          </RevealItem>
        </Reveal>

        {/* Inline link line — the only place --color-accent renders on
            the page. Geist at 1.125rem reads as prose-scale, not button
            row. Middle-dot separators match the site's eyebrow vocabulary.
            Tighter gap to the intro line above (mt-6/8/10) binds the two
            as a single compact block. */}
        <Reveal
          as="div"
          trigger="inView"
          stagger={0}
          delay={0.1}
          viewportMargin="-15% 0px"
          className="mt-6 sm:mt-8 lg:mt-10"
        >
          <RevealItem
            as="p"
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans text-[1.125rem] leading-[1.5] text-ink"
          >
            {links.flatMap((link, i) => {
              const anchor = (
                <a
                  key={link.key}
                  href={link.href}
                  aria-label={link.ariaLabel}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="underline-offset-[0.25em] decoration-1 transition-colors duration-200 ease-out hover:text-accent hover:underline focus-visible:text-accent focus-visible:underline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-4"
                >
                  {link.label}
                </a>
              );
              return i === 0
                ? [anchor]
                : [
                    <span
                      key={`${link.key}-sep`}
                      aria-hidden
                      className="text-mute/70"
                    >
                      ·
                    </span>,
                    anchor,
                  ];
            })}
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
