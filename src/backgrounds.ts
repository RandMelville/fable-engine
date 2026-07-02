// Curated backgrounds per scene. A small, closed set: the author PICKS a scene's
// background from a menu — they do not draw it. Each background is defined by
// colors (a sky gradient plus the ground), so the player can render it without
// images (keeps the "file over app" export light).

export interface Background {
  key: string;
  skyTop: string;
  skyBottom: string;
  ground: string;
}

export const BACKGROUNDS: Background[] = [
  { key: "field", skyTop: "#dbeafe", skyBottom: "#ecfccb", ground: "#86efac" },
  { key: "forest", skyTop: "#a7f3d0", skyBottom: "#d9f99d", ground: "#22c55e" },
  { key: "night", skyTop: "#1e293b", skyBottom: "#475569", ground: "#334155" },
  { key: "beach", skyTop: "#bae6fd", skyBottom: "#e0f2fe", ground: "#fde68a" },
  { key: "city", skyTop: "#e2e8f0", skyBottom: "#f1f5f9", ground: "#94a3b8" },
];

const DEFAULT_BACKGROUND = BACKGROUNDS[0];

/** Resolves the background key (empty/unknown → default "field"). */
export function resolveBackground(key: string | undefined): Background {
  return BACKGROUNDS.find((b) => b.key === key) ?? DEFAULT_BACKGROUND;
}
