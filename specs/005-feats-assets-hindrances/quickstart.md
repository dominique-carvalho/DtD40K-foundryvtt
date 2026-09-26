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

## Registro de validação

### 2026-09-26 — Foundry 13.351, mundo "teste dtd", usuário Gamemaster (e jogador de teste)

Sistema carregado do worktree `DtD40K-foundryvtt-005` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `index.size` = 274
(181 feat, 49 racialFeat, 22 asset, 22 hindrance), 20 pastas, Racial Feats com 16 subpastas. Os passos
foram executados pelo mesmo caminho da ficha (`_onDropItem`, diálogos respondidos na interface); atores,
um usuário jogador sem senha e um combate de teste foram criados e apagados no fim.

| Passos | Resultado |
|---|---|
| 1 | ✅ 274 entradas; pastas Feats 181, Racial Feats 49 (16 subpastas), Assets 22, Hindrances 22 |
| 2 | ✅ Peer: grupo com as 11 subcategorias, repetível, p. 192, somente leitura com aviso de compêndio bloqueado; Battle Rage "depende de Frenzy"; Halfling Agility raça Halfling e automação +4 SD; Loco +100 XP e limite de 2 (após correção) |
| 3 | ✅ pt-BR: rótulos da ficha de feat e da aba Traits traduzidos; descrições em inglês |
| 4 | ✅ Peer (Nobility) e Peer (Underworld); terceiro Peer (Nobility) recusado como duplicata, com "incluir mesmo assim" para o Mestre |
| 5 | ✅ Sound Constitution: HP 12 → 13; segundo recusado ("só pode ser escolhido uma vez") |
| 6 | ✅ I'm Da Boss! num Halfling recusado (mensagem de raça, texto corrigido nesta validação) |
| 7 | ✅ Battle Rage sem Frenzy pede confirmação ("depende de Frenzy") |
| 8 | ✅ 3º hindrance recusado; como Mestre, incluído ao confirmar; seção mostra "3 / 2" |
| 9 | ✅ Aviso informativo de criação ao adicionar asset/hindrance; Sturdy avisa dos 2 hindrances extras |
| 10 | ✅ Con 3, Wil 3, Cmp 2: HP 12→13, Resolve 5→6, Resilience 4→5, Fatigue 3→5, Hero Points 2/2→3/3 |
| 11 | ✅ Tau Farsighted: Resolve 5→8, MD 15→20; Halfling Agility SD 24→28; Squat No One Tougher SD 16→22 (Con 4 no lugar de Dex 2) |
| 12 | ✅ Paranoia: fórmula de iniciativa `1d10 + Dex + Cmp + 2`; rodapé +5 (Dex 1 + Cmp 2 + 2) |
| 13 | ✅ Made of Mettle num Aasimar oferece só Int e Wil (empatadas em 1) → Wil 1→2; Veteran: Str 2→3 e Stealth 0→1 |
| 14 | ✅ Skill Focus (Pilot: Starships): especialidade aparece só na lista final, não no `_source`; especialidade digitada depois fica só no `_source`; remover o feat tira a do feat |
| 15 | ✅ Mestre desliga o modificador de Sound Constitution: HP 13→12; religa → 13 |
| 16 | ✅ Aasimar concede Jaded e Fearless (grantedBy = raça); troca para Elf remove os dois; Made of Mettle fica marcado "raça incompatível" |
| 17 | ✅ Gnome concede as 12 proficiências |
| 18 | ✅ Atlantean: Speak Language (Syrneth); troca para Promethean: sai o Syrneth, entram 5 Armor Proficiency |
| 19 | ✅ Paragon Aasimar: Perfection → You Will Not Falter → Armor of Contempt, Armor Proficiency (Power), Armor Specialization (Power); Paragon Gnome: Tuning pede 3 escolhas e concede Weapon Specialization/Focus (Laspistol) e Armor Specialization (Light) |
| 20 | ✅ Ventrue: Peer (Ventrue); Academy pede 2 Weapon Proficiency, a 2ª lista já sem a 1ª e repetir reabre o diálogo; remover Academy tira as duas |
| 21 | ✅ Kenjutsu → Extracurricular Study; K'sten'mannav → Armor of Contempt; Lightning Bug → Luminen Blast |
| 22 | ✅ Armor Proficiency (Light) comprada + Gnome: não duplica (ganha a origem); troca de raça: a comprada fica, sem origem |
| 23 | ✅ Jogador (dono) não remove Luminen Blast concedido (aviso "só o Mestre"); removendo Lightning Bug, Luminen Blast sai junto |
| 24 | ✅ Jogador observador: sem edição, sem caixas de modificador |

Não exercitados manualmente (cobertos só pelos testes unitários): Beneficial Mutation, Matron, Noisy Cricket.

Correções feitas durante a validação: Skill Focus passa a ter o nome "Skill Focus (Perícia: especialidade)"
e pode ser escolhido em perícias diferentes (antes o segundo era recusado como duplicata); texto do erro
de raça ("is a racial feat of the Ork race"); ficha de hindrance mostra o limite de 2.
