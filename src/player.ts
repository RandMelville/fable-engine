/**
 * Animated player — pure Canvas 2D, zero dependencies.
 *
 * Runs each scene's animation program (interpolated movement, speech bubbles),
 * keeps variable state (HUD), handles choices (branching) and conditionals
 * (state-based branching).
 *
 * - ``stop()`` ends the animation loop (cleanup when unmounting);
 * - it tracks the **path** (sequence of scenes) and, on reaching an ending,
 *   calls ``onComplete(path, finalState)``;
 * - interactive transitions **tolerate a missing target** (story under
 *   construction): a choice without a valid target is ignored instead of breaking.
 */

import {
  applyModifier,
  countCSTAPillars,
  evaluateConditional,
  flatten,
  initialState,
  nextSceneByConditional,
  type Character,
  type Story,
  type PrimitiveStep,
  type Scene,
  type State,
} from "./engine";
import { resolveBackground } from "./backgrounds";
import { drawBackground } from "./drawBackground";
import { drawCharacter } from "./drawCharacter";

interface SpriteRuntime {
  def: Character;
  x: number;
  y: number;
  visible: boolean;
  bubble: { text: string; mood: string; remainingMs: number } | null;
  phase: number;
}

export interface PlayerOptions {
  /** Called on reaching an ending (a scene with no choices and no conditional). */
  onComplete?: (path: string[], finalState: State) => void;
  /** UI labels (i18n). */
  labels?: { end?: string; playAgain?: string; thought?: string };
}

const WIDTH = 720;
const HEIGHT = 420;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export class Player {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private choicesPanel: HTMLElement;
  private cstaPanel: HTMLElement;

  private story: Story;
  private state: State;
  private scene!: Scene;
  private sprites = new Map<string, SpriteRuntime>();

  private steps: PrimitiveStep[] = [];
  private stepIndex = 0;
  private stepElapsed = 0;
  private moveBase: { x: number; y: number } | null = null;
  private sceneSettled = false;
  private conditionalWaitMs = 0;

  private lastTick = 0;
  private stopped = false;
  private rafId = 0;
  private path: string[] = [];
  private finished = false;
  private options: PlayerOptions;

  constructor(container: HTMLElement, story: Story, options: PlayerOptions = {}) {
    this.story = story;
    this.options = options;
    this.state = initialState(story);

    this.canvas = document.createElement("canvas");
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.canvas.className = "stage";
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");
    this.ctx = ctx;

    this.choicesPanel = document.createElement("div");
    this.choicesPanel.className = "choices";
    this.cstaPanel = document.createElement("div");
    this.cstaPanel.className = "csta";

    container.appendChild(this.canvas);
    container.appendChild(this.choicesPanel);
    container.appendChild(this.cstaPanel);

    this.renderCSTA();
    this.goToScene(story.initialSceneId);
    this.rafId = requestAnimationFrame(this.loop);
  }

  /** Ends the animation loop (cleanup when unmounting). */
  stop(): void {
    this.stopped = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  restart(): void {
    this.state = initialState(this.story);
    this.path = [];
    this.goToScene(this.story.initialSceneId);
  }

  private sceneExists(id: string): boolean {
    return this.story.scenes.some((s) => s.id === id);
  }

  private goToScene(id: string): void {
    const scene = this.story.scenes.find((s) => s.id === id);
    if (!scene) return; // tolerate a missing target (story under construction)
    this.scene = scene;
    this.path.push(id);
    this.finished = false; // new scene: the ending has not been reached yet

    this.sprites.clear();
    scene.characters.forEach((c, i) => {
      this.sprites.set(c.id, {
        def: c,
        x: c.x,
        y: c.y,
        visible: false,
        bubble: null,
        phase: i * 1.3,
      });
    });

    this.steps = flatten(scene.actions);
    this.stepIndex = 0;
    this.stepElapsed = 0;
    this.moveBase = null;
    this.sceneSettled = false;
    this.conditionalWaitMs = 0;
    this.choicesPanel.innerHTML = "";
  }

  private loop = (t: number): void => {
    if (this.stopped) return;
    if (!this.lastTick) this.lastTick = t;
    const dt = Math.min(t - this.lastTick, 64);
    this.lastTick = t;

    this.update(dt);
    this.draw(t);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number): void {
    for (const s of this.sprites.values()) {
      if (s.bubble) {
        s.bubble.remainingMs -= dt;
        if (s.bubble.remainingMs <= 0) s.bubble = null;
      }
    }

    if (!this.sceneSettled) {
      this.advanceProgram(dt);
      return;
    }

    if (this.scene.conditional && !this.scene.choices) {
      this.conditionalWaitMs += dt;
      if (this.conditionalWaitMs > 700) {
        const target = nextSceneByConditional(this.scene.conditional, this.state);
        if (this.sceneExists(target)) this.goToScene(target);
        else this.renderEnd(); // empty target → end instead of freezing
      }
    }
  }

  private advanceProgram(dt: number): void {
    if (this.stepIndex >= this.steps.length) {
      this.sceneSettled = true;
      this.onSettle();
      return;
    }

    const step = this.steps[this.stepIndex];
    const sprite =
      "characterId" in step ? this.sprites.get(step.characterId) : undefined;

    if (step.type === "appear") {
      if (sprite) sprite.visible = true;
      this.nextStep();
      return;
    }

    this.stepElapsed += dt;

    if (step.type === "wait") {
      if (this.stepElapsed >= step.durationMs) this.nextStep();
      return;
    }

    if (step.type === "speak") {
      if (sprite) {
        sprite.visible = true;
        sprite.bubble = {
          text: step.text,
          mood: step.mood ?? "",
          remainingMs: step.durationMs,
        };
      }
      if (this.stepElapsed >= step.durationMs) this.nextStep();
      return;
    }

    if (step.type === "move" && sprite) {
      if (!this.moveBase) this.moveBase = { x: sprite.x, y: sprite.y };
      const p = Math.min(this.stepElapsed / step.durationMs, 1);
      const e = easeInOutQuad(p);
      sprite.visible = true;
      sprite.x = this.moveBase.x + step.dx * e;
      sprite.y = this.moveBase.y + step.dy * e;
      if (p >= 1) {
        this.moveBase = null;
        this.nextStep();
      }
    }
  }

  private nextStep(): void {
    this.stepIndex += 1;
    this.stepElapsed = 0;
  }

  private onSettle(): void {
    if (this.scene.choices && this.scene.choices.length > 0) {
      this.renderChoices();
    } else if (!this.scene.conditional) {
      this.renderEnd();
    }
  }

  private draw(t: number): void {
    const ctx = this.ctx;
    // Curated background: sky + ground colors (no images).
    const background = resolveBackground(this.scene.background);
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, background.skyTop);
    sky.addColorStop(1, background.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = background.ground;
    ctx.fillRect(0, 300, WIDTH, HEIGHT - 300);
    // Background elements (trees, sun, buildings…) drawn on the Canvas.
    drawBackground(ctx, this.scene.background);

    for (const s of this.sprites.values()) {
      if (!s.visible) continue;
      const bob = Math.sin(t / 280 + s.phase) * 4;
      const cy = s.y + bob;

      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.ellipse(s.x, s.y + 34, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // "Visual reacts to a variable": if the character's rule holds in the
      // current state, use the alternate (curated) avatar.
      let avatar = s.def.avatar;
      let color = s.def.color;
      const r = s.def.rule;
      if (r && evaluateConditional(this.state[r.variableId], r.operator, r.value)) {
        avatar = r.avatar;
        color = r.color;
      }

      // Drawn character: the face carries the emotion of the current line
      // (mood) — no emoji, no emotion bubble. Speaking opens the mouth slightly.
      drawCharacter(
        ctx,
        { avatar, color, x: s.x, y: cy },
        { mood: s.bubble?.mood, speaking: !!s.bubble },
      );

      ctx.font = "600 13px Inter, system-ui, sans-serif";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.def.name, s.x, cy + 42);

      if (s.bubble) this.drawBubble(s.x, cy - 44, s.bubble.text);
    }

    this.drawHUD();
  }

  private drawBubble(cx: number, cy: number, text: string): void {
    const ctx = this.ctx;
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const lines = this.wrapText(text, 230);
    const pad = 10;
    const lh = 19;
    const w = Math.min(
      250,
      Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2,
    );
    const h = lines.length * lh + pad * 2;
    let x = cx - w / 2;
    let y = cy - h;
    x = Math.max(8, Math.min(x, WIDTH - w - 8));
    y = Math.max(8, y);

    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.strokeStyle = "#c4b5fd";
    ctx.lineWidth = 2;
    this.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad + i * lh));
  }

  private drawHUD(): void {
    const ctx = this.ctx;
    const vars = this.story.variables;
    if (vars.length === 0) return;
    const lines = vars.map((v) => `${v.name}: ${this.state[v.id]}`);
    ctx.font = "600 13px ui-monospace, monospace";
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 20;
    const h = lines.length * 20 + 14;
    const x = WIDTH - w - 12;
    const y = 12;
    ctx.fillStyle = "rgba(124,58,237,0.10)";
    ctx.strokeStyle = "#7C3AED";
    ctx.lineWidth = 1.5;
    this.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#5B21B6";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, x + 10, y + 9 + i * 20));
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const ctx = this.ctx;
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const attempt = current ? `${current} ${word}` : word;
      if (ctx.measureText(attempt).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = attempt;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  private renderChoices(): void {
    this.choicesPanel.innerHTML = "";
    for (const choice of this.scene.choices ?? []) {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.textContent = choice.buttonLabel;
      button.onclick = () => {
        if (!this.sceneExists(choice.targetSceneId)) return; // tolerate unfinished target
        for (const mod of choice.modifiers)
          this.state = applyModifier(this.state, mod);
        this.goToScene(choice.targetSceneId);
      };
      this.choicesPanel.appendChild(button);
    }
  }

  private renderEnd(): void {
    // Guard against re-entrancy: a conditional branch without a valid target
    // re-evaluates every frame; without this, the ending would fire ~60x/s.
    if (this.finished) return;
    this.finished = true;
    this.choicesPanel.innerHTML = "";
    const ending = document.createElement("div");
    ending.className = "ending";
    ending.textContent = this.options.labels?.end ?? "The End 🌱";
    const restart = document.createElement("button");
    restart.className = "choice-btn secondary";
    restart.textContent = this.options.labels?.playAgain ?? "↺ Play again";
    restart.onclick = () => this.restart();
    this.choicesPanel.appendChild(ending);
    this.choicesPanel.appendChild(restart);
    this.options.onComplete?.([...this.path], { ...this.state });
  }

  private renderCSTA(): void {
    const c = countCSTAPillars(this.story);
    this.cstaPanel.innerHTML = "";
    const items = [
      `🧩 ${c.decomposition}`,
      `📦 ${c.abstraction}`,
      `🔀 ${c.algorithmicThinking}`,
      `🔁 ${c.patternRecognition}`,
    ];
    const label = this.options.labels?.thought ?? "Computational thinking:";
    this.cstaPanel.textContent = `${label}  ${items.join("   ·   ")}`;
  }
}
