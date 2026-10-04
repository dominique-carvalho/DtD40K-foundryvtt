# Quickstart — validação da feature 022-npc-traits

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-022`, com os packs compilados; recarregar.
- Cena de teste com paredes; Aldred Kain e NPCs do compêndio (Dragon, Ghost, Mind Flayer, Obliterator, Aboleth,
  Ferocious Creature, Zoanoid Heavy, Elemental, Duodrone Modron) e a Space Pirate Crew; combate iniciado.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Colocar o Dragon | Ação padrão voar; fly 22; visão no escuro; elevação editável | US1-1/4 |
| 2 | NPC montado com Speed calculado + Quadruped; Ferocious Creature | Calculado dobra; impresso 16 não muda | US1-2 |
| 3 | Aboleth (Crawler) por região de terreno difícil | Custo de movimento base | US1-3 |
| 4 | Ataque com "escuridão" contra Aldred; Dragon atacando no escuro | +5 SD; Dragon sem penalidade | US1-5 |
| 5 | Dragon com elevação 10 fica Stunned | Cartão de queda para o Mestre; elevação 0 | US1-6 |
| 6 | Ataque entre tokens em elevações diferentes fora do alcance | Aviso de fora de alcance | US1-7 |
| 7 | Ghost fica incorpóreo e atravessa uma parede (arrastar e teclado) | Meia ação; passa; sem a condição, bloqueia | US2-1/2 |
| 8 | Espada comum e arma com Power Field contra o Ghost incorpóreo | Zero com aviso; dano normal | US2-3 |
| 9 | Obliterator: Full Auto Burst | Meia ação; apoiado | US2-4 |
| 10 | Mind Flayer: Mind Blast | Cone no mapa; alvos; Willpower TN 25; falha → Stunned 1 rodada | US3-1/2 |
| 11 | Dragon: Charge | Frightful Presence oferecida a quem está ao alcance | US3-4 |
| 12 | Elemental Fire: início do turno com Aldred adjacente | Constitution TN 15 ou 1 Fatigue | US3-5 |
| 13 | Duodrone acerta com o Gauss Blaster | Dano com +1 crítico | US3 |
| 14 | Space Pirate Crew no turno: atacar duas vezes; mover | Meia ação; segundo ataque recusado; Dodge/Parry no cartão; mover TR/2×TR | US4 |
| 15 | NPC com Swift Attack faz ataques múltiplos | Regra do feat vale | US5-1 |
| 16 | Zoanoid Heavy troca para Warform e volta | 1 Rage, ação completa; valores do livro; volta | US5-2 |
| 17 | Elemental escolhe Air | Ganha Phasing | US5-3 |
| 18 | Resource Stat: gastar e recuperar | Valor muda; chat registra | US5-4 |
| 19 | Aba Antagonista em Edição: adicionar Flyer a um NPC montado | Token passa a voar | US5-5 |

## Registro de validação — 2026-10-04

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 022 (packs compilados no worktree). Cena de
teste "Test 022" (grade de 1 m, parede em x = 10 m, região "Mud" com terreno difícil ×2), os 10 NPCs do compêndio
importados com o prefixo "T " e Aldred Kain como token não vinculado; combate com os 11 tokens.

| # | Resultado |
|---|---|
| 1 | Dragon: ação padrão `fly`, velocidades walk 11 / fly 22, visão `darkvision` com alcance infinito ao ligar a visão do token |
| 2 | Ferocious Creature (Speed impresso 16): 16 com e sem Quadruped. NPC montado com Speed calculado: 8 sem Quadruped, 16 com |
| 3 | 4 m pela região de terreno difícil: Aboleth (Crawler) custo 4; Mind Flayer custo 8 |
| 4 | Ataque desarmado de Aldred contra o Mind Flayer com "escuridão": TN 28 → 33, nota "darkness (+5 SD)". Dragon (Dark Sight) contra Aldred com "escuridão": TN 18, sem nota |
| 5 | Dragon a 10 m de elevação ficou Stunned: cartão sussurrado ao Mestre; "Fall" abriu o diálogo de categoria; queda curta, 1 ferimento direto, elevação 0 |
| 6 | Dragon a 10 m de elevação, adjacente a Aldred: aviso "Out of reach: 10.05 m away" no cartão de ataque |
| 7 | Ghost: a ação Phase custou meia ação e ligou Incorporeal; ação de movimento `phase`; caminho através da parede sem restrição (arrasto) e pelo teclado (x 9 → 11 m). Sem a condição: ação `fly` e a parede bloqueia |
| 8 | Ataque desarmado contra o Ghost incorpóreo: aviso, confirmação do Mestre recusada, HP 8 → 8. Power Sword (Power Field): 3 HP aplicados, sem aviso |
| 9 | Obliterator: Full Auto Burst registrado como meia ação; Heavy Bolter em full auto sem "unbraced" (depois da correção) |
| 10 | Mind Blast: cone de 18 m no mapa, 3 alvos no cartão; Resist de Aldred: Willpower 2 contra TN 25, falha → Stunned no ator do token, expira na rodada 2 |
| 11 | Dragon: Charge → cartão de Frightful Presence para Zoanoid Heavy e Aldred (ao alcance); Resist de Aldred abriu o Fear Test da 012 (TN 20), falha e resultado da tabela |
| 12 | Elemental sem forma: nada no início do turno. Em Fire: cartão de Constitution TN 15 para os 4 tokens ao alcance; Resist de Aldred: 11, falha → 1 Fatigue |
| 13 | Duodrone: dano do Gauss Blaster com `extraCritical` 1; aplicado no Zoanoid Heavy: 3 HP e +1 de dano crítico com HP sobrando (depois da correção) |
| 14 | Space Pirate Crew (TR 3): ataque à distância como meia ação; segundo ataque recusado ("already attacked this turn"); Dodge no cartão resolvido pelo alvo; Move (half) até 3 m; move full 6 m, run 18 m |
| 15 | Aboleth (Swift Attack na linha de feats): Multiple Attacks com Tentacles → 2 ataques, ação completa + 1 reação |
| 16 | Zoanoid Heavy: Warform por 1 Rage (10 → 9), ação completa, 7 rodadas; Str 5 → 6, Con 5 → 6, HP 20 → 24, Size 4 → 6, Speed 8 → 10, SD 17 → 13; voltou aos valores do livro |
| 17 | Elemental em Air: traço Phasing (flag `phasing`) |
| 18 | Rage do Zoanoid: 9 → 7 → 10, com mensagens no chat |
| 19 | Aba Antagonista em Edição de um NPC montado (token vinculado): traço Flyer pelo "+"; fly 16 e o token passou a `fly` na hora |

Correções feitas na validação:
- Criação de tokens falhava ("Cannot read properties of null (reading 'toObject')"): o `DtdTokenDocument` usava
  membros privados, e o core prepara o token em criação com outro receptor; agora são métodos comuns.
- Auto-Stabilized: o Obliterator ainda levava "unbraced −3k1"; o apoio passou a valer antes de montar a reserva.
- Gauss Weapon: o `extraCritical` só valia no dano direto da 018; agora vale em todo acerto que fere, mesmo com HP.
- Editor de abilities: o campo do nome ficava com 18 px; o seletor do tipo não toma mais a linha toda.

Observação: ao pular turnos, o Foundry dispara o início de turno dos combatentes pulados, então auras de início de
turno (Fire) também aparecem nesses casos (comportamento do core).
