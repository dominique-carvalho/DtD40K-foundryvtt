# Quickstart — validação da feature 028-setting-compendium

## Pré-requisitos

- `npm run build:packs` no worktree `DtD40K-foundryvtt-028` **com o Foundry fechado**; depois o link
  `Data/systems/dtd40k` apontando para o worktree e o Foundry aberto do zero.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Setting como Mestre | 4 pastas (History, Cosmology, Sigil, Crystal Spheres), 18 diários | US1-1, US2-1 |
| 2 | Abrir "Baator" | 4 páginas com resumo curto; ganchos visíveis | US1-2 |
| 3 | Abrir "Sigil" | Visão geral, Lady of Pain, facções (filosofia e líder), locais | US2-2 |
| 4 | Abrir "History of the Wheel" | Eras na ordem do capítulo | US2-3 |
| 5 | Clicar num deus e numa raça citados | Abre a entrada do compêndio | US3-1 |
| 6 | Entrar como jogador (Player2) e abrir "Baator" | Lê condições, habitantes e locais; nos ganchos, só o aviso | US1-3 |

## Validação (2026-10-06, Foundry 13.351, mundo Mist of Imlarin)

| # | Resultado |
|---|---|
| 1 | Compêndio "Setting" (JournalEntry, PLAYER: OBSERVER): 4 pastas (History, Cosmology, Sigil, Crystal Spheres, com as cores dos tokens) e 18 diários; as 15 esferas na pasta Crystal Spheres |
| 2 | Baator: Physical Conditions, Inhabitants, Locations, Adventure Seeds; como Mestre, o aviso e os ganchos (bloco secreto com o botão Reveal do Foundry) |
| 3 | Sigil: Overview, The Lady of Pain, Factions (12 facções com o líder), Locations |
| 4 | History of the Wheel: 6 eras, da War in Heaven (40,000 Years Ago) à Age of the Imperium (Current Day); The Great Wheel: Great Wheel, Astral Sea, Portal Network, Spelljamming Ships, Warp, Umbra |
| 5 | 25 links distintos nos 18 diários, todos resolvidos; clique em "Aasimar" na página de Sigil abriu a ficha da raça |
| 6 | Player2 (jogador): a página Adventure Seeds de Baator mostra só "Story Master only…"; o bloco secreto nem chega à página; Locations legível (Avernus, Asmodeus) |

Junto, as descrições do montador (026) passaram para um ícone "i" com tooltip, validado como Mestre num rascunho só em memória
(o rascunho salvo ficou igual): 44 ícones em Assets/Hindrances (tooltip de Enemy "Someone you wronged… — +100 XP"), 103
classes com o motivo de bloqueio numa linha, alinhado à direita e centrado na altura do nome (ajuste de CSS durante a
validação), 11 ícones em Backgrounds, ícone do seletor de feat que muda com a escolha, ícones no equipamento e na
Inheritance; coluna do ícone reservada nas vagas para os seletores se alinharem (ajuste de CSS durante a validação).
