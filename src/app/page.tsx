import { profile } from "@/data/resume";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-xl space-y-4 text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-mute">
          Shell ready · Step 1 of build
        </p>
        <h1 className="font-display text-display leading-none">
          {profile.name}
        </h1>
        <p className="font-serif italic text-lg text-ink/70">
          Portfolio shell is up. Hero arrives in step 2.
        </p>
      </div>
    </main>
  );
}
