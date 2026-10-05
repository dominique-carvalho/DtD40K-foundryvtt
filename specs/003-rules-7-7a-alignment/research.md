# Research — 003-rules-7-7a-alignment

Data: 2026-09-25. Fonte de regras: DtD 7.7a (constituição v1.2.0); diferenças em
`docs/comparativo-7.7a.md` §1. Código de partida: `main` em `345a67c` (feature 001 completa).

## R1. Semântica dos stunt dice

- **Decision**: `applyModifiers` passa a somar o nível de stunt (0–3) **aos dados rolados e aos
  mantidos** (+XkX), antes de `normalizePool`. A chave `stuntDice` é mantida na API de modificadores
  (`actor.rollSkill`/diálogo) para não quebrar macros; muda só o efeito e o rótulo ("nível de stunt").
- **Rationale**: 7.7a pp. 418–419 — stunts de 1/2/3 dados dão +1k1/+2k2/+3k3. Somar antes da
  normalização mantém a regra de mais de 10 dados única (ex.: 9k8 + 3 → 12k11 → 10k10+15, verificado
  com o `normalizePool` atual).
- **Alternatives considered**: renomear a chave para `stuntLevel` — rejeitado (quebra macros e
  flags de chat da 001 sem ganho funcional).

## R2. Sugestões de TN no diálogo

- **Decision**: constante pura `TN_LADDER` em `module/config.mjs` (10 degraus `{ tn, key }` com
  rótulos i18n `DTD.Roll.TNLadder.<key>`), exibida no campo de TN como `<datalist>` associado ao
  `<input type="number">` existente.
- **Rationale**: o `<datalist>` preserva a entrada livre e o campo vazio (FR-004), mostra rótulo e
  valor na lista do Chromium/Electron do Foundry v13, e escolher um degrau leva 2 cliques (SC-003).
  A constante pura é testável (constituição III).
- **Alternatives considered**: `<select>` + campo numérico separado — rejeitado (dois controles para
  o mesmo valor, mais cliques); botões para cada degrau — rejeitado (10 botões poluem o diálogo).

## R3. Fatigue

- **Decision**: novo campo persistido `system.fatigue.value` (inteiro ≥ 0, padrão 0) e novo derivado
  `fatigueMax = Con`, calculado em `computeDerived` e incluído em `DERIVED_KEYS` (aceita bônus e
  override do Mestre, como os demais derivados).
- **Rationale**: 7.7a pp. 16–17 (máximo = Con). Constituição IV exige que todo valor automatizado
  possa ser sobrescrito pelo Mestre. Atores existentes recebem o valor inicial do schema ao carregar
  (sem migração). Penalidades automáticas ficam fora de escopo (spec, Assumptions).
- **Alternatives considered**: exibir só o máximo — rejeitado (máximo sem valor atual não tem uso na
  mesa); aplicar −1k0 automaticamente — adiado para a feature de combate/condições.

## R4. Iniciativa social

- **Decision**: exibir no rodapé `1d10 + (Fel + Cmp)` a partir do contexto da ficha, ao lado da
  iniciativa de combate. Sem rolagem automática nesta feature (combate social é feature futura).
- **Rationale**: 7.7a p. 446; espelha a exibição da iniciativa de combate já existente (FR-029 da 001).

## R5. Perícias

- **Decision**: em `SKILLS` (`module/config.mjs`), `acrobatics.advanced = false` e
  `athletics.characteristic = "str"`. Nenhum dado armazenado muda; ficha, paradas e rolagens usam a
  configuração automaticamente.
- **Rationale**: 7.7a p. 25. Medicae permanece Avançada (texto p. 27 prevalece sobre a ficha,
  `docs/comparativo-7.7a.md` §1).

## R6. Citações de página nas specs da 001

- **Decision**: atualizar `specs/001-system-foundation/spec.md`, `data-model.md` e
  `contracts/*.md` apenas nas regras tocadas aqui (Advanced, Athletics, stunt, TN, Fatigue,
  iniciativa social), com nota de fonte 7.7a; o restante é revisado quando cada área for tocada.

## R7. Convivência com a feature 002

- **Risco**: a branch `002-race-compendium` altera os mesmos arquivos (ficha, `config.mjs`,
  `derived.mjs`, spec da 001) e, pelo que foi observado, já aplica parte destas regras.
- **Decision**: implementar aqui de forma mínima e bem testada; o conflito é resolvido no merge de
  quem chegar depois à `main`. Registrar no PR a lista exata de mudanças para facilitar a resolução.
