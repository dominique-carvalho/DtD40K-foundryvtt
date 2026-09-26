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

## Registro de validação

### 2026-09-25 — Foundry 13.351, mundo "teste dtd", usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-004` (junction `Data/systems/dtd40k`), packs
gerados com `npm run build:packs`. Atores de teste criados e apagados ao final.

| Passos | Resultado |
|---|---|
| 1 | ✅ Exaltations 9, Exalted Assets 75 em 10 pastas (5/21/5/5/4/15/5/5/5/5); console sem erros do sistema |
| 2 | ✅ Werewolf: Feral Heart, Rage = Cmp + Wil + Level, 4 poderes estáticos, poderes 1–5 na ordem, p. 95, somente leitura com aviso de compêndio bloqueado |
| 3 | ⚠️ Dados conferidos por `packs.test.mjs` e pelos agentes de conteúdo (verificação de n-gramas ≥ 6 palavras contra o PDF); leitura humana das 84 entradas ao lado do PDF ainda recomendada |
| 4 | ✅ Warboss: Paragon Racial Assets, Paragon, Ork, 100 XP, automação Warboss |
| 5 | ✅ pt-BR: cabeçalho "Raça / Exaltação", botões e rótulos traduzidos; conteúdo em inglês |
| 6–7 | ✅ Traya (Tiefling): Feral Heart 1, Rage 7/7, só Fast Healing; 2º ponto não clicável no Level 1; Level 3 + 3º ponto → Rage 9, poderes 1–3 |
| 8–9 | ✅ Atlantean Motes 11; Chosen Faith limitado a 3, Favor 8; Devotion 3 → Faith efetivo 2 (comprado 3), poderes 3–5 bloqueados |
| 10 | ✅ Troca Werewolf → Vampire com confirmação; Blood Potency 1, Vitae 5/5 |
| 11 | ✅ Paragon Human: Statuesque sem Charisma (8 opções), Hero Points 3/3 → 5/5, Multiclass adicionado por Perfection sem aviso "só na criação" |
| 12 | ✅ Dragonblooded Earth: Con +1, HP máx. 12 (+2), Breath 4/4 |
| 13 | ✅ Remover exaltação: confirmação; exaltação, efeitos e Blood of Io removidos |
| 14 | ✅ Gastos 1–3 com Feral Heart 3: rodada 3/3; o 4º pede confirmação ("limite = Feral Heart") |
| 15 | ✅ Combate de teste: após `nextRound` a rodada volta a 0/3 sem gravação no item |
| 16 | ✅ Tell fraca → óbvia → aura → épica (6 pontos); "nova cena" zera |
| 17 | ✅ Recurso 0: botão desabilitado e aviso "No Rage left." |
| 18 | ✅ "+Feral Heart" 3/9 → 6/9 |
| 19 | ✅ Atlantean: gastar 2 → 9/11, Paradox 2; Unravel → 10/11, Paradox 1 |
| 20 | ✅ Pressure 5/5 → gastar 3 → 2/5 (rodada e Tell inalteradas) → nova cena 5/5 |
| 21 | ✅ Blood of Io: Breath 4 → 5; Double Dragon recusado (limite), Mestre recebe "incluir mesmo assim" |
| 22 | ✅ Extra Action e Action Hero: AP 3 → 5, Hero Points 5 → 6 |
| 23–24 | ✅ Mark of Khorne em Vampire e Elven Perfection em Paragon Ork recusados; como Mestre, Khorne incluído ao confirmar |
| 25 | ✅ Aviso informativo ao adicionar asset |
| 26 | ✅ Mestre desmarca Destiny: Hero Points máx. 6 → 4; remarca → 6 |
| 27 | ✅ Paragon Human → Ork: Multiclass sai, Warboss entra (Size 5 + 1 = 6), Statuesque refeito para Willpower (única opção) — corrigido nesta validação |
| 28 | ⏳ Não validado: o mundo só tem o usuário Gamemaster |

Correções feitas durante a validação: Statuesque inválido com uma única opção restante não era
refeito (`reconfigureExaltation`); rádios do diálogo de escolha com 0 px; marcadores da lista de
gastos genéricos; texto do erro `wrongRace`.
