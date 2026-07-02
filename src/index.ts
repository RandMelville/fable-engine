// Public entry point of fable-engine.

export type {
  Operation,
  Operator,
  Value,
  Variable,
  Character,
  Action,
  Modifier,
  Choice,
  Conditional,
  Scene,
  Story,
  State,
  PrimitiveStep,
} from "./engine";

export {
  initialState,
  evaluateConditional,
  applyModifier,
  nextSceneByConditional,
  countCSTAPillars,
  flatten,
} from "./engine";

export { Player } from "./player";
export type { PlayerOptions } from "./player";

export { exportHtml, downloadHtml } from "./export";
export type { ExportLabels } from "./export";
