import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { footerData } from "@/data/resume";

export function Footer() {
  const { name, location, year } = footerData;

  return (
    <footer className="relative px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14">
      <Reveal
        as="div"
        trigger="inView"
        stagger={0}
        delay={0.05}
        viewportMargin="-10% 0px"
        className="mx-auto max-w-[1680px]"
      >
        {/* Single centered mono line. Dot separators match the site-wide
            eyebrow vocabulary; centering is the signoff cue — every other
            eyebrow on the page is left-aligned, this one isn't. */}
        <RevealItem
          as="p"
          className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
        >
          <span>{name}</span>
          <span aria-hidden className="text-mute/70">
            ·
          </span>
          <span>{location}</span>
          <span aria-hidden className="text-mute/70">
            ·
          </span>
          <span>&copy; {year}</span>
        </RevealItem>
      </Reveal>
    </footer>
  );
}
