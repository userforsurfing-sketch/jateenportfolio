import type { ComponentType } from "react";
import neonJumpImg from "@/assets/game-neon-jump.jpg";
import devilTrapImg from "@/assets/game-devil-trap.jpg";
import cyberRacerImg from "@/assets/game-cyber-racer.jpg";
import memoryMatchImg from "@/assets/game-memory-match.jpg";
import snakeXImg from "@/assets/game-snake-x.jpg";
import { NeonJump } from "./games/NeonJump";
import { DevilTrap } from "./games/DevilTrap";
import { CyberRacer } from "./games/CyberRacer";
import { MemoryMatch } from "./games/MemoryMatch";
import { SnakeX } from "./games/SnakeX";
import type { GameProps } from "./types";

export interface GameMeta {
  id: string;
  title: string;
  tagline: string;
  description: string;
  /** 1 (chill) – 5 (brutal) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: string;
  image: string;
  keyboard: string[];
  touch: string;
  goal: string;
  /** Games that rely on arrow keys / space need the shell to block page scrolling. */
  capturesKeys: boolean;
  Component: ComponentType<GameProps>;
}

export const GAMES: GameMeta[] = [
  {
    id: "neon-jump",
    title: "Neon Jump",
    tagline: "Endless runner",
    description: "Leap over neon spikes and blocks as the world speeds up. How far can you go?",
    difficulty: 2,
    difficultyLabel: "Easy to learn",
    image: neonJumpImg,
    keyboard: ["Space / ↑ / W — jump (hold for higher)"],
    touch: "Tap the screen or the JUMP button.",
    goal: "Survive as long as possible. Speed increases over time.",
    capturesKeys: true,
    Component: NeonJump,
  },
  {
    id: "devil-trap",
    title: "Devil Trap",
    tagline: "Trap platformer",
    description: "Five devious levels of hidden spikes, crumbling floors, fake ground and moving platforms.",
    difficulty: 5,
    difficultyLabel: "Brutal",
    image: devilTrapImg,
    keyboard: ["← → / A D — move", "Space / ↑ / W — jump", "Enter — continue after a level"],
    touch: "Use the arrow buttons to move and JUMP to jump.",
    goal: "Reach the glowing portal. Flags are checkpoints. Expect betrayal.",
    capturesKeys: true,
    Component: DevilTrap,
  },
  {
    id: "cyber-racer",
    title: "Cyber Racer",
    tagline: "Arcade racing",
    description: "Weave through traffic on a neon highway. Overtakes earn bonus points.",
    difficulty: 3,
    difficultyLabel: "Medium",
    image: cyberRacerImg,
    keyboard: ["← → / A D — steer", "↑ / W — boost", "↓ / S — brake"],
    touch: "Drag on the road to steer, or use the on-screen buttons.",
    goal: "Drive as far as you can without crashing. Traffic gets faster.",
    capturesKeys: true,
    Component: CyberRacer,
  },
  {
    id: "memory-match",
    title: "Memory Match",
    tagline: "Card puzzle",
    description: "Flip glass cards and find every pair. Pick Easy, Medium or Hard.",
    difficulty: 1,
    difficultyLabel: "Relaxed",
    image: memoryMatchImg,
    keyboard: ["Tab — move between cards", "Enter — flip a card"],
    touch: "Tap cards to flip them.",
    goal: "Match all pairs. Fewer moves and a faster time give a bigger bonus.",
    capturesKeys: false,
    Component: MemoryMatch,
  },
  {
    id: "snake-x",
    title: "Snake X",
    tagline: "Neon classic",
    description: "The classic, reimagined: smooth movement, bonus stars and a snake that keeps speeding up.",
    difficulty: 3,
    difficultyLabel: "Medium",
    image: snakeXImg,
    keyboard: ["Arrow keys / WASD — steer"],
    touch: "Swipe on the board or use the arrow pad.",
    goal: "Eat orbs (+10) and golden stars (+50). Don't hit walls or yourself.",
    capturesKeys: true,
    Component: SnakeX,
  },
];
