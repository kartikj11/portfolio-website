import { Reveal, RevealItem } from "@/components/motion/Reveal";
import type { Project } from "@/data/resume";

type SelectedBuildsEntryProps = {
  project: Project;
  /** Two-digit, zero-padded sequence within the Selected Builds list. */
  sequence: string;
};

export function SelectedBuildsEntry({
  project,
  sequence,
}: SelectedBuildsEntryProps) {
  const stack = project.featuredStack ?? project.stack;

  return (
    <Reveal
      as="article"
      trigger="inView"
      stagger={0.07}
      delay={0.05}
      viewportMargin="-15% 0px"
      className="relative"
    >
      {/* Top row: sequence + client, mono, dot-separated — echoes Hero/Build
          Log eyebrow format. Stack is intentionally moved to the bottom row
          so this top line stays dense and readable. */}
      <RevealItem
        as="p"
        className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
      >
        <span>{sequence}</span>
        {project.client ? (
          <>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>{project.client}</span>
          </>
        ) : null}
      </RevealItem>

      {/* Project title: Fraunces, a step smaller than Build Log's role H3
          so the reader feels the pace quicken from chapters to works. */}
      <RevealItem
        as="h3"
        className="mt-5 font-display text-[clamp(1.375rem,2.5vw,2rem)] font-normal leading-[1.15] tracking-[-0.015em] text-ink"
      >
        {project.title}
      </RevealItem>

      {/* Bottom row: prose (left, constrained) + stack (right, mono) on
          desktop; stacked on mobile. The two-column geometry here is the
          structural signal that separates this section from Build Log. */}
      <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-12 lg:gap-y-0">
        {project.narrative ? (
          <RevealItem
            as="p"
            className="max-w-[54ch] font-sans text-[1rem] leading-[1.6] text-ink lg:col-span-8 lg:text-[1.0625rem]"
          >
            {project.narrative}
          </RevealItem>
        ) : null}

        <RevealItem
          as="p"
          className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-mute lg:col-span-4 lg:pl-2"
        >
          {stack.join(" / ")}
        </RevealItem>
      </div>
    </Reveal>
  );
}
