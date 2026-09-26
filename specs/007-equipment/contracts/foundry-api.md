# Contrato — Foundry (007)

## Registro (`dtd40k.mjs`, `system.json`)

- `documentTypes.Item`: `weapon`, `armor`, `gear` (`htmlFields: ["description"]`).
- `CONFIG.Item.dataModels.{weapon, armor, gear}`; fichas `WeaponSheet`, `ArmorSheet`, `GearSheet` (ItemSheetV2,
  `makeDefault`), rótulos `DTD.Sheet.{Weapon,Armor,Gear}`.
- `CONFIG.ActiveEffect.documentClass = DtdActiveEffect`.
- Pack `equipment` (Item, `packs/equipment`, ownership PLAYER OBSERVER / ASSISTANT OWNER).
- Hook `renderChatMessageHTML`: liga o botão "Rolar dano" dos cartões de ataque e o "Gastar Liquid Wealth" dos
  cartões de aquisição.

## `DtdActiveEffect#isSuppressed`

- Efeito de item `weapon|armor|gear`: suprimido se `!item.system.equipped`.
- `gear` `drug`: suprimido se `!item.system.active`.
- `gear` `hearthstone`: suprimido se não encaixada ou se o hospedeiro não está equipado.
- `armor` com `piece` e `suitOnly`: sempre suprimido.
- Demais efeitos: comportamento do core.

## Serviços

### `equipment-service.mjs`
- `addEquipment(actor, item, { starting })`: soma quantidade se já existe item igual (nome, qualidade, material);
  com `creation.active`, pergunta se é item inicial e confere as vagas (`startingSlotFor`; fora das vagas: recusa
  com override do Mestre).
- `toggleEquipped(actor, itemId)`: mechadendrite acima da Constitution → aviso com override do Mestre.
- `useDose(actor, itemId)`: quantity − 1, `active` true, teste de Willpower contra a Addictivity (pula None);
  falha → sobe `addictions`. `endDose(actor, itemId)`.
- `socketHearthstone(actor, stoneId, hostId)` / `unsocket(actor, stoneId)`: um por hospedeiro; hospedeiro precisa
  de material ou `socket`.
- `setMaterial(item, material)` (Mestre ou dono na ficha do item).

### `attack-service.mjs`
- `rollAttack(actor, itemId | "unarmed", { fastForward })`: diálogo (`promptAttackOptions`), `attackPool` +
  `applyRollModifiers`, `runTest`, d10 de localização, emperramento; posta `attack-card` com
  `flags.dtd40k.attack = { actorUuid, itemId, options, raises, hits, location }`.
- `rollDamage(message)`: lê a flag, `damagePool`, `rollAndKeep`, posta `damage-card`.

### `acquisition-service.mjs`
- `acquire(actor, item, { craftsmanship, piece })`: Wealth 0 → recusa (override do Mestre); diálogo com TN e tempo;
  rola Wealth k Wealth; cartão com resultado e botão de Liquid Wealth; passando → `addEquipment` e Strain;
  falhando → incrementa `wealth.attempts`.
- `spendLiquid(message, points)`: soma ao total, consome `wealth.liquid`, reavalia sucesso.
- `endStrain(actor)` (Mestre): `wealth.strain = 0`.

## Ficha do personagem

- Aba `equipment` (`templates/actor/parts/equipment.hbs`): armadura (AP por localização, penalidade, Max Dex, com
  origem), armas (paradas, rolar ataque/dano, equipar), armaduras, gear, cibernéticos, drogas, artefatos e
  hearthstones, Wealth, vagas iniciais, vícios.
- Drop de `weapon|armor|gear` → `addEquipment`; ações `toggleEquipped`, `rollAttack`, `useDose`, `endDose`,
  `acquire`, `socket`, `unsocket`, `endStrain`, `removeEquipment`, `openEquipment`, `setQuantity`.
- Ataque desarmado padrão sempre na lista de armas.

## Fichas de item

- Campos do data-model; qualidades com tooltip (`WEAPON_QUALITIES`); botão **Adquirir** quando aberto a partir de um
  ator dono ou com um personagem controlado; compêndio bloqueado = só leitura.
