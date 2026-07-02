# fable-engine

A tiny, framework-free TypeScript engine for **interactive narratives** — with a Canvas 2D
player and **self-contained, offline HTML export**. Zero runtime dependencies.

You describe a story as data (scenes, state variables, choices, conditionals); the engine plays
it in the browser and can export it as a single `.html` file that runs anywhere, offline,
forever — no server, no network requests.

It was built to make **computational thinking visible**: the same structure a student creates to
tell a branching story maps deterministically onto the four CSTA pillars (decomposition,
abstraction, algorithmic thinking, pattern recognition).

## Install

```bash
npm install fable-engine
```

## Quick start

```ts
import { Player, exportHtml, countCSTAPillars, type Story } from "fable-engine";

const story: Story = {
  formatVersion: 1,
  title: "The Fox and the Wolf",
  author: "you",
  variables: [{ id: "courage", name: "courage", type: "number", initialValue: 0 }],
  initialSceneId: "s1",
  scenes: [
    {
      id: "s1",
      title: "At the forest's edge",
      characters: [{ id: "fox", name: "Fox", avatar: "cat", color: "#EA580C", x: 120, y: 250 }],
      actions: [
        { type: "appear", characterId: "fox" },
        { type: "speak", characterId: "fox", text: "A choice awaits.", durationMs: 1600 },
      ],
      choices: [
        { id: "brave", buttonLabel: "Step forward", targetSceneId: "s2",
          modifiers: [{ variableId: "courage", operation: "+", value: 1 }] },
        { id: "wary", buttonLabel: "Hang back", targetSceneId: "s2", modifiers: [] },
      ],
    },
    { id: "s2", title: "The clearing", characters: [], actions: [] }, // ending scene
  ],
};

// Play it on the page
new Player(document.getElementById("stage")!, story);

// See the computational-thinking profile of this story
countCSTAPillars(story);
// → { decomposition: 2, abstraction: 1, algorithmicThinking: 2, patternRecognition: 1 }

// Or export a self-contained, offline .html
const html = exportHtml(story);
```

> `Conditional` (state-based branching) and `repeat` (loops) are shown in the full runnable
> story in [`examples/fox-and-wolf.ts`](./examples/fox-and-wolf.ts).

## Why it exists

- **Offline & portable (*file over app*).** `exportHtml` inlines the story JSON, the player
  runtime, and the CSS into one HTML file with **no external references** — it opens offline in
  any browser, with no platform behind it.
- **A small, honest vocabulary.** The whole surface is `Scene`, `Variable`, `Choice`,
  `Conditional` — nothing else to learn that isn't also a decision about the story.
- **Instrumentable.** The player tracks the path taken and the final state, so the narrative
  itself becomes research data.
- **Deterministic CSTA mapping.** `countCSTAPillars` derives the four pillars from structure by
  counting — reproducible, no AI, no inference.

## Public API

| Export | Purpose |
| --- | --- |
| `Story`, `Scene`, `Variable`, `Choice`, `Conditional`, `Action`, `Modifier`, `Character`, `State` | The data model (types). |
| `Player(container, story, options?)` | Canvas 2D player. |
| `exportHtml(story, options?)`, `downloadHtml(name, html)` | Self-contained offline export. |
| `initialState`, `evaluateConditional`, `applyModifier`, `nextSceneByConditional`, `flatten` | Pure engine functions (fully unit-tested). |
| `countCSTAPillars(story)` | Deterministic CSTA profile. |

## Develop

```bash
npm run build      # standalone bundle + dist (ESM + .d.ts)
npm test           # headless self-check (engine unit tests)
npm run typecheck  # strict TypeScript, no `any`
```

## License

[MIT](./LICENSE).

## Citing

If you use fable-engine in academic work, please cite it — see [`CITATION.cff`](./CITATION.cff).

---

### Contexto (pt-BR)

O `fable-engine` nasceu na plataforma educacional **RemidiAção** (PPGIE/UFRGS), onde
operacionaliza a **remidiação** de textos escritos em narrativas digitais interativas — parte do
**Ciclo de Remidiação Ativa (CRA)**. Aqui ele é publicado como biblioteca genérica e reutilizável;
o vocabulário de autoria (cena, variável, escolha, condicional) e o mapeamento CSTA são os mesmos,
com a API em inglês para maior alcance. A API pública é `Story` (a "fábula") — você a descreve
como dado e o motor a executa e exporta offline.
