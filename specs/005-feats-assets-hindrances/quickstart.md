# Quickstart — validação da feature 005-feats-assets-hindrances

## Pré-requisitos

- Ambiente da 004 (Node 20+, Foundry **13.351**), link `Data/systems/dtd40k` apontando para o worktree
  `DtD40K-foundryvtt-005`, `npm install` feito.
- Foundry na tela de setup (sem mundo aberto) durante o build, e **reiniciado** depois de mudar o
  `system.json` (o manifesto só é relido no boot do servidor).

## Testes automatizados

```bash
npm test
```

Esperado: casos de [contracts/rules-api.md](contracts/rules-api.md) passam, incluindo `packs.test.mjs`
(274 feats, concessões de raças/exaltações/assets) e a suíte das features anteriores sem regressão.

## Build

```bash
npm run build:packs
```

Esperado: `packs/feats/` compilado sem "in use". No mundo, conferir `game.packs.get("dtd40k.feats").index.size === 274`
**antes** de registrar qualquer validação de dados.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Feats | 274 entradas; pastas Feats 181, Racial Feats 49 (16 subpastas; Kobold 4), Assets 22, Hindrances 22 | US1-1 |
| 2 | Abrir Peer, Battle Rage, Halfling Agility, Loco | Grupo com opções, p. 192; dependência Frenzy; Halfling p. 202 com +4 SD; Loco +100 XP e limite 2 | US1-2…5 |
| 3 | pt-BR | Rótulos traduzidos, conteúdo em inglês | US1-6 |
| 4 | Personagem Halfling: Peer → Nobility; Peer → Underworld; Peer → Nobility | Dois Peer; o terceiro recusado (duplicata) | US2-1/2 |
| 5 | Sound Constitution duas vezes | Segunda recusada (não repetível) | US2-3 |
| 6 | I'm Da Boss! no Halfling | Recusado (raça) | US2-4 |
| 7 | Battle Rage sem Frenzy | Pede confirmação (dependência) | US2-5 |
| 8 | Três hindrances | Terceiro recusado; como Mestre, "incluir mesmo assim" | US2-6/7 |
| 9 | Adicionar asset | Aviso informativo de criação | US2-8 |
| 10 | Con 3, Wil 3, Cmp 2: Sound Constitution, Discipline, Sturdy, Sand, Nine Lives | HP 13, Resolve +1, Resilience +1, Fatigue +2, Hero Points 3/3 | US3-1…4 |
| 11 | Tau: Farsighted; Halfling: Halfling Agility; Squat: No One Tougher | Resolve +3 e MD +5; SD 28; SD com Con | US3-2/5/6 |
| 12 | Paranoia | Iniciativa do rodapé e do combate +2 | US3-7 |
| 13 | Made of Mettle com empate; Veteran o' the Wheel | Pede a característica; pede característica e perícia | US3-8/9 |
| 14 | Skill Focus (Pilot, "Starships"); remover o feat | Especialidade aparece marcada do feat, sem botão de remover; some ao remover o feat | US3-10 |
| 15 | Mestre desmarca o modificador de Sound Constitution | HP volta a 12 | US3-11 |
| 16 | Aplicar Aasimar; trocar para Elf | Jaded e Fearless entram "concedido por Aasimar"; saem na troca | US4-1 |
| 17 | Aplicar Gnome | 12 proficiências concedidas | US4-2 |
| 18 | Exaltação Atlantean; depois Promethean | Speak Language (Syrneth); 5 Armor Proficiency | US4-3 |
| 19 | Paragon Aasimar (Perfection → You Will Not Falter); Paragon Gnome (Tuning) | 3 feats concedidos; Tuning pede as 3 escolhas | US4-4/5 |
| 20 | Vampire + Ventrue; qualquer + Academy | Peer (Ventrue); Academy pede 2 Weapon Proficiency distintas; remover Academy tira as duas | US4-6/7 |
| 21 | Kenku Kenjutsu; Kobold K'sten'mannav; Thri-Kreen Lightning Bug | Extracurricular Study; Armor of Contempt; Luminen Blast | US4-8 |
| 22 | Comprar Armor Proficiency (Light) e depois aplicar Gnome; trocar a raça | Sem duplicar; a comprada fica após a troca | US4-9 |
| 23 | Jogador tenta remover feat concedido | Aviso; só o Mestre remove | US4-10 |
| 24 | Observador abre a ficha | Tudo somente leitura | FR-017 |
