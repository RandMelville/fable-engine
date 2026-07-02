// Procedural drawing of the curated backgrounds (Canvas 2D, framework-free, no
// external images — keeps the "file over app" export light and offline).
//
// Each background paints simple vector elements (trees, sun, moon, stars,
// buildings, waves) over the sky/ground already filled by the player. Fixed
// positions (no randomness) for a stable, reproducible look.

const GROUND_Y = 300;

// --- Primitives ---------------------------------------------------------------

function leafyTree(ctx: CanvasRenderingContext2D, x: number, scale = 1): void {
  const base = GROUND_Y + 6;
  ctx.fillStyle = "#92400e";
  ctx.fillRect(x - 5 * scale, base - 34 * scale, 10 * scale, 34 * scale);
  ctx.fillStyle = "#16a34a";
  for (const [dy, r] of [
    [54, 30],
    [74, 26],
    [92, 20],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x, base - dy * scale, r * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}

function pineTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  scale = 1,
  color = "#15803d",
): void {
  const base = GROUND_Y + 6;
  ctx.fillStyle = "#92400e";
  ctx.fillRect(x - 4 * scale, base - 16 * scale, 8 * scale, 16 * scale);
  ctx.fillStyle = color;
  for (const [dy, width, height] of [
    [16, 34, 34],
    [38, 28, 30],
    [58, 22, 26],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x, base - (dy + height) * scale);
    ctx.lineTo(x - width * scale, base - dy * scale);
    ctx.lineTo(x + width * scale, base - dy * scale);
    ctx.closePath();
    ctx.fill();
  }
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (const [dx, dy, r] of [
    [0, 0, 18],
    [22, 4, 14],
    [-20, 6, 13],
    [6, -8, 14],
  ] as const) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function sun(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.strokeStyle = "rgba(250,204,21,0.8)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26);
    ctx.lineTo(x + Math.cos(a) * 36, y + Math.sin(a) * 36);
    ctx.stroke();
  }
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.fill();
}

function moon(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

function stars(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#fde68a";
  const pts = [
    [60, 50],
    [140, 90],
    [220, 40],
    [300, 80],
    [420, 55],
    [520, 95],
    [600, 45],
    [660, 100],
    [180, 150],
    [560, 150],
  ] as const;
  for (const [x, y] of pts) {
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function building(
  ctx: CanvasRenderingContext2D,
  x: number,
  width: number,
  height: number,
): void {
  const top = GROUND_Y - height;
  ctx.fillStyle = "#64748b";
  ctx.fillRect(x, top, width, height);
  ctx.fillStyle = "#fde047";
  for (let wy = top + 10; wy < GROUND_Y - 10; wy += 22) {
    for (let wx = x + 8; wx < x + width - 8; wx += 20) {
      ctx.fillRect(wx, wy, 8, 10);
    }
  }
}

function waves(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "rgba(56,189,248,0.7)";
  ctx.lineWidth = 3;
  for (let row = 0; row < 3; row++) {
    const y = GROUND_Y + 16 + row * 20;
    ctx.beginPath();
    for (let x = 0; x <= 720; x += 40) {
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 10, y - 6, x + 20, y);
      ctx.quadraticCurveTo(x + 30, y + 6, x + 40, y);
    }
    ctx.stroke();
  }
}

// --- Composition per background -----------------------------------------------

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  key: string | undefined,
): void {
  switch (key) {
    case "forest":
      cloud(ctx, 580, 70);
      pineTree(ctx, 80, 1.1);
      pineTree(ctx, 180, 0.9);
      pineTree(ctx, 300, 1.2);
      pineTree(ctx, 470, 1);
      pineTree(ctx, 600, 1.15);
      pineTree(ctx, 680, 0.85);
      break;
    case "night":
      stars(ctx);
      moon(ctx, 620, 70);
      pineTree(ctx, 110, 1, "#14532d");
      pineTree(ctx, 250, 1.1, "#14532d");
      pineTree(ctx, 520, 0.95, "#14532d");
      break;
    case "beach":
      sun(ctx, 110, 80);
      cloud(ctx, 470, 70);
      waves(ctx);
      break;
    case "city":
      cloud(ctx, 150, 70);
      building(ctx, 70, 70, 150);
      building(ctx, 170, 90, 210);
      building(ctx, 290, 60, 120);
      building(ctx, 380, 100, 190);
      building(ctx, 510, 80, 240);
      building(ctx, 620, 70, 150);
      break;
    case "field":
    default:
      sun(ctx, 90, 70);
      cloud(ctx, 330, 60);
      cloud(ctx, 560, 90);
      leafyTree(ctx, 150, 0.9);
      leafyTree(ctx, 520, 1.05);
      leafyTree(ctx, 650, 0.8);
      break;
  }
}
