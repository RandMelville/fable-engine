# fable-engine

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21302155.svg)](https://doi.org/10.5281/zenodo.21302155)
[![INPI](https://img.shields.io/badge/INPI-BR512026007059--7-1f6feb)](./docs/inpi/BR512026007059-7-certificado-de-registro.pdf)

A tiny, framework-free TypeScript engine for **interactive narratives**, with a Canvas 2D
player and **self-contained, offline HTML export**. Zero runtime dependencies.

You describe a story as data (scenes, state variables, choices, conditionals); the engine plays
it in the browser and can export it as a single `.html` file that runs anywhere, offline,
forever, with no server and no network requests.

It was built to make the **algorithm the author builds observable and executable**: the story is a
state machine the player runs, and `summarizeAlgorithmicStructure` gives a deterministic account of
the computational constructs in it (scenes, variables, branches, modifiers), a description of what
was built as evidence for interpreting computational thinking, not a score of cognitive faculties.

## Install

```bash
npm install fable-engine
```

## Quick start

```ts
import { Player, exportHtml, summarizeAlgorithmicStructure, type Story } from "fable-engine";

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

// See a deterministic summary of this story's computational structure
summarizeAlgorithmicStructure(story);
// → { scenes: 2, variables: 1, branches: 2, modifiers: 1 }

// Or export a self-contained, offline .html
const html = exportHtml(story);
```

> `Conditional` (state-based branching) and `repeat` (loops) are shown in the full runnable
> story in [`examples/fox-and-wolf.ts`](./examples/fox-and-wolf.ts).

## Why it exists

- **Offline & portable (*file over app*).** `exportHtml` inlines the story JSON, the player
  runtime, and the CSS into one HTML file with **no external references**; it opens offline in
  any browser, with no platform behind it.
- **A small, honest vocabulary.** The whole surface is `Scene`, `Variable`, `Choice`,
  `Conditional`, and nothing else to learn that isn't also a decision about the story.
- **Instrumentable.** The player tracks the path taken and the final state, so the narrative
  itself becomes research data.
- **Deterministic structural summary.** `summarizeAlgorithmicStructure` describes the computational
  constructs in a story (scenes, variables, branches, modifiers) by counting: reproducible, no AI,
  no inference. It describes what the author built, not a cognitive score.

## Public API

| Export | Purpose |
| --- | --- |
| `Story`, `Scene`, `Variable`, `Choice`, `Conditional`, `Action`, `Modifier`, `Character`, `State` | The data model (types). |
| `Player(container, story, options?)` | Canvas 2D player. |
| `exportHtml(story, options?)`, `downloadHtml(name, html)` | Self-contained offline export. |
| `initialState`, `evaluateConditional`, `applyModifier`, `nextSceneByConditional`, `flatten` | Pure engine functions (fully unit-tested). |
| `summarizeAlgorithmicStructure(story)` | Deterministic summary of a story's computational structure. |

## Develop

```bash
npm run build      # standalone bundle + dist (ESM + .d.ts)
npm test           # headless self-check (engine unit tests)
npm run test:e2e   # headless-browser check: exported .html plays offline, zero network requests
npm run typecheck  # strict TypeScript, no `any`
```

## License

[MIT](./LICENSE).

## Citing

If you use fable-engine in academic work, please cite it (see [`CITATION.cff`](./CITATION.cff)).

## Software registration (INPI, Brazil)

fable-engine is registered as a computer program with the Brazilian National Institute of
Industrial Property (INPI), under Law 9.609/98:

| | |
| --- | --- |
| Process | **BR512026007059-7** |
| Certificate issued | 01/09/2026 (petition 870260087328, filed 26/08/2026) |
| Title | fable-engine |
| Holder | Universidade Federal do Rio Grande do Sul (UFRGS) |
| Authors | Randerson Oliveira Melville Rebouças; Marcelo Magalhães Foohs; Rosa Maria Vicari |
| Registered snapshot | tag [`v1.0.0`](https://github.com/RandMelville/fable-engine/releases/tag/v1.0.0), commit `b4eeb77` |
| Hash (SHA-512) | `b5c2268db9813d8618dd98ab6fde186c5385430ccca642f7c2c8635a0539cdf8fc4a30ac8405a778b78d6dae4175a7f57fa62744b073c59a5a5dbb742ab00d72` |

Documents in [`docs/inpi/`](./docs/inpi/):

- [`BR512026007059-7-certificado-de-registro.pdf`](./docs/inpi/BR512026007059-7-certificado-de-registro.pdf):
  the certificate issued by INPI.
- [`fable-engine-v1.0.0-codigo-fonte.pdf`](./docs/inpi/fable-engine-v1.0.0-codigo-fonte.pdf):
  the full source listing of v1.0.0 that was filed. Its SHA-512 is the hash printed on the
  certificate, so `shasum -a 512 docs/inpi/fable-engine-v1.0.0-codigo-fonte.pdf` verifies the
  correspondence between the certificate and this repository.
- [`fable-engine-v1.0.0-hashes.txt`](./docs/inpi/fable-engine-v1.0.0-hashes.txt): per-file
  SHA-256 of the registered snapshot.

The registration can also be looked up by process number in the [INPI search portal](https://busca.inpi.gov.br/pePI/).
The MIT license is unaffected: registration documents authorship and date of creation, it does not
restrict use.

---

### Contexto (pt-BR)

O `fable-engine` nasceu na plataforma educacional **RemidiAção** (PPGIE/UFRGS), onde
operacionaliza a **remidiação** de textos escritos em narrativas digitais interativas, parte do
**Ciclo de Remidiação Ativa (CRA)**. Aqui ele é publicado como biblioteca genérica e reutilizável;
o vocabulário de autoria (cena, variável, escolha, condicional) e o resumo determinístico da
estrutura são os mesmos, com a API em inglês para maior alcance. A API pública é `Story` (a "fábula"); você a descreve
como dado e o motor a executa e exporta offline.

O motor tem **Registro de Programa de Computador no INPI** (Lei 9.609/98), processo
**BR512026007059-7**, certificado expedido em 01/09/2026, com a UFRGS como titular e os três
autores acima. O registro cobre o snapshot da tag `v1.0.0` (commit `b4eeb77`); o certificado e a
listagem de código-fonte que gerou o hash registrado estão em [`docs/inpi/`](./docs/inpi/). A
licença MIT continua valendo: o registro comprova autoria e data de criação, não restringe o uso.
