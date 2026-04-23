import { BuildLog } from "@/components/sections/BuildLog";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { SelectedBuilds } from "@/components/sections/SelectedBuilds";

export default function Home() {
  return (
    <>
      <Hero />
      <BuildLog />
      <SelectedBuilds />
      <Marquee />
    </>
  );
}
