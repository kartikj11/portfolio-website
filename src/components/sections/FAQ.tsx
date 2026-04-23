import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { faq } from "@/data/resume";

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative px-6 pb-20 pt-6 sm:px-10 sm:pb-24 sm:pt-8 lg:px-16 lg:pb-28 lg:pt-12"
    >
      <div className="mx-auto max-w-[1680px]">
        {/* Hidden H2 keeps the heading tree intact. Visible identity is
            the mono eyebrow; the full phrase is for screen readers. */}
        <h2 id="faq-heading" className="sr-only">
          Frequently Asked Questions
        </h2>

        {/* Section eyebrow — two-token, same format as siblings. */}
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
            <span>06</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>FAQ</span>
          </RevealItem>
        </Reveal>

        {/* Q&A pairs — <dl> is the semantically correct container.
            Per HTML5, <div> wrappers inside <dl> grouping <dt>/<dd> pairs
            are permitted and preferred for styling cohesion. */}
        <dl className="mt-16 space-y-16 sm:mt-20 lg:mt-24 lg:space-y-20">
          {faq.map(({ q, a }) => (
            <Reveal
              key={q}
              as="div"
              trigger="inView"
              stagger={0.07}
              delay={0.05}
              viewportMargin="-15% 0px"
            >
              <RevealItem
                as="dt"
                className="font-serif text-[clamp(1.375rem,2.75vw,2.25rem)] italic leading-[1.25] tracking-[-0.005em] text-ink"
              >
                {q}
              </RevealItem>

              <RevealItem
                as="dd"
                className="mt-5 max-w-[62ch] font-sans text-[1.0625rem] leading-[1.65] text-ink sm:text-[1.125rem]"
              >
                {a}
              </RevealItem>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
