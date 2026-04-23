import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { projects } from "@/data/resume";
import { SelectedBuildsEntry } from "./SelectedBuildsEntry";

export function SelectedBuilds() {
  // Curation lives in the data layer. The section renders whatever is
  // flagged featured, in its declared order.
  const featured = projects.filter((p) => p.featured);
  const numbered = featured.map((project, i) => ({
    project,
    sequence: String(i + 1).padStart(2, "0"),
  }));

  return (
    <section
      id="selected-builds"
      aria-labelledby="selected-builds-heading"
      className="relative px-6 pb-28 pt-6 sm:px-10 sm:pb-32 sm:pt-8 lg:px-16 lg:pb-40 lg:pt-12"
    >
      <div className="mx-auto max-w-[1680px]">
        {/* Section header — visible eyebrow only. The H2 is sr-only to keep
            the heading tree intact (H1 Hero → H2 BuildLog → H2 here → H3
            entries), while the visual design drops the visible headline
            and lets the eyebrow carry the section identity. Different
            top-matter from Build Log is part of how this section earns
            its own pace. */}
        <h2 id="selected-builds-heading" className="sr-only">
          Selected Builds
        </h2>
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
            <span>03</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>Selected Builds</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>The Work</span>
          </RevealItem>
        </Reveal>

        {/* Entries — tighter vertical rhythm than Build Log's space-y-24/32
            so the reader feels the pace quicken from chapters to works. */}
        <div className="mt-16 space-y-16 sm:mt-20 lg:mt-24 lg:space-y-20">
          {numbered.map(({ project, sequence }) => (
            <SelectedBuildsEntry
              key={project.id}
              project={project}
              sequence={sequence}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
