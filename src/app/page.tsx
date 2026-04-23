import { BuildLog } from "@/components/sections/BuildLog";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";
import { GetInTouch } from "@/components/sections/GetInTouch";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { SelectedBuilds } from "@/components/sections/SelectedBuilds";
import { ThenVsNow } from "@/components/sections/ThenVsNow";

export default function Home() {
  return (
    <>
      <Hero />
      <BuildLog />
      <SelectedBuilds />
      <Marquee />
      <ThenVsNow />
      <FAQ />
      <GetInTouch />
      <Footer />
    </>
  );
}
