// Curated moods/expressions per line of speech. The author picks a line's mood
// from a closed set — and the character shows the emotion on its FACE (see
// drawCharacter.ts), not as an emoji or as text in the bubble. The mood key maps
// directly to the facial expression. Empty = neutral.

export interface Mood {
  key: string;
  name: string;
}

export const MOODS: Mood[] = [
  { key: "happy", name: "Happy" },
  { key: "sad", name: "Sad" },
  { key: "angry", name: "Angry" },
  { key: "surprised", name: "Surprised" },
  { key: "scared", name: "Scared" },
  { key: "thinking", name: "Thinking" },
  { key: "loving", name: "Loving" },
];

/** Label of the mood (empty/unknown key → '' = neutral). */
export function moodName(key: string | undefined): string {
  return MOODS.find((m) => m.key === key)?.name ?? "";
}
