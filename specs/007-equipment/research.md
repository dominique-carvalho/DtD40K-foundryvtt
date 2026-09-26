# Research — 007-equipment

Data: 2026-09-26. Fontes: código da `main` com a 006 (personagem, derivados, rolagem Roll & Keep, diálogo, feats e
concessões, modificadores, XP), código do Foundry **13.351** instalado (`client/documents/active-effect.mjs`,
`chat-message.mjs`) e o inventário do cap. XIII/XIV da 7.7a extraído do PDF (scratchpad
`ch-equipment-inventory.json` / `ch-equipment-rules.md`, com linhas e páginas).

## R1. Tipos de item

- **Decision**: três tipos novos, com campos comuns (`description`, `source`, `rarity`, `quantity`,
  `craftsmanship` poor|common|good|best, `equipped`, `material`, `startingSlot`):
  - `weapon`: `weaponType` (melee|thrown|pistol|basic|heavy), `group`, `proficiencies[]`, `damage {rolled, kept,
    type E|X|R|I|""}`, `pen`, `rof {single, auto}`, `range {value, strMultiplier}`, `clip`, `reload`,
    `qualities [{key, value}]`, `ammoGroup` (launchers: dano vem de uma granada/míssil do inventário), `names[]`
    (nomes alternativos).
  - `armor`: `armorType` (light|medium|heavy|extreme|power), `ap`, `maxDex` (nulo = sem limite), `piece`
    ("" = traje | head|body|arms|legs), `suitOnly` (Power), `primitive`.
  - `gear`: `category` (gear|cybernetic|drug|material|wonder|hearthstone), `addictivity`, `mechadendrite`,
    `socket` (Wonders e artefatos com encaixe), `socketedIn` (hearthstone → id do item hospedeiro), `effectText`.
- **Rationale**: arma e armadura têm perfis próprios que a ficha e as regras leem; o resto do capítulo varia só
  em categoria e efeitos (como `feat` com categorias na 005).
- **Alternatives considered**: um tipo por categoria (8 tipos, fichas quase iguais); um tipo só (perfis de arma
  e armadura como campos opcionais confusos).

## R2. Efeitos só com o item equipado (Foundry v13)

- **Fato verificado (13.351)**: `ActiveEffect#active` = `!disabled && !isSuppressed`; `isSuppressed` é um getter
  que o sistema pode sobrescrever numa classe de documento própria; `Actor#applyActiveEffects` pula efeitos
  inativos.
- **Decision**: `DtdActiveEffect` (`CONFIG.ActiveEffect.documentClass`) com `isSuppressed` verdadeiro quando o
  efeito vem de um item `weapon|armor|gear` que não está equipado; para drogas, quando a dose não está em efeito
  (`system.active`); para hearthstones, quando não está encaixada num item equipado; peças avulsas de armadura
  `suitOnly` sempre suprimidas. O Mestre continua podendo desligar (`disabled`).
- **Alternatives considered**: criar/apagar efeitos ao equipar (duplicação e corrida entre clientes); calcular
  tudo no `prepareDerivedData` (perde a lista de efeitos desligáveis do Mestre, constituição IV).

## R3. Armadura (puro)

- **Decision**: `armorProfile({ armors, bonuses, proficiencies, squat })` em `rules/equipment.mjs` →
  `{ locations: {head, body, gizzards, arms, legs}, sdPenalty, maxDex, sources }`.
  - AP por localização = maior AP das armaduras vestidas que cobrem a localização (traje cobre todas; `body` cobre
    Gizzards); qualidade Best +1 AP; material (Orichalcum +2) soma ao AP da peça. Bônus que o livro diz que
    somam (Bionic Heart +2 Gizzards, Hearthstone Bracers +2 geral) somam por cima; membros biônicos e Voidskin
    entram como AP de "armadura" da localização (maior vale).
  - Penalidade de Static Defense: pela armadura vestida de maior AP (p. 332): sem Armor Proficiency do tipo = AP;
    com o feat, Light/Medium 0, demais ⌊AP/2⌋; Power +2 sem dividir. Squat Armor Proficiency (p. 202): com o
    feat 0, sem ⌊AP/2⌋.
  - Max Dex: o menor Max Dex das armaduras vestidas; Poor −1, Best +1, Mithril +2, Orichalcum +1.
- **Proficiência**: feats "Armor Proficiency" do ator com `selection.subcategory` = tipo (005); concedidos contam.

## R4. Derivados

- **Decision**: `computeDerived` recebe `modifiers.armorPenalty` (subtrai da Static Defense) e
  `modifiers.maxDex` (limita a Dex da Speed); a Static Defense continua com a Dex cheia (p. 332). A ficha mostra
  `system.armor` (AP por localização e origem da penalidade). Power Armor: Active Effect no item (ADD Str +1 e
  `modifiers.resilience` +1), suprimido quando não vestida (R2).

## R5. Ataque e dano (puro)

- **Decision**: `rules/weapon.mjs`:
  - `attackSkill(weapon, mode)`: Brawling → brawl; melee → weaponry; thrown/pistol/basic/heavy → ballistics
    (p. 431: Ballistics para ataques à distância; arremesso é ataque à distância). Arma Melee que também é Thrown
    (Knife, Shortspear) escolhe o modo no diálogo.
  - `isProficient(weapon, featChoices)`: interseção de `weapon.proficiencies` com as subcategorias de Weapon
    Proficiency do ator.
  - `attackPool({ weapon, skill, level, proficient, options, focus })` → `{ rolled, kept, notes[] }`: skill k skill;
    +level k0 se proficiente; alcance, mira, full auto, brace, uma mão; qualidades Accurate, Inaccurate,
    Defensive, Twin Linked; material; Weapon Focus +2k0.
  - `damagePool({ weapon, str, options, extraHits, specialization })` → `{ rolled, kept, explodeOn, rerollBelow,
    pen, type, notes[] }`: XkY + Str k0 (melee/thrown não explosivo) + qualidade + material + full auto
    (+1k0/+2k0 Storm por acerto extra) + Weapon Specialization; Proven (n) e Volatile.
  - `isJammed({ keptFaces, level, reliable, unreliable })`; `hitLocation(d10)`; `fullAutoHits(raises, rof)`.
- **Unarmed**: arma virtual "Unarmed" (Brawl, 0k1 I, Pen 0) sempre disponível; armas com Brawling a substituem.

## R6. Dados

- **Decision**: `rollAndKeep` ganha `rerollBelow` (rerrola uma vez dados abaixo de n; a especialidade vira
  `rerollBelow: 2`) e já tem `explodeOn` (Volatile = 9). `noExplode` (vício Moderate) = `explodeOn: 11`.
- **Rationale**: Proven e especialidade são a mesma mecânica com limiares diferentes (p. 320, p. 418).

## R7. Diálogo e cartão

- **Decision**: `promptAttackOptions` (DialogV2, `templates/dialog/attack-dialog.hbs`): TN (padrão: Static
  Defense do alvo marcado, se houver, senão 15), modificadores, free raises, stunt, modo de rolagem (como a 001)
  + opções da arma (alcance, mira, modo de tiro, brace, uma mão). O cartão de ataque
  (`templates/chat/attack-card.hbs`) mostra o teste, raises, acertos de full auto, localização (d10 rolado junto),
  emperramento e um botão **Rolar dano**; o botão lê `flags.dtd40k.attack` (ator, item, opções, acertos) no hook
  `renderChatMessageHTML` (v13) e posta o cartão de dano (total, tipo, Pen, localização, notas).
- **Alternatives considered**: rolar ataque e dano juntos (a mesa decide o dano depois do acerto e das defesas).

## R8. Modificadores de rolagem

- **Decision**: novos alvos de efeito em `system.modifiers.rolls`: `all {rolled, kept}` (vício), `noExplode`,
  e por perícia `skills.<key> {rolled, kept, freeRaises}` (Medkit +1 free raise Medicae; Stone of Healing +1k1
  Medicae). `applyRollModifiers(base, mods, skillKey)` (puro) soma na parada de toda rolagem de perícia,
  característica e ataque.

## R9. Aquisição

- **Decision**: `system.wealth { value 0–5, liquid, strain, attempts: [{ key, count }] }`; `wealth.effective`
  derivado = max(0, value − strain). `rules/acquisition.mjs`:
  - `RARITIES` (12 degraus: chave, TN, tempo), `rarityStep(key, delta)`, `acquisitionTn({ rarity, piece,
    craftsmanship, attempts })`, `strainRoll({ tn, wealth, raises, d10 })` → `{ strained, roll, penalty }`
    (1–6: 0; 7–9: 1; 10: 3; 11+: 5), `startingSlots(items)` (1 Rare, 1 UnCom, 2 Com, 2 VCom; raridade ajustada
    pela qualidade: Good/Best sobem 1/2 degraus, Poor desce 1 — p. 317 em TN, convertido em degraus de 5).
  - Teste: Wealth k Wealth (premissa da spec) contra o TN; depois, diálogo para gastar Liquid Wealth.
- **Equipamento inicial**: `system.creation.active` (liga na criação do ator; o Mestre desliga); arrastar item
  com a criação ativa pergunta "item inicial?"; itens iniciais ficam com `startingSlot` e contam nas vagas.
- **Strain**: grava `wealth.strain` (a maior penalidade ativa); o Mestre zera pelo botão "encerrar penalidade".

## R10. Drogas e vício

- **Decision**: droga = `gear` `drug` com `quantity` (doses), `addictivity`, `active`. "Usar" → quantity − 1,
  `active` = true, teste de Willpower (rolagem de característica da 001 com TN da Addictivity; None pula) e, na
  falha, sobe o vício da droga. `system.addictions [{ name, level 0–3 }]`; o maior nível vale para as penalidades
  (Minor −1k0 em tudo, Moderate + sem explodir, Major −2k2 total), aplicadas via R8 no `prepareDerivedData`.
  Encerrar o efeito = botão na ficha (duração fica no texto).

## R11. Materiais e artefatos

- **Decision**: `MATERIALS` em config (5 chaves) com bônus por tipo de item: arma corpo a corpo, à distância,
  armadura (AP, Max Dex), biônico (texto). Automatizados: Orichalcum (melee +2k0 ataque e dano; ranged +1k1
  ataque e Reliable; armadura +2 AP e Max Dex +1), Mithril (melee +1k1 ataque; ranged sem penalidade de brace e
  uma mão; armadura Max Dex +2), Darksteel (melee Pen +8), Necrodermis (+1k0 dano; armadura como texto);
  Wraithbone e o resto como texto. Com material: qualidade conta como Best (os bônus do material substituem os
  de qualidade), `artifactRating(rarity, primitive)` (VCom 1 … VRare 5; primitiva um degrau abaixo; acima de VRare
  = 5 com aviso) e um encaixe de hearthstone.
- **Hearthstone**: `socketedIn` = id do hospedeiro (artefato ou Wonder com `socket`); um por hospedeiro;
  efeitos só com o hospedeiro equipado (R2). Automatizadas: Stone of Healing (+1k1 Medicae), The Monkey Stone
  (texto: reduz TN), demais texto. Gem of the Calm Heart concede Common Sense pelo sistema de concessões da 005
  (`grants` no item, ativo só encaixado).

## R12. Cibernéticos

- **Decision**: `equipped` = instalado. Efeitos: Machinator Array (Str +1, Dex −1, Resilience +1), Cortex
  Implants por qualidade (texto; Best +1 Int como efeito), Bionic Heart (+2 AP Gizzards, soma), membros biônicos
  (+2 AP na localização, maior vale), Voidskin Good (2 AP geral). Mechadendrites instaladas > Constitution →
  aviso com override do Mestre.

## R13. Compêndio

- **Decision**: pack `equipment` (Item), pastas Weapons (subpastas por grupo: 21), Armor, Gear, Cybernetics,
  Drugs, Artifacts (Materials, Wonders, Hearthstones). Gerado de `ch-equipment-inventory.json` por script do
  scratchpad; descrições em redação própria (agentes + checagem de 6-gramas). IDs pelo `assign-pack-ids.mjs`
  (layout `equipment`, prefixos `dtdE`/`dtdEFd`). Raridades das quatro tabelas desalinhadas no texto conferidas
  no PDF antes do build.

## R14. Ficha

- **Decision**: aba `equipment`: bloco de armadura (AP por localização, penalidade e Max Dex com origem), armas
  (parada de ataque e de dano, botões de rolar, equipar), armaduras, gear, cibernéticos, drogas (doses, usar,
  em efeito), artefatos e hearthstones (encaixe), Wealth (valor, Liquid, Strain, botão encerrar do Mestre),
  vagas do equipamento inicial e vícios. Botão **Adquirir** no item (ficha do item e linha do inventário) e o
  mesmo fluxo ao arrastar do compêndio quando o Mestre quiser ("adquirir" ou "só adicionar").
