import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { heroStats, profile } from "@/data/resume";

export function Hero() {
  const [primaryStat, secondaryStat] = heroStats;

  return (
    <section
      id="top"
      aria-labelledby="hero-headline"
      className="relative isolate flex min-h-dvh flex-col justify-between px-6 pb-10 pt-16 sm:px-10 sm:pb-14 sm:pt-20 lg:px-16 lg:pb-20 lg:pt-28"
    >
      {/* HeroMesh slot — Step 10 drops the R3F <Canvas> in here.
          Kept aria-hidden and empty today so the hero still reads as finished.
          Desktop-only: the mesh never shows on phone/tablet (perf + layout). */}
      <div
        aria-hidden
        data-hero-mesh-slot
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36%] lg:block"
      >
        {/* <HeroMeshCanvas /> goes here in Step 10 */}
      </div>

      <Reveal
        as="header"
        stagger={0.08}
        delay={0.1}
        className="relative z-10 grid max-w-[1680px] grid-cols-1 gap-y-14 lg:grid-cols-12 lg:items-start lg:gap-x-10"
      >
        {/* Headline column */}
        <div className="lg:col-span-8">
          <RevealItem
            as="p"
            className="flex items-baseline gap-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute"
          >
            <span>01</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>Index</span>
            <span aria-hidden className="text-mute/70">
              ·
            </span>
            <span>Kartik Jindal — DevOps / Cloud Infra</span>
          </RevealItem>

          <RevealItem as="h1">
            <span
              id="hero-headline"
              className="mt-10 block font-display text-[clamp(2.75rem,9vw,9rem)] font-normal leading-[0.95] tracking-[-0.02em] text-ink sm:mt-14 lg:mt-16"
            >
              I build cloud infrastructure
              <br className="hidden sm:block" />{" "}
              <span className="font-serif italic tracking-[-0.01em]">
                that doesn&rsquo;t wake people up
              </span>{" "}
              <span className="font-serif italic tracking-[-0.01em]">
                at 3am.
              </span>
            </span>
          </RevealItem>

          <RevealItem
            as="p"
            className="mt-10 max-w-[46ch] font-sans text-lg leading-[1.55] text-ink sm:mt-12 sm:text-xl"
          >
            DevOps engineer at Intuit, shipping from{" "}
            <span className="whitespace-nowrap">{profile.location.split(",")[0]}</span>.
            Quiet systems, loud receipts.
          </RevealItem>
        </div>

        {/* Stats column — sits below copy on mobile/tablet, floats right on desktop */}
        <RevealItem
          as="div"
          className="lg:col-span-4 lg:mt-[calc(2.5rem+0.2em)] lg:pl-2"
        >
          <dl className="flex flex-col gap-10 sm:flex-row sm:gap-12 lg:flex-col lg:gap-12">
            <StatCard stat={primaryStat} />
            <StatCard stat={secondaryStat} />
          </dl>
        </RevealItem>
      </Reveal>

      {/* Bottom cue row */}
      <Reveal
        as="footer"
        stagger={0.05}
        delay={0.5}
        className="relative z-10 mt-16 flex items-end justify-between font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mute sm:mt-20"
      >
        <RevealItem as="p">Scroll for the build log ↓</RevealItem>
        <RevealItem as="p" className="hidden text-right sm:block">
          01 / 09
        </RevealItem>
      </Reveal>
    </section>
  );
}

function StatCard({
  stat,
}: {
  stat: { value: string; label: string; source: string };
}) {
  return (
    <div className="flex flex-col">
      <dt className="font-display text-5xl font-normal leading-none tracking-[-0.02em] text-ink tabular-nums sm:text-6xl">
        {stat.value}
      </dt>
      <dd className="mt-3 font-sans text-sm leading-snug text-ink">
        {stat.label}
      </dd>
      <dd className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-mute">
        {stat.source}
      </dd>
    </div>
  );
}
