# Contract — Mudanças de interface (003)

Deltas sobre `specs/001-system-foundation/contracts/rules-api.md` e `foundry-api.md`.

## Regras puras

- `applyModifiers(base, { stuntDice })`: `stuntDice` limitado a 0–3 soma a **rolados e mantidos**.
- `computeDerived(...)` passa a retornar também `fatigueMax` (= Con, com bônus/override; mínimo 0).
- `TN_LADDER`: `Array<{ tn: number, key: string }>` exportado por `module/config.mjs`, em ordem
  crescente de 5 a 50.

### Casos de teste obrigatórios (novos ou alterados)

1. `applyModifiers({rolled: 5, kept: 3}, {stuntDice: 2})` → `{rolled: 7, kept: 5, flat: 0}`.
2. `stuntDice` 5 → efeito de 3 (8k6 a partir de 5k3); −1 → efeito de 0.
3. `runTest` com base 9k8 e stunt 3 → pool `10k10`, flat 15, conversão `12k11 → 10k10`.
4. `computeDerived` com Con 3 → `fatigueMax` 3; override 5 → 5; bônus −10 → 0.
5. `SKILLS`: exatamente 7 avançadas (lista do data-model); `athletics.characteristic === "str"`;
   `acrobatics.advanced === false`.
6. `buildSkillPool` de Acrobatics com 0 pontos e Dex 3 → 2k2 sem treino (não bloqueado).
7. `TN_LADDER`: 10 itens, TNs 5..50 de 5 em 5, chaves na ordem do data-model.

## Foundry

- **Diálogo de rolagem**: campo "Nível de stunt" (0–3, dica "+1k1 por nível"); campo TN com
  `<datalist>` de `TN_LADDER` (rótulo "Nome (TN)"), entrada livre e vazio permitidos, padrão 15.
- **Ficha — cabeçalho**: caixa "Fatigue" com valor atual editável (edição e jogo) e máximo derivado.
- **Ficha — rodapé**: "Iniciativa social: 1d10 + (Fel + Cmp)" ao lado da iniciativa de combate;
  a tabela de Ajustes do Mestre inclui `fatigueMax`.
- **i18n novas**: `DTD.Roll.TNLadder.*` (10), `DTD.Roll.Dialog.Stunt`, `DTD.Roll.Dialog.StuntHint`
  (texto atualizado), `DTD.Sheet.Fatigue`, `DTD.Sheet.SocialInitiative`, `DTD.Derived.fatigueMax`.
