# Quickstart — validação da feature 008-combat

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-008`; Foundry reiniciado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.combat-tables").index.size === 22`.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Aplicar dano 19 Pen 2 no corpo (AP 7, Res 4) | −3 HP, conta no chat | US1-1 |
| 2 | Dano ≤ AP efetivo | Sem efeito | US1-2 |
| 3 | Tearing 13 efetivo, Res 4 | −4 HP | US1-3 |
| 4 | HP 2 recebendo 5 | HP 0, crítico 3, efeito da linha 3 e condições | US1-4 |
| 5 | Crítico acumulado 5 | Dead | US1-5 |
| 6 | Dano de magia | Aura no lugar do AP | US1-6 |
| 7 | Cobertura AP 8 | Absorve, perde 1 | US1-7 |
| 8 | Desarmado tirando HP | +1 fadiga | US1-8 |
| 9 | Jogador aplica em alvo alheio | Vai para o Mestre | US1-9 |
| 10 | Desfazer | Valores voltam | FR-004 |
| 11 | Iniciativa Dex 3, Cmp 2; empate | 1d10 + 5; desempate | US2-1 |
| 12 | Duas meias iguais; completa + meia | Recusas | US2-2/3 |
| 13 | Segunda reação | Recusa | US2-4 |
| 14 | Dodge total 18 no cartão | SD +9; acerta ou não | US2-5 |
| 15 | Full Defense | +10 SD, 3 reações até o próximo turno | US2-6 |
| 16 | All Out Attack | Sem reações | US2-7 |
| 17 | Called Shot | −2k0, localização escolhida | US2-8 |
| 18 | Duas armas + Two Weapon Fighting | 2 ataques −1k0, 1 reação | US2-9 |
| 19 | Surpresa | Pula a rodada 1; vantagem | US2-10 |
| 20 | Alvo Prone | Vantagem corpo a corpo; +1 raise à distância | US2-11 |
| 21 | Dazed; fadiga 1 e 2 | −1k0; −1k0 | US3-1/2 |
| 22 | Fadiga acima da Con | Unconscious, fadiga = Con | US3-3 |
| 23 | Stunned no turno | Aviso; Hero Point remove | US3-4 |
| 24 | On Fire e Blood Loss no fim do turno | −1 HP +1 fadiga; 1d10 | US3-5/6 |
| 25 | Dead com Hero Point | Queimar evita | US3-7 |
| 26 | Descanso | Cura conforme o estado | US3-8 |
| 27 | Helpless atacado | Acerto automático, dano duas vezes | US3-9 |
| 28 | Ataque social | Gastar Resolve ou ceder | US4-1 |
| 29 | Quinto Resolve na cena | Jaded | US4-2 |
| 30 | Refute 16 | +8 Mental Defense | US4-3 |
| 31 | Fear 2 falhado, 2 checks | Shock 1d10 + 2 aplicado | US4-4 |
| 32 | Medo fora de combate | −1k1, +1d5 Insanity | US4-5 |
| 33 | Insanity 9 → 10; 19 → 20; 100 | Trauma Test TN 12; derangement; aviso | US4-6/7/8 |

## Registro de validação

### 2026-09-26 — Foundry 13.351, mundo "teste-dtd" (título "Mist of Imlarin"), usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-008` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `combat-tables` com `index.size` = 22 em
2 pastas, 5 resultados por tabela de crítico com a automação nas flags; `DtdCombat` registrado, 27 status effects da
DtD, socket ativo. A tabela Energy foi conferida linha a linha contra `pdftotext -table` do PDF; as demais seguem o
inventário. Cena temporária "T008 Arena" com dois tokens vinculados; os passos foram executados pelos serviços que a
ficha e os cartões chamam, com os diálogos respondidos por script e os dados controlados; clicados no DOM: Aplicar
(cartão de dano), Gastar Resolve (cartão social), aba Combate (condição, ação Stand). Cena, combates, atores e
mensagens de teste apagados no fim.

| # | Resultado |
|---|---|
| 1 | ✅ 19 Pen 2 no corpo, AP 7, Res 4: 19 → 14 → −3 HP; conta no chat |
| 2 | ✅ Dano 7 contra AP 7: sem efeito |
| 3 | ✅ Tearing, 13 efetivo: −4 HP |
| 4 | ✅ HP 2, 27 Rending na cabeça: HP 0, crítico 3, Rending/Head 3 (Stunned 1d5 rodadas, +1d5 fadiga) |
| 5 | ✅ Crítico 4 + 2: total 6, Dead |
| 6 | ✅ Magia com Aura 2 (efeito): 10 − 2 = 8 → −2 HP |
| 7 | ✅ Cobertura AP 8 (corpo/pernas): 20 − 8 − 7 = 5 → −1 HP; cobertura 8 → 7 |
| 8 | ✅ Desarmado tirando 1 HP: +1 fadiga |
| 9 | ⚠️ Não exercitado (o mundo só tem o Gamemaster; o pedido ao Mestre passa pelo socket) |
| 10 | ✅ Desfazer: HP e fadiga voltam; mensagem marcada |
| — | ✅ Fluxo completo: ataque com alvo marcado → dano → botão Aplicar no chat → −6 HP |
| 11 | ✅ Iniciativa 1d10 + 5 (12 = d10 7); empate em 12: dado 8 do alvo passa o 7 do atacante |
| 12 | ✅ Segunda Standard Attack recusada ("meias diferentes"); terceira meia recusada; meia depois de Full Defense recusada |
| 13 | ✅ Dodge depois de All Out Attack: "sem reação" |
| 14 | ✅ Dodge 18 contra ataque 24 na SD 14: SD 23, "ainda acerta"; 1 reação gasta |
| 15 | ✅ Full Defense: SD +10, 3 reações; expira no início do próximo turno do alvo; estado do turno zera na rodada 2 |
| 16 | ✅ All Out Attack: +2k0, reações 0 |
| 17 | ✅ Called Shot na cabeça: localização head, −2k0 |
| 18 | ✅ Duas armas + Two Weapon Fighting: 2 ataques a −1k0, ação completa e 1 reação |
| 19 | ✅ Surprised: aviso de turno perdido na rodada 1; o status sai na rodada 2 |
| 20 | ✅ Alvo Prone: corpo a corpo com Combat Advantage (+5); à distância +1 raise |
| 21 | ✅ Dazed 4k2 → 3k2; fadiga 1 e 2: 3k2 (não acumula) |
| 22 | ✅ Fadiga 3 + 1 com Con 3: Unconscious, fadiga 3 |
| 23 | ✅ Stunned: ações recusadas; aviso no início do turno; Hero Point remove |
| 24 | ✅ Fim de turno: On Fire −1 HP +1 fadiga; Blood Loss 1d10 = 1 → Dead |
| 25 | ✅ Queimar Hero Point: Dead → Unconscious, máximo 2 → 1 |
| 26 | ✅ Descanso: leve +Con (dia de repouso); grave 3 dias sem repouso +0; crítico 1 semana com atenção médica −1 |
| 27 | ✅ Helpless: 3 contra TN 30 acerta; dano rolado duas vezes (12 dados) |
| 28 | ✅ Ataque social 36 contra MD 15: botão "Gastar Resolve" → Resolve 4 → 3, drenado 1 |
| 29 | ✅ Drenado 4: Jaded; Nova cena zera e tira Jaded |
| 30 | ⚠️ Refute somou metade do total (MD 15 + 4 = 19), mas foi rodado antes da correção, contra um ataque que já tinha falhado; Refute contra ataque bem-sucedido não exercitado no Foundry (coberto pelo teste unitário de `refuteBonus`) |
| 31 | ✅ Fear 2 falhado com 3 checks: Shock 1d10 + 3 = 13 (Catatonic → Unconscious) e +1d10 Insanity |
| 32 | ✅ Medo fora de combate: +1d5 Insanity com a nota de −1k1 |
| 33 | ✅ Insanity 9 → 10: Trauma Test TN 12 e Mental Traumas na falha; 19 → 20: TN 14 + derangement; 95 → 100: aviso de saída |

Correções feitas durante a validação: ataque social falhado aceitava "Gastar Resolve" pelo serviço (agora ignora);
"Spend Hero Point" com Stunned não encerrava a condição (agora pergunta e encerra).
