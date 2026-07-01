import type { ComponentType } from "react";

export type AnimationId =
  | "snowfall"
  | "autumn"
  | "spring-bloom"
  | "wind"
  | "rainfall"
  | "lanterns"
  | "fireworks"
  | "fireflies"
  | "bats";

export interface AnimationDef {
  id: AnimationId;
  label: string;
  emoji: string;
  description: string;
  // Dynamic import — add new animations here without touching any other file.
  load: () => Promise<{ default: ComponentType }>;
}

export const ANIMATION_REGISTRY: AnimationDef[] = [
  {
    id: "snowfall",
    label: "Snowfall",
    emoji: "❄️",
    description: "Snowflakes",
    load: () => import("./snowfall"),
  },
  {
    id: "autumn",
    label: "Autumn Fall",
    emoji: "🍂",
    description: "Falling Dry Leaves",
    load: () => import("./autumn"),
  },
  {
    id: "spring-bloom",
    label: "Spring Bloom",
    emoji: "🌸",
    description: "Falling Flowers & Petals",
    load: () => import("./spring-bloom"),
  },
  {
    id: "wind",
    label: "Wind Effect",
    emoji: "🌬️",
    description: "Gentle Wind Blowing",
    load: () => import("./wind"),
  },
  {
    id: "rainfall",
    label: "Rainfall",
    emoji: "🌧️",
    description: "Animated Rain",
    load: () => import("./rainfall"),
  },
  {
    id: "lanterns",
    label: "Floating Lanterns",
    emoji: "🏮",
    description: "Floating Lanterns",
    load: () => import("./lanterns"),
  },
  {
    id: "fireworks",
    label: "Firecrackers / Fireworks",
    emoji: "🎆",
    description: "Fireworks",
    load: () => import("./fireworks"),
  },
  {
    id: "fireflies",
    label: "Fireflies",
    emoji: "✨",
    description: "Glowing Drifting Fireflies",
    load: () => import("./fireflies"),
  },
  {
    id: "bats",
    label: "Halloween Bats",
    emoji: "🦇",
    description: "Small Flying Bats",
    load: () => import("./bats"),
  },
];

export function getAnimationDef(id: AnimationId): AnimationDef | undefined {
  return ANIMATION_REGISTRY.find((a) => a.id === id);
}

export const ALL_ANIMATION_IDS = ANIMATION_REGISTRY.map((a) => a.id);

export interface AnimationConfig {
  active: AnimationId[];
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = { active: [] };
