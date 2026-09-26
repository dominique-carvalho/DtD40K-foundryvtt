# Quickstart — validação da feature 004-exaltation-compendium

## Pré-requisitos

- Ambiente da 002 funcionando (Node.js 20+, Foundry **v13** 13.351, sistema linkado em
  `Data/systems/dtd40k` — ver `specs/001-system-foundation/quickstart.md`), com o compêndio Races.
- Neste worktree (`DtD40K-foundryvtt-004`), `npm install` antes do primeiro teste.
- Foundry **fechado** durante o build dos compêndios.

## Testes automatizados

```bash
npm test
```

Esperado: todos os casos de [contracts/rules-api.md](contracts/rules-api.md) passam, incluindo
`packs.test.mjs` (9 exaltações e 75 assets batem com as Tabelas de referência da spec — SC-001,
SC-002) e os testes da 001/002 sem regressão.

## Build dos compêndios

```bash
npm run build:packs
```

Esperado: `packs/exaltations/` e `packs/exalted-assets/` gerados sem erros, junto com `packs/races/`.

## Roteiro manual (UI / integração)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir um mundo DtD, aba Compêndios | "Exaltations" com 9 entradas e "Exalted Assets" com 75 em 10 pastas; sem erros no console (F12) | US1-1, US2-1 |
| 2 | Abrir Werewolf no compêndio | Feral Heart; Rage = Cmp + Wil + Level; recuperação; 4 poderes estáticos; poderes 1–5 Fast Healing, Spirit Walk, Quick Shift, Stoking Fury, Luna's Blessing; p. 95; somente leitura | US1-2 |
| 3 | Conferir as 9 exaltações ao lado do PDF (pp. 67–100) | Power Stat, recurso, fórmula e ordem dos poderes iguais à Tabela de referência; nenhuma frase copiada | SC-001, SC-006 |
| 4 | Abrir Warboss e Mark of Khorne | Paragon/Paragon Racial/Ork/100 XP; Chosen/Khorne com a restrição de magia | US2-2, US2-3 |
| 5 | Trocar o idioma para pt-BR e reabrir uma exaltação e um asset | Rótulos em português; conteúdo em inglês | US1-4, SC-007 |
| 6 | Traya (Tiefling, Cmp 2, Wil 4, Level 1): arrastar Werewolf | "Exaltation: Werewolf" no cabeçalho; aba Traits com Feral Heart 1, Rage 7/7, Fast Healing liberado, 2–5 bloqueados | US3-1, SC-003 |
| 7 | Clicar no 2º ponto do Feral Heart; subir Level para 3 e clicar no 3º ponto | Fica em 1; depois Feral Heart 3, Rage 9 máx., poderes 1–3 liberados | US3-2 |
| 8 | Atlantean (Cha 3, Int 4) com Gnosis 2 | Motes 11/11 | US3-3 |
| 9 | Chosen Level 5, Devotion 5: tentar Faith 4; depois Devotion 3 | Faith 3, Favor 8; com Devotion 3, poderes acima de 2 indisponíveis | US3-4 |
| 10 | Arrastar Vampire sobre o Werewolf (confirmar a troca) | Só Vampire: Blood Potency 1, Vitae 5/5; nada do Werewolf restante | US3-5, SC-005 |
| 11 | Paragon Human (raça com Cha): aplicar | Diálogo do Statuesque sem Cha; Hero Points +2 no máximo e no atual; Multiclass adicionado sozinho | US3-7 |
| 12 | Dragonblooded: aplicar escolhendo Earth | Con +1 (ponto destacado), HP máximo +2, elemento na aba Traits | US3-8 |
| 13 | Remover a exaltação com um asset | Confirmação; exaltação, modificadores e asset somem; Hero Points limitado ao máximo | US3-6 |
| 14 | Werewolf FH 2, Rage 7/7: gastar 1, 1 e tentar o 3º | 6/7 → 5/7, Tell fraca → óbvia; o 3º pede confirmação (limite 2/rodada) | US4-1, US4-2 |
| 15 | Em combate, avançar a rodada | Contador da rodada volta a 0 sem ninguém editar a ficha | US4-3 |
| 16 | Gastar até 6 na cena; depois "nova cena" | Tell aura (4–5) e épica (6+); nova cena zera a Tell | US4-4 |
| 17 | Recurso em 0: gastar | Nada muda; aviso | US4-5 |
| 18 | Werewolf Rage 3/9, FH 3: "+Feral Heart"; Chosen: "ritual diário" | 6/9; Favor cheio | US4-6 |
| 19 | Atlantean 11/11: gastar 2, Unravel 1 | 9/11 com Paradox 2 → 10/11 com Paradox 1 | US4-7 |
| 20 | Paragon Excellence 1: gastar 3 Pressure, "nova cena" | 2/5 → 5/5; rodada e Tell não mudam | US4-8 |
| 21 | Dragonblooded Level 2, Aspect 1: arrastar Blood of Io; depois Double Dragon | Breath 4 → 5; Double Dragon recusado (limite) | US5-1, US5-2 |
| 22 | Paragon: arrastar Extra Action e Action Hero | Ambos entram; AP +2; Hero Points +1 | US5-3 |
| 23 | Werewolf + Mark of Khorne; Paragon Elf + Warboss | Recusados (exaltação / raça incompatível) | US5-4, US5-5 |
| 24 | Repetir o 23 como Mestre | Diálogo "incluir mesmo assim"; ao confirmar, o asset entra | US5-6 |
| 25 | Adicionar qualquer asset | Aviso informativo "assets só na criação" | FR-023 |
| 26 | Como Mestre, desmarcar o modificador Destiny | Hero Points máximo volta; remarcar restaura | FR-027 |
| 27 | Paragon Human: trocar a raça para Ork | Multiclass sai, Warboss entra; Statuesque refeito se ficar inválido | Edge |
| 28 | Abrir a ficha como observador | Exaltação, poderes e contadores só leitura | FR-015 |
