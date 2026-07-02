/**
 * Self-check of the engine's core logic (tests-as-specs).
 * Runs headless: `npm test`. No framework, no browser.
 */

import {
  applyModifier,
  countCSTAPillars,
  evaluateConditional,
  flatten,
  initialState,
  nextSceneByConditional,
  type State,
} from "../src/engine";
import { foxAndWolf } from "../examples/fox-and-wolf";

let ok = 0;
let fail = 0;

function check(name: string, cond: boolean): void {
  if (cond) {
    ok += 1;
  } else {
    fail += 1;
    console.error(`  x ${name}`);
  }
}

// --- evaluateConditional ---
check("courage 2 >= 2", evaluateConditional(2, ">=", 2) === true);
check("courage 1 >= 2 false", evaluateConditional(1, ">=", 2) === false);
check("3 > 2", evaluateConditional(3, ">", 2) === true);
check("2 < 2 false", evaluateConditional(2, "<", 2) === false);
check("== equality", evaluateConditional(5, "==", 5) === true);
check("!= difference", evaluateConditional(5, "!=", 4) === true);
check("boolean == true", evaluateConditional(true, "==", true) === true);
check("boolean == false", evaluateConditional(true, "==", false) === false);

// --- applyModifier (immutable) ---
const base: State = { courage: 0 };
check(
  "add +2",
  applyModifier(base, { variableId: "courage", operation: "+", value: 2 })
    .courage === 2,
);
check(
  "subtract -1",
  applyModifier(base, { variableId: "courage", operation: "-", value: 1 })
    .courage === -1,
);
check(
  "assign =",
  applyModifier(base, { variableId: "courage", operation: "=", value: 9 })
    .courage === 9,
);
check("does not mutate original", base.courage === 0);

// --- flatten (expands repeat) ---
const steps = flatten(foxAndWolf.scenes[0].actions);
check("flatten expands loop 3x -> 9 steps", steps.length === 9);
check(
  "flatten only yields primitive steps",
  steps.every((s) => ["appear", "speak", "move", "wait"].includes(s.type)),
);

// --- countCSTAPillars ---
const c = countCSTAPillars(foxAndWolf);
check("CSTA decomposition = 4 scenes", c.decomposition === 4);
check("CSTA abstraction = 1 variable", c.abstraction === 1);
check(
  "CSTA algorithmicThinking = 2 choices + 1 conditional = 3",
  c.algorithmicThinking === 3,
);
check("CSTA patternRecognition = 2 modifiers", c.patternRecognition === 2);

// --- symbolic playthrough of both branches ---
function run(courageChoice: number): string {
  let state = initialState(foxAndWolf);
  state = applyModifier(state, {
    variableId: "courage",
    operation: "+",
    value: courageChoice,
  });
  const c2 = foxAndWolf.scenes.find((x) => x.id === "c2");
  if (!c2?.conditional) throw new Error("c2 has no conditional");
  return nextSceneByConditional(c2.conditional, state);
}
check("brave choice (+2) -> victory", run(2) === "c_victory");
check("timid choice (-1) -> flight", run(-1) === "c_flight");

console.log(`\nself-check: ${ok} passed, ${fail} failed`);
if (fail > 0) throw new Error(`${fail} check(s) failed`);
