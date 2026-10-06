# Contrato — regras e assistente (027)

## `module/rules/backgrounds.mjs` (puro)

```js
inheritanceUsed(picks) → number          // vagas de nota 1 usadas (a conta interna de inheritanceFits, extraída)
inheritanceFits(level, picks) → boolean  // sem mudança de comportamento
```

## `module/rules/builder.mjs` (puro)

```js
validateBackgrounds({ backgrounds, wealth, artifacts, backings = [] })
  → { ok, reasons, warnings: ["unnamedBacking"?], xp, free }
inheritanceItems({ level, items: { system: { rarity }, artifact: boolean }[] })
  → { ok, reasons: ("inheritanceOver" | "artifact")[], picks: Record<rarity, number>, used, max }
buildPlan({ draft })   // "equipment" quando draft.equipment.length || draft.inheritance.length
```

Casos de teste (`tests/unit/builder.test.mjs`):
- Backing de 2 e de 1 com Wealth 3 e Allies 1: 7 pontos gratuitos, 0 XP; Backing de 4: 100 XP no 4º ponto.
- Backing sem nome: aviso `unnamedBacking`.
- Inheritance 2: um Rare cabe; dois Uncommon cabem; três Uncommon não (`inheritanceOver`); `used`/`max` = 3/2.
- Inheritance 1: quatro Very Common cabem; cinco não.
- Inheritance 0 com itens: `inheritanceOver`. Hearthstone: `artifact`.
- Mesmas combinações dão a mesma resposta que `inheritanceFits` (SC-003).
- `buildPlan` com só itens herdados inclui `equipment`.

## Assistente

- `#validate("backgrounds")` passa `draft.backings`; `#validate("equipment")` junta `inheritanceItems`.
- Ações: `addBacking`, `removeBacking`, `addInheritance`, `removeInheritance`; campos `backings.<i>.name|value`,
  `inheritance.<i>` tratados em `#onField`.
- `applyPlan`: Backings depois dos Artifacts; no `equipment`, `inheritancePicks` → vagas iniciais → itens herdados
  (`starting: true`, com recurso a `starting: false`).
