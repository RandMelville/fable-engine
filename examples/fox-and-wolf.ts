import type { Story } from "../src/engine";

/**
 * Example story — "The Fox and the Wolf".
 *
 * Deliberately exercises every engine feature:
 *  - appear/speak/move    (sprite, say, animation)
 *  - repeat               (loop / algorithmic thinking)
 *  - variable `courage`   (abstraction / state)
 *  - choice with modifier (interactive branch + pattern recognition)
 *  - conditional          (algorithmic thinking / state-based branch)
 */
export const foxAndWolf: Story = {
  formatVersion: 1,
  title: "The Fox and the Wolf",
  author: "example-author",
  variables: [
    { id: "courage", name: "courage", type: "number", initialValue: 0 },
  ],
  initialSceneId: "c1",
  scenes: [
    {
      id: "c1",
      title: "At the forest's edge",
      text: "The Fox comes hopping to the edge of the forest.",
      characters: [
        {
          id: "fox",
          name: "Fox",
          avatar: "cat",
          color: "#EA580C",
          x: 120,
          y: 250,
        },
      ],
      actions: [
        { type: "appear", characterId: "fox" },
        {
          type: "speak",
          characterId: "fox",
          text: "What a lovely day for an adventure!",
          durationMs: 1800,
        },
        // loop: the fox takes 3 little hops (algorithmic thinking made visible)
        {
          type: "repeat",
          times: 3,
          actions: [
            { type: "move", characterId: "fox", dx: 60, dy: -40, durationMs: 350 },
            { type: "move", characterId: "fox", dx: 60, dy: 40, durationMs: 350 },
          ],
        },
        {
          type: "speak",
          characterId: "fox",
          text: "Oops... I heard a noise over there!",
          durationMs: 1800,
        },
      ],
      choices: [
        {
          id: "e1",
          buttonLabel: "Face whatever is coming",
          targetSceneId: "c2",
          modifiers: [{ variableId: "courage", operation: "+", value: 2 }],
        },
        {
          id: "e2",
          buttonLabel: "Hide behind the tree",
          targetSceneId: "c2",
          modifiers: [{ variableId: "courage", operation: "-", value: 1 }],
        },
      ],
    },
    {
      id: "c2",
      title: "The encounter",
      text: "Out of the shadows steps the Wolf.",
      characters: [
        {
          id: "fox",
          name: "Fox",
          avatar: "cat",
          color: "#EA580C",
          x: 150,
          y: 250,
        },
        {
          id: "wolf",
          name: "Wolf",
          avatar: "bear",
          color: "#475569",
          x: 560,
          y: 250,
        },
      ],
      actions: [
        { type: "appear", characterId: "fox" },
        { type: "appear", characterId: "wolf" },
        {
          type: "speak",
          characterId: "wolf",
          text: "Who dares enter my forest?",
          durationMs: 2000,
        },
        { type: "move", characterId: "wolf", dx: -120, dy: 0, durationMs: 900 },
      ],
      // branches by the state accumulated in the choices (algorithmic thinking)
      conditional: {
        variableId: "courage",
        operator: ">=",
        value: 2,
        sceneIfTrueId: "c_victory",
        sceneIfFalseId: "c_flight",
      },
    },
    {
      id: "c_victory",
      title: "Courage!",
      text: "With courage, the Fox faces the Wolf.",
      characters: [
        {
          id: "fox",
          name: "Fox",
          avatar: "cat",
          color: "#EA580C",
          x: 200,
          y: 250,
        },
        {
          id: "wolf",
          name: "Wolf",
          avatar: "bear",
          color: "#475569",
          x: 440,
          y: 250,
        },
      ],
      actions: [
        { type: "appear", characterId: "fox" },
        { type: "appear", characterId: "wolf" },
        {
          type: "speak",
          characterId: "fox",
          text: "I am not afraid of you!",
          durationMs: 2000,
        },
        { type: "move", characterId: "wolf", dx: 220, dy: 0, durationMs: 1100 },
        {
          type: "speak",
          characterId: "fox",
          text: "The forest belongs to all of us! 🎉",
          durationMs: 2200,
        },
      ],
    },
    {
      id: "c_flight",
      title: "The escape",
      text: "Without enough courage, the Fox runs away.",
      characters: [
        {
          id: "fox",
          name: "Fox",
          avatar: "cat",
          color: "#EA580C",
          x: 400,
          y: 250,
        },
        {
          id: "wolf",
          name: "Wolf",
          avatar: "bear",
          color: "#475569",
          x: 520,
          y: 250,
        },
      ],
      actions: [
        { type: "appear", characterId: "fox" },
        { type: "appear", characterId: "wolf" },
        {
          type: "speak",
          characterId: "fox",
          text: "Better come back another day...",
          durationMs: 1800,
        },
        { type: "move", characterId: "fox", dx: -380, dy: 0, durationMs: 1300 },
      ],
    },
  ],
};
