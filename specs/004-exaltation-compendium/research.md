# Research — 004-exaltation-compendium

Data: 2026-09-25. Fontes: código da feature 002 (padrões de item embutido, efeitos, ficha e packs),
código-fonte do Foundry **13.351** instalado (`resources/app/client`, `resources/app/common`),
`@foundryvtt/foundryvtt-cli` 3.0.4 e o livro **DtD 7.7a** (texto extraído com `pdftotext -layout`;
cap. 5 pp. 64–100 e Exalted Assets pp. 211–223 conferidos coluna a coluna).

## R1. Tipos de item — `exaltation` e `feat` (categoria `exaltedAsset`)

- **Decision**: dois tipos novos de Item:
  - `exaltation` (`ExaltationData`): dados da exaltação **e** o estado dela no personagem (Power
    Stat comprado, gastos, escolhas), como a raça guarda `choice` e `uses.spent`.
  - `feat` (`FeatData`) com `category` ∈ `["exaltedAsset"]` nesta feature. Os Exalted Assets são
    um subtipo de feat no livro (cap. 7) e em `docs/analise-dtd.md` §Items (`feat` com subtipos
    feat, racialFeat, asset, exaltAsset, hindrance). A feature de feats só acrescenta categorias.
- **Rationale**: constituição VI (estruturas reutilizáveis, sem duplicar): um tipo `exaltedAsset`
  isolado teria de ser migrado quando os feats chegarem. YAGNI respeitado: só a categoria
  `exaltedAsset` e os campos que ela usa existem agora.
- **Alternatives considered**: tipo `exaltedAsset` próprio (rejeitado: migração futura certa);
  assets como lista dentro da exaltação (rejeitado: o compêndio precisa de entradas próprias,
  arrastáveis, e o limite de 1 asset é por personagem, não por exaltação).

## R2. Onde vive o estado — gastos guardados, atuais derivados

- **Fato verificado (v13)**: `ClientDocumentMixin#prepareData` chama, nesta ordem,
  `system.prepareBaseData` → `prepareBaseData` → `prepareEmbeddedDocuments` (itens embutidos são
  preparados **e** os Active Effects aplicados aqui) → `system.prepareDerivedData` →
  `prepareDerivedData` (`client/documents/abstract/client-document.mjs` L253–271). Logo, no
  `prepareDerivedData` de um item embutido os derivados do ator (Resolve máximo) **ainda não**
  existem.
- **Decision**:
  - O item `exaltation` embutido guarda só valores comprados/gastos: `powerStat.value` (comprado),
    `resource.spent`, `round.spent` + `round.marker`, `scene.spent`, `pressure.spent` e `selection`.
  - O estado calculado (Power Stat efetivo, máximo e atual do recurso, dívida, Tell, poderes
    liberados, máximo do Pressure) é produzido por uma função pura `computeExaltation(...)`
    chamada no **fim** do `CharacterData.prepareDerivedData`, depois dos derivados do ator, e
    guardado em `actor.system.exaltation` (derivado, nunca persistido — constituição II).
  - Atual = `max(0, max − spent)`. A dívida do Atlantean (Paradox) e do Daemonhost (Resonance) é
    exatamente `spent` (cada ponto gasto vira 1 de dívida e só volta desfazendo-a, pp. 67/75).
- **Rationale**: como no contador de usos da 002 (research R5 de lá), guardar o gasto faz o atual
  acompanhar mudanças do máximo (Level, características, Power Stat) sem migração e resolve o edge
  case "máximo reduzido abaixo do atual" de graça. A dívida sai do mesmo número, sem campo extra.
- **Alternatives considered**: guardar o atual (rejeitado: precisa reajustar a cada mudança do
  máximo); calcular no `prepareDerivedData` do item (rejeitado: Resolve máximo do Wraith e os
  modificadores do ator ainda não estão prontos).

## R3. Fórmulas do máximo e tetos do Power Stat

- **Decision**: fórmulas como enum declarativo (dados no pack, cálculo puro em
  `module/rules/exaltation.mjs`), `resource.formula`:

  | id | Máximo | Exaltação (p.) |
  |---|---|---|
  | `motes` | Cha + Int + 2×PS | Atlantean (68) |
  | `favor` | Devotion + PS | Chosen (72) |
  | `essence` | Wil + Cha + 2×PS | Daemonhost (76) |
  | `breath` | 2×Level | Dragonblooded (80) |
  | `actionPoints` | Level + PS | Paragon (83) |
  | `pyros` | 3×PS | Promethean (88) |
  | `vitae` | 5×PS | Vampire (92) |
  | `rage` | Cmp + Wil + Level | Werewolf (96) |
  | `plasm` | PS + Resolve máximo | Wraith (100) |
  | `fixed` | `resource.fixedMax` | exaltações criadas pelo Mestre |

  Depois da fórmula soma-se `modifiers.exaltation.resourceBonus + resourcePerPowerStat × PS`
  (assets, R6). PS = Power Stat **efetivo**.
- **Teto do Power Stat** (`powerStat.cap`): `level` → `min(comprado, Level)`; `levelAndDevotion`
  (Chosen, Conviction p. 71) → `min(comprado, Level, ⌈Devotion/2⌉)`. Mínimo 1. O comprado é
  preservado (premissa da spec); a ficha limita o input ao teto atual.
- **Rationale**: fórmulas fechadas e testáveis; exaltações do Mestre usam `fixed` (edge case da
  spec) sem abrir um interpretador de fórmulas.
- **Alternatives considered**: fórmulas como string `@cha + @int + 2*@ps` avaliadas por `Roll`
  (rejeitado: depende do Foundry no módulo puro e abre erros de digitação em runtime).

## R4. Gastos, limite por rodada, Tell e "nova cena"

- **Decision**:
  - Gastar 1 ponto (`spendResource`): `resource.spent += 1`, `scene.spent += 1` e `round.spent += 1`.
    Recusado se o atual for 0 (aviso). Se `round.spent ≥ PS efetivo`, abre confirmação (FR-017).
  - **Rodada sem escrita automática**: o item guarda `round.marker = "<combatId>:<round>"` do gasto.
    O pure `roundSpent(stored, marker, currentMarker)` devolve 0 se o marcador mudou. Assim o
    contador "zera" quando a rodada avança sem nenhum cliente precisar escrever no ator (evita
    corrida entre clientes e permissões). Fora de combate o marcador é `"none"` e só a ação manual
    zera. Um hook `updateCombat` (mudança de `round`/`turn`) apenas re-renderiza fichas abertas.
  - **Tell**: `tellLevel(scene.spent)` → 0 nenhuma, 1 fraca, 2–3 óbvia, 4–5 aura, 6+ épica (p. 65).
  - **Nova cena** (`newScene`): zera `scene.spent` e `round.spent`; restaura o Pressure do Paragon.
  - **Recuperação** (`resource.recovery[]`, ações exibidas na ficha): `restoreAll` (spent = 0),
    `regain` com `amount` = número ou `"powerStat"` (spent −= n, mínimo 0), `lose` (spent += n,
    limitado ao máximo), `unravel` (spent −= 1; rótulo "Unravel"/"Eruption" pelo nome da dívida) e
    ajuste manual do atual (spent = max − valor). Nenhuma rolagem (FR-020).
- **Rationale**: tudo determinístico e pequeno (constituição IV); efeitos dos gastos continuam com
  jogador/Mestre (FR-019).
- **Alternatives considered**: zerar o contador por hook gravando no ator (rejeitado: exige um
  cliente "dono" da escrita, dispara N updates a cada rodada e falha com jogadores offline).

## R5. Efeitos da exaltação — Active Effects no item embutido

- **Decision**: igual à raça (002 R1): cada modificador é um `ActiveEffect` `transfer: true` dentro
  do item `exaltation` embutido, gerado na aplicação por `buildExaltationEffects(system, selection)`,
  com `flags.dtd40k.exalted = <id>` e desativável pelo Mestre (FR-027):

  | `exalted` id | Origem | Change |
  |---|---|---|
  | `destiny` | Paragon (p. 83) | `system.heroPoints.max` ADD 2 |
  | `statuesque` | Paragon (p. 83) | `system.characteristics.<k>.value` ADD 1 |
  | `element` | Dragonblooded (p. 79) | `system.characteristics.<k>.value` ADD 1 |
  | `element.hp` | Dragonblooded Earth | `system.modifiers.hpMax` ADD 2 |

  Aplicar Paragon também soma 2 ao `heroPoints.value` (como o Human na 002); remover limita o
  atual ao novo máximo.
- **Perfection** (Paragon): após criar a exaltação, o serviço procura no compêndio
  `dtd40k.exalted-assets` o feat com `prerequisites.race` igual ao **nome** da raça do personagem e
  o adiciona (marcado `flags.dtd40k.grantedBy = "perfection"`). Sem raça ou sem asset (Tiefling):
  aviso informativo. Trocar de raça sendo Paragon (hook no fim de `applyRace`/`removeRace` da 002)
  troca esse asset. Comparação por nome em inglês: as raças do sistema não têm identificador
  próprio; raças do Mestre funcionam se usarem o mesmo nome.
- **Statuesque**: opções = `characteristicOptions(race)` − `race.choice.characteristic` (Human:
  as outras 8; sem raça: as 9). Escolha única → aplicada sem diálogo. Refeita pela ação
  "refazer escolhas" (FR-013) e quando a troca de raça a invalida.

## R6. Efeitos dos Exalted Assets e novos modificadores do ator

- **Decision**: `buildAssetEffects(system)` gera os efeitos pelo `automation` do feat (dados do pack
  simples e testáveis, como a raça). Novos campos em `CharacterData.modifiers` (nunca inputs da
  ficha, 002 R3):

  | Campo | Tipo | Lido por |
  |---|---|---|
  | `modifiers.hpMax` | inteiro, padrão 0 | `computeDerived` (antes do bônus/override do Mestre) |
  | `modifiers.staticDefenseSize` | booleano, padrão `true` | `computeDerived` (−2×Size só se verdadeiro) |
  | `modifiers.exaltation.resourceBonus` | inteiro, padrão 0 | `computeExaltation` |
  | `modifiers.exaltation.resourcePerPowerStat` | inteiro, padrão 0 | `computeExaltation` |

  | `automation` | Asset (p.) | Change |
  |---|---|---|
  | `actionHero` | Action Hero (217) | `system.heroPoints.max` ADD 1 |
  | `extraAction` | Extra Action (217) | `system.modifiers.exaltation.resourceBonus` ADD 2 |
  | `bloodOfIo` | Blood of Io (216) | `system.modifiers.exaltation.resourcePerPowerStat` ADD 1 |
  | `warboss` | Warboss (219) | `system.size` ADD 1, **priority 60** |
  | `longbeard` | Longbeard (219) | `system.modifiers.resilience` ADD 1 |
  | `markOfNurgle` | Mark of Nurgle (213) | `system.modifiers.resilience` ADD 1 |
  | `sloth` | Sloth (215) | `system.modifiers.hpMax` ADD 2 |
  | `elusive` | Elusive (219) | `system.modifiers.staticDefenseSize` OVERRIDE `false` |

- **Fato verificado (v13)**: prioridade padrão = `mode × 10`; o Size da raça é OVERRIDE (50). Um ADD
  com prioridade padrão (20) rodaria antes e seria apagado; por isso o Warboss usa `priority: 60`.
- Action Hero em Paragon: `heroPoints.value += 1` ao adicionar (mesma regra do Destiny).
- **Alternatives considered**: efeitos prontos no JSON do pack (rejeitado: mistura dados de regra e
  de Foundry no conteúdo e perde o teste por `automation`); `derivedMods.hpMax.bonus` (rejeitado
  pela mesma razão da 002 R4: somaria em dobro ao salvar a ficha).

## R7. Validação ao adicionar asset

- **Decision**: `validateAssetAdd({ asset, exaltation, race, assets })` puro →
  `{valid: true}` ou `{valid: false, error}` com `error` ∈ `noExaltation`, `wrongExaltation`,
  `wrongRace`, `limit` (já há um Exalted Asset de grupo que conta no limite), `duplicate`. Os grupos
  `paragon` e `paragonRacial` não contam no limite (premissa da spec, p. 179). Recusa → aviso;
  o Mestre vê um `DialogV2.confirm` para incluir mesmo assim (US5-6). Toda inclusão mostra o aviso
  informativo "assets só na criação de personagem" (FR-023), exceto o concedido por Perfection.
- `DtdItem#_preCreate` ganha a rede de segurança da exaltação única (como a raça); o limite de
  assets fica no serviço (o Mestre pode ultrapassá-lo).

## R8. Ficha do personagem

- **Decision**: a aba `traits` da 002 ganha, abaixo da raça, o cartão da exaltação (cabeçalho com
  imagem/nome/"i"; Power Stat com pontos clicáveis até o teto; recurso atual/máximo com
  gastar/recuperar/ajustar; dívida; rodada `n / PS`; Tell com nível e texto; Pressure do Paragon;
  gastos genéricos com as exceções; poderes estáticos; tabela de 5 poderes liberados/bloqueados;
  modificadores com caixa do Mestre) e a lista de Exalted Assets. O contexto da exaltação sai de
  `character-sheet.mjs` para um módulo próprio `module/apps/exaltation-context.mjs` (a ficha já tem
  483 linhas). Cabeçalho: `Exaltation: <nome>` na linha de identidade (`openExaltation`).
- O input do Power Stat grava `system.powerStat.value` **no item** via ação (`setPowerStat`), não
  pelo formulário do ator.

## R9. Compêndios — fonte, pastas e build

- **Fato verificado**: o CLI 3.0.4 compila entradas `!folders!<id>` para LevelDB (só o caminho NeDB
  as ignora — `lib/package.mjs` L312); `build-packs.mjs` e `extract-packs.mjs` da 002 já percorrem
  todas as pastas de `src/packs/`, então packs novos entram sem mudar os scripts.
- **Decision**:
  - `src/packs/exaltations/*.json` (9 exaltações) e `src/packs/exalted-assets/` **plano** (o
    `compilePack` roda com `recursive: false`, padrão verificado em `lib/package.mjs` L259): 10
    `folder-<group>.json` (documentos `!folders!`) + 75 JSON de feat com `folder` = id da pasta.
  - Manifesto: packs `exaltations` ("Exaltations") e `exalted-assets` ("Exalted Assets"), tipo
    `Item`, mesmo `ownership` de `races`.
  - `tests/unit/packs.test.mjs` passa a validar os dois packs novos contra as tabelas da spec
    (SC-001, SC-002): nomes, fórmulas, Power Stat, ordem dos 5 poderes, contagem por grupo,
    pré-requisitos, `_id`/`_key` únicos, `folder` válido.

## R10. Conteúdo

- **Decision**: dados mecânicos exatos das Tabelas de referência da spec; descrições em inglês,
  redação própria, 2–4 frases por poder e 1 parágrafo por seção de ambientação; `source.page` em
  cada entrada. Quando o resumo tabular do livro diverge do texto completo (Inner Dragon, Mark of
  Order, Mark of Bahamut/Tiamat), vale o texto completo (o próprio livro manda). Ícones do core.
- **Ambiguidades registradas** (decisões da spec, sem mudar regra): exceção do Paragon inclui
  Paragon Racial; Essence da fórmula é o máximo; Chosen Marks sem validação de divindade; ordem da
  tabela de poderes = ordem das linhas do livro (sem números de ponto no texto extraído — conferir
  no PDF durante a implementação, constituição V).
