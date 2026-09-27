# Contrato — Foundry (009)

## Registro
- `documentTypes.Item.spell`, `CONFIG.Item.dataModels.spell`, `SpellSheet`; pack `spells` (Item).
- Tabelas Phenomena e Perils no pack `combat-tables` (pasta Warp).
- Hook `renderChatMessageHTML`: botões do cartão de magia (Aplicar dano via cartão de dano; Resistir; Phenomena).

## `magic-service`
- `learnSpell(actor, spell)`: confere vaga (`canLearn`), override do Mestre; grava `learnedAt`.
- `castSpell(actor, spellId, { comboId })`: keywords, turno (008), diálogo (força, push, TN, modificadores, Implement),
  teste, cartão, dano, resistência, efeitos, Phenomena/Perils, sustentada.
- `resistSpell(message)`: o dono do alvo rola Arcana + característica contra o total do conjurador.
- `rollPhenomena(actor, mod)`: tabela 1d100 + mod; 75+ → Perils.
- `learnCombo(actor, spellIds)`: XP 50 × soma dos níveis (histórico 006), fora da criação.
- `endSustained(actor, id)`; `sustainTurn(combat, combatant)` chamado no `_onStartTurn`.

## XP (006)
- Modo Evolução: botões `+custo` nas escolas; `advance(actor, "school", key)`.

## Ficha
- Aba `magic`: escolas (valor, vagas), magias aprendidas por escola (conjurar), sustentadas (encerrar), combos
  (aprender, conjurar), estado (caster level, Sanctioned, Implement).
- Drop de `spell` → `learnSpell`.
