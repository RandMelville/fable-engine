// Draws the CHARACTER on the Canvas (framework-free, no images).
//
// The character is a mascot DRAWN with primitives (like the background in
// drawBackground.ts), whose FACE changes expression according to the mood — no
// speech bubble emotion, no emoji. A curated set of "kinds" (silhouette by
// ears/antenna/beak) plus a color. The same function runs in the player and in
// the "file over app" export (pure Canvas 2D).

export type AvatarKind = "round" | "cat" | "rabbit" | "bear" | "bird" | "robot";

export interface AvatarKindDef {
  key: AvatarKind;
  name: string;
}

export const AVATAR_KINDS: AvatarKindDef[] = [
  { key: "round", name: "Round" },
  { key: "cat", name: "Cat" },
  { key: "rabbit", name: "Rabbit" },
  { key: "bear", name: "Bear" },
  { key: "bird", name: "Bird" },
  { key: "robot", name: "Robot" },
];

export interface ExpressionState {
  mood?: string;
  speaking?: boolean;
}

const EYE_X = 9;
const EYE_Y = -6;
const DARK = "#1f2937";

/** Darkens a hex color (#rrggbb) by a factor (0..1) — body outline/shadow. */
function darken(hex: string, factor = 0.78): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#4b5563";
  const n = parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `rgb(${r},${g},${b})`;
}

/** Ears/antenna/beak of the kind, drawn BEFORE the body (they sit behind). */
function drawFeatureBehind(
  ctx: CanvasRenderingContext2D,
  kind: string,
  color: string,
): void {
  const dark = darken(color);
  ctx.fillStyle = color;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  if (kind === "cat") {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * 9, -26);
      ctx.lineTo(sx * 20, -40);
      ctx.lineTo(sx * 22, -22);
      ctx.closePath();
      ctx.fill();
    }
  } else if (kind === "rabbit") {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx * 9, -42, 6, 18, sx * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "bear") {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * 16, -26, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "robot") {
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(0, -42);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -45, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "bird") {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx * 26, 4, 8, 14, sx * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Eyes according to the mood (happy arcs or spheres with a pupil). */
function drawEyes(ctx: CanvasRenderingContext2D, mood: string): void {
  const happyArc = mood === "happy" || mood === "loving";
  const big = mood === "surprised" || mood === "scared";
  if (happyArc) {
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.5;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * EYE_X, EYE_Y + 1, 5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    return;
  }
  const r = big ? 6.5 : 5;
  const pupil = big ? 3.2 : 2.6;
  // look up when "thinking"
  const dy = mood === "thinking" ? -1.5 : 0;
  for (const sx of [-1, 1]) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sx * EYE_X, EYE_Y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = DARK;
    ctx.beginPath();
    ctx.arc(sx * EYE_X, EYE_Y + dy, pupil, 0, Math.PI * 2);
    ctx.fill();
  }
  // angry eyebrows
  if (mood === "angry") {
    ctx.strokeStyle = DARK;
    ctx.lineWidth = 2.5;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(sx * (EYE_X + 5), EYE_Y - 9);
      ctx.lineTo(sx * (EYE_X - 3), EYE_Y - 5);
      ctx.stroke();
    }
  }
}

/** Mouth according to the mood (smile, frown, "O", open…). */
function drawMouth(
  ctx: CanvasRenderingContext2D,
  mood: string,
  speaking: boolean,
): void {
  ctx.strokeStyle = DARK;
  ctx.fillStyle = DARK;
  ctx.lineWidth = 2.5;
  const y = 9;
  if (mood === "happy" || mood === "loving") {
    ctx.beginPath();
    ctx.arc(0, y - 2, 7, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else if (mood === "sad") {
    ctx.beginPath();
    ctx.arc(0, y + 7, 7, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  } else if (mood === "surprised") {
    ctx.beginPath();
    ctx.arc(0, y + 1, 3.5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (mood === "scared") {
    ctx.beginPath();
    ctx.ellipse(0, y + 1, 4, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === "thinking") {
    ctx.beginPath();
    ctx.moveTo(-2, y);
    ctx.lineTo(5, y);
    ctx.stroke();
  } else if (mood === "angry") {
    ctx.beginPath();
    ctx.arc(0, y + 6, 6, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  } else if (speaking) {
    ctx.beginPath();
    ctx.ellipse(0, y, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // neutral
    ctx.beginPath();
    ctx.moveTo(-4, y);
    ctx.lineTo(4, y);
    ctx.stroke();
  }
}

/**
 * Draws the character centered at ``(x, y)``. ``mood`` sets the facial
 * expression; ``speaking`` opens the mouth slightly when there is no specific mood.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  opts: { avatar: string; color: string; x: number; y: number; scale?: number },
  state: ExpressionState = {},
): void {
  const { avatar, color, x, y, scale = 1 } = opts;
  const mood = state.mood ?? "";
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  drawFeatureBehind(ctx, avatar, color);

  // Body (ellipse) with a darker outline.
  ctx.fillStyle = color;
  ctx.strokeStyle = darken(color);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Light belly (charm).
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 15, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bird beak (in front of the body, below the eyes).
  if (avatar === "bird") {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.lineTo(5, 2);
    ctx.lineTo(0, 9);
    ctx.closePath();
    ctx.fill();
  }

  // Rosy cheeks for the loving mood.
  if (mood === "loving") {
    ctx.fillStyle = "rgba(244,114,182,0.45)";
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(sx * 15, 3, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawEyes(ctx, mood);
  // The bird speaks through its beak; avoid a double mouth.
  if (avatar !== "bird") drawMouth(ctx, mood, !!state.speaking);

  ctx.restore();
}
