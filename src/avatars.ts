// Curated avatar palette. Each avatar = a drawn KIND (silhouette by
// ears/antenna/beak, see drawCharacter.ts) plus a COLOR. A small, closed set:
// the author PICKS one when creating a character — there is no free graphic
// authoring.

import type { AvatarKind } from "./drawCharacter";

export interface Avatar {
  kind: AvatarKind;
  color: string;
}

export const AVATARS: Avatar[] = [
  { kind: "round", color: "#7C3AED" },
  { kind: "cat", color: "#E11D48" },
  { kind: "rabbit", color: "#D97706" },
  { kind: "bear", color: "#DB2777" },
  { kind: "bird", color: "#2563EB" },
  { kind: "robot", color: "#0891B2" },
  { kind: "round", color: "#059669" },
  { kind: "cat", color: "#CA8A04" },
  { kind: "rabbit", color: "#9333EA" },
  { kind: "bear", color: "#65A30D" },
  { kind: "bird", color: "#0D9488" },
  { kind: "robot", color: "#475569" },
];

/** Default avatar (first of the palette) for a new character. */
export const DEFAULT_AVATAR: Avatar = AVATARS[0];

/** Avatar equality (kind + color) — used to highlight the selection in a picker. */
export function sameAvatar(a: Avatar, kind: string, color: string): boolean {
  return a.kind === kind && a.color === color;
}
