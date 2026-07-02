// Curated character movements within a scene. The author picks from a closed
// menu; each movement becomes one or more `move` steps in the engine. "Repeat
// N times" exposes the LOOP (algorithmic thinking) in a controlled way —
// expanded by `flatten` in the engine.

interface Segment {
  dx: number;
  dy: number;
  durationMs: number;
}

export interface Movement {
  key: string;
  emoji: string;
  segments: Segment[];
}

export const MOVEMENTS: Movement[] = [
  {
    key: "forward",
    emoji: "➡️",
    segments: [{ dx: 110, dy: 0, durationMs: 700 }],
  },
  {
    key: "back",
    emoji: "⬅️",
    segments: [{ dx: -110, dy: 0, durationMs: 700 }],
  },
  {
    key: "jump",
    emoji: "⤴️",
    segments: [
      { dx: 0, dy: -55, durationMs: 300 },
      { dx: 0, dy: 55, durationMs: 300 },
    ],
  },
  {
    key: "sway",
    emoji: "↔️",
    segments: [
      { dx: -24, dy: 0, durationMs: 200 },
      { dx: 48, dy: 0, durationMs: 300 },
      { dx: -24, dy: 0, durationMs: 200 },
    ],
  },
];

export function findMovement(key: string): Movement | undefined {
  return MOVEMENTS.find((m) => m.key === key);
}
