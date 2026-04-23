import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { thenVsNow } from "@/data/resume";

export function ThenVsNow() {
  return (
    <section
      id="then-now"
      aria-labelledby="then-vs-now-heading"
      className="relative px-6 pb-28 pt-0 sm:px-10 sm:pb-32 sm:pt-2 lg:px-16 lg:pb-40 lg:pt-4"
    >
      <div className="mx-auto max-w-[1680px]">
        {/* Hidden H2 keeps the heading tree intact (H1 Hero → H2 each
            section). Visible identity is carried by the mono eyebrow. */}
        <h2 id="then-vs-now-heading" className="sr-only">
          Then vs. Now
        </h2>

        {/* Section eyebrow — mirrors Hero/BuildLog/SelectedBuilds format. */}
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
            <span>05</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>Then vs. Now</span>
          </RevealItem>
        </Reveal>

        {/* THEN — mono sub-eyebrow + first-person past-tense prose. */}
        <Reveal
          as="div"
          trigger="inView"
          stagger={0.07}
          delay={0.05}
          viewportMargin="-15% 0px"
          className="mt-16 sm:mt-20 lg:mt-24"
        >
          <RevealItem
            as="p"
            className="flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
          >
            <span>Then</span>
            <span aria-hidden className="text-mute/70">
              —
            </span>
            <span>{thenVsNow.then.period}</span>
          </RevealItem>

          <RevealItem
            as="p"
            className="mt-5 max-w-[62ch] font-sans text-[1.0625rem] leading-[1.65] text-ink sm:text-[1.125rem]"
          >
            {thenVsNow.then.paragraph}
          </RevealItem>
        </Reveal>

        {/* Tie-breaker — the section's editorial pivot. Asymmetric margins:
            slightly tighter above (reader arrives from "Then"), slightly
            more air below (reader descends into "Now"). The pivot should
            feel like a turn, not an equilibrium point. */}
        <Reveal
          as="div"
          trigger="inView"
          stagger={0}
          delay={0.05}
          viewportMargin="-20% 0px"
          className="mt-10 sm:mt-12 lg:mt-14"
        >
          <RevealItem
            as="p"
            className="mx-auto max-w-[40ch] text-center font-serif text-[clamp(1.5rem,3vw,2.25rem)] italic leading-[1.25] tracking-[-0.005em] text-ink"
          >
            {thenVsNow.tieBreaker}
          </RevealItem>
        </Reveal>

        {/* NOW — mono sub-eyebrow + first-person present-tense prose. */}
        <Reveal
          as="div"
          trigger="inView"
          stagger={0.07}
          delay={0.05}
          viewportMargin="-15% 0px"
          className="mt-12 sm:mt-14 lg:mt-16"
        >
          <RevealItem
            as="p"
            className="flex items-baseline gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
          >
            <span>Now</span>
            <span aria-hidden className="text-mute/70">
              —
            </span>
            <span>{thenVsNow.now.period}</span>
          </RevealItem>

          <RevealItem
            as="p"
            className="mt-5 max-w-[62ch] font-sans text-[1.0625rem] leading-[1.65] text-ink sm:text-[1.125rem]"
          >
            {thenVsNow.now.paragraph}
          </RevealItem>
        </Reveal>
      </div>
    </section>
  );
}
