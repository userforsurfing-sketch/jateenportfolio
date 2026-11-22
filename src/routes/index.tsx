import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/portfolio/About";
import { Backdrop } from "@/components/portfolio/Backdrop";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { GamingZone } from "@/components/portfolio/GamingZone";
import { Hero } from "@/components/portfolio/Hero";
import { Journey } from "@/components/portfolio/Journey";
import { Navbar } from "@/components/portfolio/Navbar";
import { Projects } from "@/components/portfolio/Projects";
import { Skills } from "@/components/portfolio/Skills";

const TITLE = "JATEEN – My Digital Space";
const SITE_URL = "https://jateenportfolio.vercel.app/";
const SHARE_IMAGE = `${SITE_URL}portfolio-share.jpg`;
const DESCRIPTION =
  "Jateen's personal portfolio: projects, skills, journey and a built-in arcade with five original games — Neon Jump, Devil Trap, Cyber Racer, Memory Match and Snake X.";

// One long scrolling page (sections + smooth scrolling), as the brief asks.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: SHARE_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "Jateen's portfolio preview on a neon-lit laptop" },
      { name: "twitter:image", content: SHARE_IMAGE },
      { name: "twitter:image:alt", content: "Jateen's portfolio preview on a neon-lit laptop" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Backdrop />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <GamingZone />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
