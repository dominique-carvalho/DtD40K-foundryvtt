# Data Model — 027

## Rascunho do assistente (flag `dtd40k.builderDraft`, versão 1)

| Campo | Tipo | Padrão | Notas |
|---|---|---|---|
| `backings` | `{ name: string, value: number }[]` | `[]` | `value` 1–5; sem nome não vai para a ficha |
| `inheritance` | `{ uuid: string }[]` | `[]` | itens do compêndio `dtd40k.equipment`; repetição permitida; `uuid` vazio = linha sem item |

Rascunhos antigos: `loadDraft` mescla com `blankDraft`, então os campos aparecem vazios (FR-008).

## Ficha (sem mudança de esquema, spec 011)

- `system.backgrounds.backings: { id, name, value }[]` — recebe um por Backing com nome.
- `system.backgrounds.inheritancePicks: Record<rarity, number>` — recebe a contagem dos itens herdados.
- Itens herdados: `Item` de equipamento no ator, com `startingSlot` da raridade (ou sem vaga, se o passo foi liberado
  acima da nota).

## Regras

- `validateBackgrounds({ backgrounds, wealth, artifacts, backings })` → `{ ok, reasons, warnings, xp, free }`;
  `warnings` inclui `unnamedBacking`.
- `inheritanceItems({ level, items })` → `{ ok, reasons: ("inheritanceOver"|"artifact")[], picks, used, max }`.
