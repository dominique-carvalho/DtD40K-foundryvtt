# Research: Ações de combate (017)

Inventário: `ch-combat-actions-inventory.json` no scratchpad da sessão (5 ações, Pinning, grapple, cobertura, 22
modificadores, 32 issues).

## R1 — Teste oposto (GR-RAISES)

- **Decision**: os dois lados rolam o pool do teste (característica ou perícia, com os modificadores de cada um); vence
  o maior total, empate para quem defende; raises = ⌊diferença / 5⌋. Rolados juntos por quem inicia, num cartão só.
  Bull Rush, Knock Down (Strength), Disarm e Feint (Weaponry) passam a usar o teste oposto quando há alvo marcado; sem
  alvo, continuam como hoje (TN 15).
- **Rationale**: decisão do usuário; o livro não dá TN.

## R2 — Zona de 45° (SF-RANGE, COVER-DIR)

- **Decision**: `MeasuredTemplateDocument` tipo `cone`, ângulo 45, na posição do token, direção para o primeiro alvo
  marcado (senão a rotação do token), comprimento = alcance da arma (máx. 4×, p. 318). O cartão da zona tem "Confirmar
  zona": o jogador pode mover/girar/esticar o template antes. Tokens dentro: centro do token no cone (`inCone`, puro, com
  a mesma geometria do Foundry: distância ≤ comprimento e ângulo ≤ 22,5° da direção).
- **Rationale**: nativo, ajustável; cobertura sem direção (premissa da spec).

## R3 — Suppressing Fire (SF-TIMING, SF-HIT, SF-DEFENSE, SF-FAB, SF-PENALTY, SF-TRICK)

- **Decision**: ação completa; exige ROF automático (pesada: Brace ativo). Ao confirmar a zona: cartões de Pinning para
  todos no cone exceto o atirador (aliados incluídos). No início do próximo turno do atirador: uma rolagem de Full Auto
  Burst (pool normal de ataque em automático, +2k1, feats de Full Auto Burst; sem −2k0 da tabela) contra os tokens
  **no cone naquele momento**, sem Em cobertura, com Static Defense **menor** que o total; se passarem do ROF, sorteio;
  sem dano extra por raise; cada acertado ganha Aplicar dano e Dodge no cartão. O template é apagado. A trick shot
  Crisis Zone continua como está.
- **Rationale**: texto da ação (decisão do usuário); SD estrito como no texto.

## R4 — Pinning (PIN-*)

- **Decision**: Willpower TN 20 com os modificadores gerais; Fearless e Headstrong imunes (pelo nome do feat); falha
  aplica Pinned. Pinned recusa ações completas (Mestre libera); reações e livres ok. No fim de cada turno do Pinned, um
  cartão de saída: TN 20 se o token estiver dentro de uma zona ativa (Suppressing Fire ou Overwatch), senão TN 10;
  entrar em grapple remove Pinned. Só quem estava no cone na confirmação testa. Mobbing Up: nota no cartão. Movimento
  obrigatório: lembrete no cartão.
- **Rationale**: pp. 443–444; padrões do inventário.

## R5 — Grapple (GR-*)

- **Decision**: a ação Grapple rola ataque de Brawl desarmado (ignora a arma equipada), com Dodge/Parry normais; o
  cartão de ataque ganha "Iniciar grapple" (depois da defesa), que aplica **Grappling** ao atacante e **Grappled** ao
  alvo, com `flags.dtd40k.grapple.partner` nos efeitos. Remove Pinned de ambos.
  - Controlador, ação completa "Controlar grapple": escolhe a opção, rola Strength oposta (Bear Hug +1 Strength);
    perdendo, nada acontece. Opções: Atacar com arma (arma de uma mão; acerto automático, cartão de dano com os raises
    do teste oposto); Derrubar (Prone; Squat Stability imune); Empurrar (2 m + 2 m/raise, máx. Speed m; Squat
    Stability imune; distância no cartão); Ready, Stand, Usar item (texto). Crushing Bear: dano desarmado a cada
    manutenção vencida (botão de dano).
  - Grappled, ação completa: Break Free (Strength oposta), Slip Free (Dexterity TN 20; 25 contra Bear Hug), Take
    Control (Strength oposta; vencendo, as condições trocam e ele escolhe uma opção). Escapar: condições saem e o turno
    fica com meia ação usada (sobra meia).
  - Outras ações recusadas para o grappled e para o controlador (exceto livres e reações), Mestre libera.
  - Condições saem se um dos dois ficar incapacitado ou no fim do combate.
- **Rationale**: p. 427; padrões do inventário (GR-FAIL continua; GR-STATUS duas condições; GR-PUSH Speed m).

## R6 — Overwatch (OW-*)

- **Decision**: ação completa; mesma exigência de arma; diálogo com o ataque (Full Auto Burst ou Suppressing Fire) e o
  gatilho (texto). Zona como em R2, com validade até o próximo turno do personagem. O cartão tem "Disparar": Suppressing
  Fire faz R3 (Pinning agora, rajada no início do próximo turno do atirador); Full Auto Burst rola o ataque em
  automático contra o alvo marcado, sem gastar ação. Dispara uma vez e acaba. Uma ação ou reação do personagem encerra
  (livres não). Sem −2k0.
- **Rationale**: p. 429.

## R7 — Delay (DL-*)

- **Decision**: meia ação; grava `Combatant.flags.dtd40k.delay = { round, turn }`. Fora do turno do personagem,
  `takeAction` de uma ação de meia (ou "as half") consome o delay em vez do estado do turno; pode repetir uma meia já
  usada. Expira no início do próximo turno dele. Iniciativa não muda. Mark of Moradin: nota (permite atrasar ações
  completas).
- **Rationale**: p. 426.

## R8 — Tactical Advance e cobertura (TA-*, COVER-DIR)

- **Decision**: Tactical Advance continua sem Provokes; nada remove Em cobertura automaticamente, então a condição se
  mantém (o cartão lembra). **Em cobertura** (`inCover`): ao ligar a condição, um diálogo pede o AP (4, 8, 12, 16, 32)
  e os locais cobertos (todos, pernas, corpo…), gravados em `Token.flags.dtd40k.cover` que o dano da 008 já usa;
  desligar limpa o flag.
- **Rationale**: p. 430, p. 433; decisão do usuário.

## R9 — Munição (SF-AMMO)

- **Decision**: fora; o cartão da rajada diz quantos tiros o livro gasta (ROF automático). Pendência registrada.

## Issues do inventário

| Issue | Tratamento |
|---|---|
| SF-PENALTY, OW-PENALTY | Texto vence (R3, R6) |
| SF-RANGE | R2 |
| SF-TIMING, SF-HIT, SF-DEFENSE, SF-FAB | R3 |
| SF-TRICK | Mantido (texto) |
| SF-AMMO | R9 |
| OW-TIMING, OW-ONCE, OW-WEAPON | R6 (antes do gatilho, uma vez, exige automático) |
| PIN-UNDERFIRE, PIN-ACTIONS, PIN-TIMING, PIN-MODS, PIN-MOVE, PIN-MELEE | R4 |
| GR-RAISES | R1 |
| GR-FAIL, GR-STATUS, GR-RECIPIENT, GR-ENTER, GR-PUSH, GR-REGAIN | R5 |
| DL-REPEAT, DL-ROUND, DL-INIT | R7 |
| TA-PROVOKE, TA-COVER, COVER-DIR | R8 |
| TABLE-SHIFT | Só o texto das entradas |
