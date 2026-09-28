# Research — 015-weapon-crafting

Data: 2026-09-28. Fontes: código da `main` com a 014 (item `weapon`, `WEAPON_QUALITIES`, `RARITIES` com os 12 nomes
da tabela de disponibilidade e os mesmos TN, `rollAttack`/`rollDamage`, `acquire` e o diálogo de ataque da 007), o pack
de equipamento (grupos e proficiências) e o inventário do capítulo (scratchpad `ch-weapon-creation-inventory.json`:
5 templates, 8 + 10 tipos, 22 + 46 mods, 12 linhas de disponibilidade, 28 issues; linhas dos mods conferidas em três
extrações; texto próprio com 6-gramas = 0).

## R1. Dados do capítulo

- **Decision**: constantes em `module/rules/weapon-creation.mjs` (puro): `WEAPON_TEMPLATES` (5), `WEAPON_CREATION_TYPES
  { ranged: { O, L, P, M, B, S, E, F }, melee: { O, P, C, F, N, T, S, A, H, U } }` com mudanças de perfil, raridade,
  mod extra e grupo da 007; `WEAPON_MODS { ranged: [46], melee: [22] }` com chave, custo, compatibilidade (letras ou
  `any`), efeito numérico, qualidades, condição e nota em texto próprio; `WEAPON_AVAILABILITY` (−3 a +8 → chave de
  raridade da 007 e TN).
- **Rationale**: são peças do montador, não itens do jogo; como as tabelas das 013/014, ficam versionadas e testadas.
- **Alternatives**: compêndio de itens-template — rejeitado (ninguém arrasta um "mod").

## R2. A arma resultante

- **Decision**: item `weapon` da 007 com o perfil calculado e um campo aditivo `system.custom { build { family, template,
  type, damageType, mods[] }, status: "" | "pending" | "crafting" | "ready", crafting { materials, crafted, attempts },
  notes[] }`. `status` vazio = arma comum (todas as armas atuais); `pending` e `crafting` não equipam nem atacam.
- Grupo e proficiências: os do grupo de mesmo nome no pack de equipamento (mapa em `WEAPON_CREATION_TYPES`, conferido
  por teste): à distância Ordinary Basic/Ranged 1, Las Basic/Ranged 2, Plasma/Melta/Flamer/Syrneth Ranged 2,
  Bolter/Exotic Ranged 1; corpo a corpo Ordinary Basic/Melee 1, Parrying Melee 2, Cavalry Melee 1, Flail Melee 1,
  Fencing Melee 2, Two Handed/Syrneth/Chain Melee 3, Shield (grupo "Shields") Melee 1, Unarmed Basic/Melee 2.
- `weaponType`: do template (pistol, basic, heavy, melee); Throwing marca `thrown` com alcance 10 m.

## R3. Montagem (`buildWeapon`)

- **Decision**: ordem de aplicação: template → tipo → mods na ordem escolhida. Dano: tipo fixo do tipo, ou a escolha
  (entre as listadas; "escolha livre" = E/X/R/I), ou o do template; mod com tipo de dano (Incendiary corpo a corpo → E)
  vence. Somas: dados de dano (`rolled`/`kept`), Pen, qualidades (sem duplicar; Blast fica no maior; Proven fica no
  maior). ROF: mod que define o perfil substitui (o último vence, aviso `rofOverride`); Bullet Hose soma 2 à rajada
  (0 → 2) e dá Inaccurate. Alcance/pente: "double" ×2, "half" ⌊/2⌋ (mín. 1). Recarga: Half ↔ Full ↔ 2 Full ↔ 4 Full
  (dobro sobe, metade desce; Half fica Half).
- Limites: 2 mods (3 com tipo de mod extra); mod repetido ou incompatível é recusado (`incompatible`, `duplicate`,
  `tooMany`); raridade = Σ custos dos mods + modificador do tipo, presa em −3…+8.
- Condicionais e notas: lista de chaves dos mods com efeito no ataque (`redDotSight`, `motionPredict`, `breacher`,
  `unstable`, `nonlethal`, `orgoneArray`) e notas em texto próprio (Quick Draw, Combat Sheath, Precise, Preysense Sight,
  Felling, Melee Attach I/II, Arm Mounted).

## R4. Condicionais no ataque e no dano

- **Decision**: `attackPool` recebe `mods` (da `system.custom.build.mods` da arma): Red-Dot Sight +1k0 em tiro simples,
  Motion Predict +1k0 em rajada. `damagePool`: Breacher +1k0 a curta distância ou menos (`range` pointBlank/short),
  Nonlethal `explodeOn` 11. `rollDamage`: Unstable rola 1d10 depois do dano (1 → ⌊metade⌋, 10 → dobro); Orgone Array:
  se algum dado de dano explodiu, nota "rolar Psychic Phenomena no alvo". Volatile e as qualidades já existentes seguem
  a 007. As notas da arma aparecem no cartão de ataque.

## R5. Montador

- **Decision**: `WeaponBuilder` (ApplicationV2 + HandlebarsApplicationMixin, formulário com prévia ao vivo): família
  (distância/corpo a corpo), template, tipo, tipo de dano (quando há escolha), mods (checkbox com custo, desabilitados
  com o motivo), nome; prévia do perfil, raridade/TN, notas e avisos. Confirmar cria o item: Mestre → item de mundo
  (`status` vazio); jogador → item na ficha com `status: "pending"`. Reabrir: botão "Montador" na ficha de uma arma com
  `custom.build` (Mestre, ou dono se pendente) atualiza o item.
- Entradas: botão no cabeçalho do diretório de itens (Mestre) e na aba Equipamento da ficha (dono).

## R6. Aprovação e fabricação

- **Decision**: na ficha da arma pendente, o Mestre escolhe **Aprovar pronta** (`status` vazio) ou **Aprovar para
  fabricar** (`crafting`). Fabricar: botão **Materiais** — teste de Wealth da 007 (mesmas regras de `acquire`: Wealth
  efetivo, tentativas registradas, Liquid Wealth) contra o TN da raridade, sem ganhar item — e depois **Fabricar** —
  `rollSkill("crafts", { tn })`; as duas etapas com sucesso deixam `status` vazio (pronta). Falhas contam em
  `crafting.attempts` e podem ser repetidas.
- `acquisition-service` ganha `wealthTest(actor, { tn, key, label })` exportado, usado por `acquire` e pela fabricação.

## R7. Resolução das issues do inventário

| Issue | Decisão |
|---|---|
| 1 quatro vs cinco templates | Cinco, como listado |
| 2, 16, 22, 26 extração/grafia | Valores do modo tabela; nomes como impressos; `Twinlinked` → `twinLinked` |
| 3 proficiência | Grupo de mesmo nome da 007 (R2; decisão do usuário) |
| 4, 5 tipo de dano | Template quando não impresso; "escolha" entre E/X/R/I (decisão do usuário) |
| 6 Parrying | Como impresso (só R ou I); nota |
| 7 raridade do tipo | Soma com os mods (R3) |
| 8, 9 grafia de Defensive e Pen | Defensive; +4 Pen |
| 10 recarga | Escada Half/Full/2 Full/4 Full (R3) |
| 11, 19 bônus iguais | Somam; Blast no maior (decisão do usuário) |
| 12 Two Hands | `twoHands`; +1k1 |
| 13 Throwing | `thrown` + alcance 10 m |
| 14 Quick Draw | Nota |
| 15 Incendiary × tipo | O mod vence (decisão do usuário) |
| 17 Bullet Hose | Rajada 0 + 2 = 2 |
| 18 ROF | O último vence, aviso (decisão do usuário) |
| 20 Melee Attach | Nota citando Spear/Chainsword do compêndio |
| 21 condicionais | Automáticos no ataque (R4; decisão do usuário) |
| 23 custos diferentes | Cada tabela usa o seu |
| 24, 25, 27 tabela | −3…+8, presa nos extremos; chaves da 007 |
| 28 preço | Só raridade/TN, como no livro |
