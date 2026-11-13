/**
 * Everything personal on the site lives here so it can be edited in one place.
 * Leave a value as `null` until it is real — the UI shows a clearly marked placeholder
 * instead of inventing facts, levels, dates or links.
 */

export type SkillIcon =
  | "html"
  | "css"
  | "js"
  | "react"
  | "python"
  | "design"
  | "puzzle"
  | "spark";

export interface Skill {
  name: string;
  icon: SkillIcon;
  /** 0–100 once confirmed. `null` renders a "level not set yet" placeholder bar. */
  level: number | null;
  note: string;
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  image: "portfolio" | "arcade" | null;
  /** In-site anchor (e.g. "#games") or a real https URL. `null` = not published yet. */
  liveUrl: string | null;
  sourceUrl: string | null;
  placeholder?: boolean;
}

export interface Milestone {
  /** `null` until the real date is known. */
  date: string | null;
  title: string;
  description: string;
  future?: boolean;
}

export const profile = {
  name: "Jateen",
  siteName: "JATEEN – My Digital Space",
  tagline: "Learning. Building. Exploring.",
  roles: "Aspiring Developer | Creative Thinker | Future Builder",
  intro:
    "Welcome to my digital space. I'm passionate about technology, creativity and building interactive experiences. I'm learning, experimenting and turning ideas into reality.",

  /** Real contact details. Keep `null` until they exist — no fake addresses or profiles. */
  contact: {
    email: null as string | null,
    github: null as string | null,
    linkedin: null as string | null,
  },
};

export const about = {
  paragraphs: [
    "I'm Jateen — someone who gets genuinely excited when an idea on paper turns into something you can click, play and explore. This website is my digital space: part portfolio, part playground.",
    "I love coding and technology because they let me build things from nothing. Websites and interactive experiences are where I enjoy that most — mixing logic, design and a bit of fun.",
    "I'm still learning, and I like it that way. Every project teaches me something new, and I try to stay curious, experiment often and improve a little every day.",
  ],
  goals:
    "My goal is to keep growing as a developer and build experiences that people actually enjoy using.",
  highlights: [
    { label: "Original games on this site", value: "5" },
    { label: "Mindset", value: "Always learning" },
    { label: "Favourite mix", value: "Code + creativity" },
  ],
};

export const skills: Skill[] = [
  { name: "HTML", icon: "html", level: null, note: "Structure of the web" },
  { name: "CSS", icon: "css", level: null, note: "Layouts, motion, style" },
  { name: "JavaScript", icon: "js", level: null, note: "Logic & interactivity" },
  { name: "React", icon: "react", level: null, note: "Component-based UIs" },
  { name: "Python", icon: "python", level: null, note: "Scripts & problem solving" },
  { name: "UI/UX Design", icon: "design", level: null, note: "Making things feel right" },
  { name: "Problem Solving", icon: "puzzle", level: null, note: "Breaking problems down" },
  { name: "Creative Thinking", icon: "spark", level: null, note: "Ideas worth building" },
];

export const projects: Project[] = [
  {
    title: "JATEEN – My Digital Space",
    description:
      "This portfolio itself: a dark glassmorphism site with scroll animations, an ambient particle field and a built-in arcade.",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    image: "portfolio",
    liveUrl: "#home",
    sourceUrl: null,
  },
  {
    title: "Neon Arcade",
    description:
      "Five original browser games — Neon Jump, Devil Trap, Cyber Racer, Memory Match and Snake X — playable right on this page.",
    tags: ["Canvas API", "Game loops", "localStorage"],
    image: "arcade",
    liveUrl: "#games",
    sourceUrl: null,
  },
  {
    title: "Your next project",
    description:
      "A slot reserved for the next thing Jateen builds. Add a title, description, image and real links when it's ready.",
    tags: ["Coming soon"],
    image: null,
    liveUrl: null,
    sourceUrl: null,
    placeholder: true,
  },
];

export const journey: Milestone[] = [
  {
    date: null,
    title: "Started exploring technology",
    description: "The curiosity phase — wondering how apps, games and websites actually work.",
  },
  {
    date: null,
    title: "Began learning development",
    description: "First steps with code: HTML, CSS and JavaScript fundamentals.",
  },
  {
    date: null,
    title: "Built my first project",
    description: "Turning lessons into something real that I could share.",
  },
  {
    date: null,
    title: "Improving my coding skills",
    description: "Practising, experimenting and building more ambitious ideas — like this arcade.",
  },
  {
    date: null,
    title: "Future goals",
    description: "Keep learning, build bigger projects and grow into a confident developer.",
    future: true,
  },
];

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "games", label: "Games" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof navItems)[number]["id"];
