# Contract: integração Foundry (022)

## Token

- `DtdTokenDocument extends foundry.documents.TokenDocument` (`CONFIG.Token.documentClass`):
  - `_inferMovementAction()` → `"phase"` (Phasing + Incorpóreo) · `"fly"` (Flyer) · `super`.
  - `_prepareDetectionModes()` → com Dark Sight e `sight.enabled`: `sight.visionMode = "darkvision"`, alcance ilimitado.
  - `_onRelatedUpdate(update, operation)` → `super`, depois `reset()` e `object?.initializeSources()`.
- `DtdToken extends foundry.canvas.placeables.Token` (`CONFIG.Token.objectClass`):
  - `_getMovementCostFunction(options)` → Crawler: custo base, ignorando a dificuldade do terreno.
- `CONFIG.Token.movement.actions.phase` registrado em `init`: `{ label, icon, order, walls: null,
  canSelect: (token) => phasing && incorporeal }`.

## Serviços

- `ability-service`:
  - `useAbility(actor, index)`: confere usos, cobra a ação (008), coloca o template (área) ou usa o alvo marcado, e
    posta `ability-card.hbs` com os alvos.
  - `resistAbility(message, targetUuid)`: rola a resistência pelo dono do alvo.
  - `applyAbility(message, targetUuid)`: Mestre, via socket; aplica condição, Fatigue e dano.
  - `triggerAuras(actor, trigger)`: chamado pelo turno em `charge`, `allOutAttack` e `turnStart`.
  - `onHitEffects(weapon)`: `extraCritical` para o dano.
- `form-service`:
  - `switchForm(actor, formId)`: custo do recurso, ação (008); recusa sem recurso, com liberação do Mestre.
  - `tickForm(actor)`: no fim do turno, desconta `formRounds` e volta à forma base em 0.
  - `chooseVariant(actor, formId)`: Elemental.
- `npc-service`: `spendResource(actor, n)`, `regainResource(actor, n)`, com linha no chat.
- `minion-service`: `minionAction(squad, key)`: Mover, Correr, Atacar, com o `turnState` da 008 e uma recusa por ataque
  extra; o cartão de ataque ganha Dodge e Parry.
- `attack-service`: `situation.darkness`; aviso de alcance com `distance3d`/`outOfRange`; `braced` para Auto-Stabilized;
  `onHit` no dano.
- `damage-service`: alvo incorpóreo + `incorporealBlocks` → zero com aviso; o Mestre força.
- `turn-service`: Auto-Stabilized → `as: "half"` em `fullAutoBurst`/`suppressingFire`; gatilhos `triggerAuras`; ação
  "Incorpóreo".
- `condition-service`: hook `createActiveEffect` (stunned, unconscious, prone) → `flyingFall` → cartão
  `flight-fall.hbs` para o Mestre; o botão abre a queda da 018 e zera a elevação.

## Ficha

- Aba Antagonista em Edição: editores de traits, abilities (por tipo), feats e formas; em Jogo: botões de usar ability,
  trocar forma, escolher variante, gastar/recuperar recurso.
- Ficha do esquadrão: ações do turno.
