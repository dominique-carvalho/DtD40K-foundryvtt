# Research: Perigos e XP de encontro (018)

Inventário: `ch-hazards-inventory.json` no scratchpad da sessão (queda, sufocamento, marcha, Fatigue, XP, 26
modificadores, issues HZ-01 a HZ-18).

## R1 — Queda (HZ-01, HZ-03 a HZ-06, HZ-14)

- **Decision**: o Mestre escolhe a categoria: curta (1 ferimento), longa (1d10), fatal (1d5 ferimentos + 1d5 de Critical
  Damage num local sorteado por `hitLocation(d10)`). Catfall baixa um degrau (fatal → longa → curta → nenhuma) e o cartão
  diz que cai de pé. Queda intencional não fatal: o dono rola Acrobatics TN 15 (característica padrão Dexterity) pelo
  cartão; sucesso reduz 1 + 1 por raise, mínimo 0; Catfall e Acrobatics se somam. Local dos ferimentos sem Critical
  extra (curta/longa): sorteado como no ataque. Grav Bomb e Ejector Seat fora.
- **Rationale**: p. 434, p. 181; decisão do usuário.

## R2 — Dano direto (HZ-02, HZ-04)

- **Decision**: `resolveDamage` ganha `direct` (ferimentos = total; sem cobertura, armadura, Aura nem Resilience) e
  `extraCritical` (somado ao Critical Damage além do que passa do HP; o efeito crítico usa a linha acumulada, como na
  008). O cartão de queda é um cartão de dano normal com `resolve: { direct: true, extraCritical }`, `type: "I"` e
  `tokenUuids` do token (o Aplicar da 017), reusando o desfazer.
- **Rationale**: p. 436 (quedas ferem direto); p. 434 (Critical Damage da queda fatal sem depender do HP).

## R3 — Sufocamento (HZ-07 a HZ-09, HZ-13, HZ-18)

- **Decision**: cartão com os personagens e o modo (poupar: minuto, fôlego Con minutos; esforço: rodada, fôlego 2 × Con
  rodadas); "Próximo intervalo" (Mestre): para cada personagem não imune, se ainda tem fôlego, rola Con TN 10 (falha +1
  Fatigue pelo `addFatigue`); quando os intervalos passam do fôlego, Unconscious; a cada intervalo depois, −1 HP; com 0
  HP, Dead. "Respirou" encerra. Trocar de modo = novo cartão. Stuff of Nightmares imune só a sufocamento.
- **Rationale**: p. 444; padrões do inventário.

## R4 — Marcha forçada (HZ-10)

- **Decision**: "Próxima hora": Con TN 10 + 5 × (hora − 1); falha +1 Fatigue; o cartão mostra a hora, o TN seguinte e a
  distância (2 × Speed km por hora de marcha, a partir da Speed de cada um). Nova marcha = novo cartão (TN recomeça).
- **Rationale**: p. 445.

## R5 — Fatigue (HZ-11, HZ-18)

- **Decision**: `fatigueCheck({ fatigue, max, con })`: acima de `max` (derivado: Con + Sand), Unconscious, volta a `max`,
  horas = 10 − Con (mínimo 1) só no aviso/cartão. `addFatigue` usa `system.fatigue.max` e não faz nada no Promethean.
- **Rationale**: pp. 17, 443, 207, 87; corrige a 008.

## R6 — Imunidades (HZ-12)

- **Decision**: `hazardImmunity({ exaltation, traits, equipped, race })` → `{ breath: bool, fatigue: bool }`. Não respira:
  exaltação Vampire ou Promethean; traits de NPC `undead`, `machine`, `stuffOfNightmares`; itens equipados Rebreather,
  Void Suit, Bionic Respiratory System (instalado). Imune a Fatigue: Promethean. Amphibious conta só debaixo d'água
  (opção "debaixo d'água" no diálogo). O diálogo mostra a detecção em cada token, e o Mestre muda.
- **Rationale**: decisão do usuário; pp. 87, 91–93, 335–356, 521–522.

## R7 — XP de encontro (HZ-15 a HZ-17)

- **Decision**: `ENCOUNTER_XP = { easy: 50, routine: 70, ordinary: 100, average: 130, challenging: 170, hard: 200,
  veryHard: 250 }`, `SESSION_XP = 500`. Diálogo (Mestre): tipo (encontro ou sessão), dificuldade, personagens (do combate
  atual marcados; os demais personagens com dono listados), bônus e motivo. Cada personagem recebe `awardXp` com
  "Encounter: Hard" (ou "Session"); o bônus é outra entrada com o motivo. Valor inteiro por personagem.
- **Rationale**: pp. 514–515; decisões do usuário.

## Botão

- **Decision**: ferramentas "Perigos" e "XP" nos controles de token (Mestre), como a perseguição da 013.
