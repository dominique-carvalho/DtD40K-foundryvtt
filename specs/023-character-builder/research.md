# Research — 023 Montador de personagem

Base: [inventory.json](inventory.json) (regras pp. 12–19, código 002–021, APIs do Foundry 13.351, issues N1–N12).

## R1 — Rascunho em memória, ator no final (N1, N3, N5)

- **Decisão**: o assistente edita um **rascunho** (objeto simples) e só ao Concluir cria o ator vazio e aplica um
  **plano** em ordem, pelos serviços existentes. Cancelar não deixa ator.
- **Por quê**: criar o ator já com itens embutidos pula os efeitos colaterais dos serviços (feats concedidos, Hero
  Points de raça/exaltação, Perfection); voltar passos fica trivial.
- **Ordem do plano** (N6): criar ator → raça → exaltação → valores de características e perícias (base + dots de
  criação) → especialidades → classe → divindade → backgrounds → Hindrances → Assets → Exalted Asset → compras de XP
  (`advance` e feats) → equipamento → abrir a ficha. Os dots de criação continuam deduzidos como na 016 (valor gravado
  − base − compras de XP do log).

## R2 — Serviços sem perguntas (N2)

- **Decisão**: os serviços ganham um parâmetro de opções para receber as escolhas prontas e não abrir diálogos:
  - `applyRace(actor, race, { choice })`
  - `applyExaltation(actor, item, { selection, replace: true })`
  - `startClass(actor, item, { silent: true })` (pula avisos; recusas continuam valendo)
  - `addFeat(actor, feat, { selection, silent: true })` e `priceFeat(..., { silent })` (sem a confirmação do custo)
  - `addExaltedAsset(actor, asset, { silent: true })` e `priceExaltedAsset(..., { silent })`
  - `raiseBackground(actor, key, { silent: true })`
  - `advance(actor, kind, key, { silent: true })`
  - `addEquipment(actor, item, { starting: true })` (já existe)
- Sem as opções, o comportamento da ficha não muda.
- **Por quê**: reaproveita validações e efeitos colaterais; o assistente já validou cada passo antes.

## R3 — Regras puras do montador

- **Decisão**: `module/rules/builder.mjs` (puro) valida cada passo a partir do rascunho e dos dados do compêndio, sem
  Foundry, reaproveitando `rules/creation.mjs` (prioridades, teto, especialidades), `rules/race.mjs`
  (`needsChoice`, `validateRaceChoice`), `rules/class.mjs` (`checkClassEntry`), `rules/backgrounds.mjs`
  (`backgroundCost`, `canRaise`), `rules/feat.mjs` (`validateFeatAdd`), `rules/xp.mjs` (`advanceCost`, `canAdvance`)
  e `rules/acquisition.mjs` (`startingSlots`). Também calcula o **saldo de XP** (600 + Hindrances − Assets − Exalted
  Asset − backgrounds acima do gratuito − compras) e a **prévia** dos valores finais (base + dots + bônus da raça +
  Statuesque).

## R4 — Janela do assistente

- **Decisão**: `CharacterBuilder extends HandlebarsApplicationMixin(ApplicationV2)`, com PARTS `steps` (lista lateral
  dos passos e estado), `step` (o passo atual, um template por passo, escolhido em `_preparePartContext`), `summary`
  (resumo) e `footer` (Voltar/Avançar/Concluir, aviso de bloqueio). Dados do compêndio por `getIndex({ fields })`,
  carregados uma vez. Design system 021 (`sm-`/tokens).
- **Bloqueio**: Avançar chama a validação pura do passo; com erro, mostra o motivo; o Mestre vê "Liberar" (constituição
  IV), que marca o passo como liberado no rascunho.

## R5 — Botão e criação pelo Mestre (N4)

- **Decisão**: hook `renderActorDirectory` acrescenta o botão em `.header-actions` (mesmo padrão do criador de armas).
  Se `game.user.can("ACTOR_CREATE")`, o assistente cria o ator; senão chama
  `game.users.activeGM.query("dtd40k.createCharacter", { name, img, userId })`, registrado em `CONFIG.queries` no `init`,
  que cria o ator com `ownership: { default: 0, [userId]: 3 }` e devolve o UUID. O resto do plano roda no cliente do
  jogador (agora dono). Sem Mestre ativo: aviso e rascunho mantido.

## R6 — Rascunho salvo

- **Decisão**: flag do usuário `dtd40k.builderDraft` com `{ version, step, data, released }`, gravada a cada
  avanço e ao fechar. Ao abrir com rascunho: "Continuar" ou "Recomeçar". Concluir com sucesso apaga.

## R7 — Equipamento (N9)

- **Decisão**: vagas pelas `STARTING_SLOTS` da 007; cada vaga lista itens da raridade exata, sem os artefatos
  (hearthstones, materiais e wonders, pela pasta/tipo do pack). Quantidade 1. Wealth, Inheritance e Artifacts vêm dos
  backgrounds; Inheritance usa `setInheritancePicks` depois.

## R8 — Especialidades (N10)

- **Decisão**: uma por característica ou perícia com valor final 4 ou mais (`specialtyCheck`), texto livre do jogador.

## R9 — Falha na conclusão (N5)

- **Decisão**: cada etapa do plano em `try`; ao primeiro erro, para, avisa qual etapa falhou, abre a ficha (ainda em
  criação, 016) e mantém o rascunho.
