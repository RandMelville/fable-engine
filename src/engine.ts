/**
 * Data model and core logic of the story engine.
 *
 * Framework-free core: the data-model types, the critical logic (conditional
 * evaluation, modifiers, CSTA counting) and the "flattening" of a scene's
 * animation program. No external dependencies — this is what makes the
 * self-contained "file over app" export possible.
 */

// ----------------------------------------------------------------------------
// Data model
// ----------------------------------------------------------------------------

export type Operation = "+" | "-" | "=";
export type Operator = ">" | "<" | ">=" | "<=" | "==" | "!=";
export type Value = number | boolean;

export interface Variable {
  id: string;
  name: string;
  type: "number" | "boolean";
  initialValue: Value;
}

export interface Character {
  id: string;
  name: string;
  avatar: string; // kind of avatar drawn (see drawCharacter.ts)
  color: string;
  x: number; // initial position in this scene (px on the stage)
  y: number;
  /** "Visual reacts to a variable": when the condition holds, use this avatar. */
  rule?: {
    variableId: string;
    operator: Operator;
    value: Value;
    avatar: string;
    color: string;
  };
}

/** A scene's animation program. `repeat` is the loop (algorithmic thinking). */
export type Action =
  | { type: "appear"; characterId: string }
  | {
      type: "speak";
      characterId: string;
      text: string;
      durationMs: number;
      mood?: string;
    }
  | {
      type: "move";
      characterId: string;
      dx: number;
      dy: number;
      durationMs: number;
    }
  | { type: "wait"; durationMs: number }
  | { type: "repeat"; times: number; actions: Action[] };

export interface Modifier {
  variableId: string;
  operation: Operation;
  value: Value;
}

export interface Choice {
  id: string;
  buttonLabel: string;
  targetSceneId: string;
  modifiers: Modifier[];
}

export interface Conditional {
  variableId: string;
  operator: Operator;
  value: Value;
  sceneIfTrueId: string;
  sceneIfFalseId: string;
}

export interface Scene {
  id: string;
  title: string;
  text?: string;
  /** Key of the curated background (resolved to colors in the player). */
  background?: string;
  characters: Character[];
  actions: Action[];
  /** If present, the scene waits for the reader's choice (interactive branch). */
  choices?: Choice[];
  /** If present (and no choices), branches by state at the end of the animation. */
  conditional?: Conditional;
}

export interface Story {
  formatVersion: 1;
  title: string;
  author: string;
  variables: Variable[];
  scenes: Scene[];
  initialSceneId: string;
}

export type State = Record<string, Value>;

// ----------------------------------------------------------------------------
// Core logic
// ----------------------------------------------------------------------------

/** Initial narrative state derived from the declared variables. */
export function initialState(story: Story): State {
  const state: State = {};
  for (const v of story.variables) state[v.id] = v.initialValue;
  return state;
}

/** Evaluates a conditional against the current value of a variable. */
export function evaluateConditional(
  current: Value,
  operator: Operator,
  target: Value,
): boolean {
  switch (operator) {
    case "==":
      return current === target;
    case "!=":
      return current !== target;
    case ">":
      return Number(current) > Number(target);
    case "<":
      return Number(current) < Number(target);
    case ">=":
      return Number(current) >= Number(target);
    case "<=":
      return Number(current) <= Number(target);
  }
}

/** Applies a choice modifier to the state (effect on one variable). */
export function applyModifier(state: State, mod: Modifier): State {
  const next: State = { ...state };
  const current = next[mod.variableId];
  if (mod.operation === "=") {
    next[mod.variableId] = mod.value;
  } else if (mod.operation === "+") {
    next[mod.variableId] = Number(current) + Number(mod.value);
  } else {
    next[mod.variableId] = Number(current) - Number(mod.value);
  }
  return next;
}

/** Resolves the next scene after a conditional scene, given the state. */
export function nextSceneByConditional(cond: Conditional, state: State): string {
  const ok = evaluateConditional(state[cond.variableId], cond.operator, cond.value);
  return ok ? cond.sceneIfTrueId : cond.sceneIfFalseId;
}

/**
 * Counts the four CSTA pillars — "computational thinking made visible".
 * decomposition = scenes · abstraction = variables ·
 * algorithmicThinking = choices + conditionals · patternRecognition = modifiers.
 */
export function countCSTAPillars(story: Story): {
  decomposition: number;
  abstraction: number;
  algorithmicThinking: number;
  patternRecognition: number;
} {
  let algorithmicThinking = 0;
  let patternRecognition = 0;
  for (const scene of story.scenes) {
    if (scene.conditional) algorithmicThinking += 1;
    for (const choice of scene.choices ?? []) {
      algorithmicThinking += 1;
      patternRecognition += choice.modifiers.length;
    }
  }
  return {
    decomposition: story.scenes.length,
    abstraction: story.variables.length,
    algorithmicThinking,
    patternRecognition,
  };
}

// ----------------------------------------------------------------------------
// Animation program: flattening (expands `repeat` loops)
// ----------------------------------------------------------------------------

export type PrimitiveStep =
  | { type: "appear"; characterId: string }
  | {
      type: "speak";
      characterId: string;
      text: string;
      durationMs: number;
      mood?: string;
    }
  | {
      type: "move";
      characterId: string;
      dx: number;
      dy: number;
      durationMs: number;
    }
  | { type: "wait"; durationMs: number };

/** Flattens the scene program, expanding `repeat` into linear steps. */
export function flatten(actions: Action[]): PrimitiveStep[] {
  const out: PrimitiveStep[] = [];
  for (const a of actions) {
    if (a.type === "repeat") {
      for (let i = 0; i < a.times; i++) out.push(...flatten(a.actions));
    } else {
      out.push(a);
    }
  }
  return out;
}
