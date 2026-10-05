# Quickstart — validação da feature 024-compendium-icons

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-024`; `npm run build:icons` e
  `npm run build:packs`; mundo reaberto pela tela de setup (o manifesto muda).

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir os 15 compêndios | Nenhuma entrada com ícone do Foundry; placa Cogitador em todas | US1-1, SC-001 |
| 2 | Comparar Autopistol × Lasgun, Power Sword × Chainaxe, duas drogas, duas magias | Glifos diferentes | US1-2, SC-003 |
| 3 | Conferir as cores: arma, droga, cibernético, magia, armadura, raça | Cor da categoria (research R3) | US1-3 |
| 4 | Ver itens na ficha Cogitador e na Iluminura, no diretório e num cartão de chat, temas claro e escuro | Legíveis a 24 px e a 64 px | US1-4, SC-004 |
| 5 | Importar Dragon, um veículo e uma nave; colocar os tokens | Retrato e token próprios; armas e componentes com ícones | US2 |
| 6 | Arma de NPC com o mesmo nome de uma do equipamento | Mesmo ícone | US2-2 |
| 7 | Criar uma arma, um feat, uma droga e um NPC em branco | Ícones padrão do tipo | US3-1 |
| 8 | Configurações → Atualizar ícones no Mist of Imlarin, com um item de imagem personalizada | Contagens; confirmar troca os ícones antigos; o personalizado fica | US3-2/3 |
| 9 | Rodar `npm run build:icons` de novo | Nenhuma mudança no `git status` | SC-005 |
| 10 | Zip como o da release | Inclui `assets` e `CREDITS.md`; tamanho ≤ 2,4 MB | FR-012, SC-006 |

## Registro de validação — 2026-10-05

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 024 (packs compilados no worktree). O Foundry
precisou ser reiniciado por completo: ele resolve o link do sistema ao iniciar o aplicativo, e só reabrir o mundo
mantinha os packs do repositório principal.

| # | Resultado |
|---|---|
| 1 | 15 compêndios, 1.142 entradas, todas com `systems/dtd40k/assets/icons/…`; 328 itens embutidos e os tokens dos atores também; listas de Equipment (Weapons), Spells (Evocation) e Antagonists (Creatures) com a placa Cogitador |
| 2 | Autopistol × Lasgun, Power Sword × Chain Axe, Frenzor × Stimm, Energyball × Heal: glifos diferentes |
| 3 | Filete na cor da categoria: Lasgun `#c8372f`, Stimm `#e0963a`, Bionic Heart `#62f08f`, Heal `#e2bd66`, Flak `#b3a88f`, Tiefling `#e8dfca` |
| 4 | Ficha Cogitador e Iluminura com armas, armadura, equipamento, cibernético, droga, feat e magia: ícones de 24 px nas linhas (depois da correção) e retrato no octógono/arco; tema claro e escuro legíveis; diretório de atores com os ícones. Os cartões de chat da 021 não mostram imagem de item |
| 5 | Dragon, Ghost, Helicopter e Military Cruiser importados: retrato e token próprios, nítidos no mapa; armas e componentes com ícones |
| 6 | 45 armas embutidas em NPCs com o mesmo nome de uma arma do equipamento: o mesmo ícone em todas |
| 7 | Arma, pistola, feat, droga, magia, NPC e veículo em branco: ícones padrão do tipo (personagem também, com o retrato e o token) |
| 8 | Configurações → Dungeons the Dragoning → Compendium icons → Update icons: "17 images will change: 1 items, 0 actors, 0 prototype tokens and 16 items carried by actors"; confirmado: itens de Aldred Kain e Milton com os ícones do compêndio; imagem personalizada de um item, retrato do Milton e o item sem origem (Speak Language) mantidos |
| 9 | `npm run build:icons` de novo: 0 ícones escritos, 0 packs alterados |
| 10 | Zip como o da release (com `assets` e `CREDITS.md`): 2,31 MB |

Correções feitas na validação:
- As linhas de armas, armaduras, equipamento e magias das fichas não mostravam imagem de item: agora mostram o ícone
  (feats, Assets e classes já mostravam).

Observação: as imagens anteriores do mundo (Aldred Kain, Milton, NPC) ficaram registradas antes da atualização do passo 8.
