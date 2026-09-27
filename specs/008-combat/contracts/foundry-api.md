# Contrato — Foundry (008)

## Registro
- `CONFIG.Combat.documentClass = DtdCombat` (ordem do livro), `CONFIG.Combatant.documentClass = DtdCombatant`.
- `CONFIG.statusEffects = STATUS_EFFECTS` (localizados); `CONFIG.specialStatusEffects.DEFEATED = "dead"`.
- Pack `combat-tables` (RollTable, OBSERVER para jogadores).
- `game.socket.on("system.dtd40k")`: o Mestre ativo executa pedidos `applyDamage`, `spendResolve`, `defense`.
- Hooks: `renderChatMessageHTML` (Aplicar, Desfazer, Dodge, Parry, Gastar Resolve, Ceder); `updateCombat` (zera o
  turno na nova rodada, expira efeitos "até o próximo turno", pede testes de fim de turno); `updateActor` (fadiga acima
  da Con, limiares de Insanity; só no cliente do autor).

## Serviços
- `damage-service`: `applyDamage(message, tokens)`, `undoDamage(message)`, `applyCritical(actor, plan)`.
- `turn-service`: `useAction(actor, key, options)` (confere e gasta o turno; abre o ataque/teste/efeito da ação),
  `rollDefense(message, kind)`, `endOfTurn(combatant)`.
- `condition-service`: `toggleCondition(actor, id, { rounds })`, `burnHeroPoint(actor)`, `rest(actor)`.
- `social-service`: `socialAttack(actor, { characteristic, skill })`, `resolveSocial(message, choice)`.
- `mental-service`: `fearTest(actor, rating, { inCombat })`, `addInsanity(actor, points)`.

## Ficha
- Aba `combat`: menu de ações por tipo (com o gasto do turno quando em combate), condições ativas (liga/desliga),
  Critical Damage, estado do ferimento, fadiga, Resolve drenado/Jaded, Insanity e derangements, botões Fear Test,
  Social Attack e (Mestre) Descanso.
