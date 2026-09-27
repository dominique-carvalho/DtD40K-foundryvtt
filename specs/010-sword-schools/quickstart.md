# Quickstart — validação da feature 010-sword-schools

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-010`; Foundry reiniciado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `game.packs.get("dtd40k.martial-schools").index.size === 15` em 2 pastas.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Martial Schools | 15 escolas, 2 pastas, 9 entradas cada | US1-1 |
| 2 | Abrir Desert Wind e Clay Pigeon | Entradas com nível, custo e efeito | US1-2 |
| 3 | Aba Martial: universais | 5 vantagens, 7 restrições | US1-3 |
| 4 | Comprar Iron Heart 0 → 1 → 2 (Level 2) | 200, 100; 2 → 3 recusado; Martial Adept 2 | US2-1/2 |
| 5 | Escola fora da lista | Recusa; Mestre inclui | US2-3 |
| 6 | Clay Pigeon 3, Point Blank 2 | Gunslinger 3, Martial Adept continua | US2-4 |
| 7 | Devoted Spirit 4 | +4 HP (Ox Body) desligável; Zephyr Dance só texto em Desert Wind 4 | US2-5 |
| 8 | Desfazer uma compra | Valor, XP e passiva voltam | US2-6 |
| 9 | Montar o exemplo da p. 261 | Orçamento ok; 300 XP | US3-1 |
| 10 | Sem restrições suficientes / acima de 2 × nível | Recusas com o que falta | US3-2/3 |
| 11 | Trick Shot | Só universais + Gun Kata; Gunslinger Level | US3-5 |
| 12 | Editar +1 ponto; desfazer | 50 XP; desfazer restaura | US3-6 |
| 13 | Usar com arma errada | Recusa; override | US4-1 |
| 14 | First Accuracy ×2 + Penetration ×1 | +2k0 ataque, +2 Pen | US4-2 |
| 15 | Blistering Flourish com 2 raises; Aplicar efeitos | Dazed 2 rodadas | US4-3 |
| 16 | Skill (Athletics) falhando | Ataque falha, cartão diz | US4-4 |
| 17 | Difficult Strike e Last Resort | Recusas; nova cena libera | US4-5 |
| 18 | Base Called Shot | Localização, −2k0, ação completa | US4-6 |
| 19 | Burning Blade; Opening the Path | Incendiary no dano; −10 SD no atacante até o próximo turno | US4-7/8 |
| 20 | Trick Shot com Blast | Aviso do alvo mais próximo | US4-9 |
| 21 | Base Aim | Ação gasta; ataque preparado usa as vantagens | US4-10 |

## Registro de validação

### 2026-09-27 — Foundry 13.351, mundo "teste-dtd" (título "Mist of Imlarin"), usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-010` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `martial-schools` com `index.size` = 15
em 2 pastas (9 `sword`, 6 `gunKata`), 9 entradas em cada; tipo `martialSchool` registrado. Atores temporários
"T010 Adept" (Level 2: Brother concluída, Myrmidon atual) e "T010 Alvo", cena "T010 Cena" com tokens vinculados e um
combate. Os passos foram executados pelos serviços que a ficha e os cartões chamam, com as confirmações respondidas por
script e os dados controlados; pela interface: montador real (preencher, orçamento ao vivo, Salvar), botão "Aplicar
efeitos" do cartão de ataque, botões "Nova cena", "Ataque preparado" e de ligar/desligar a passiva na aba Marcial.
Escolas fora da lista da Myrmidon e acima do Level entraram pelo override do Mestre. Cena, combate, atores e mensagens
de teste apagados no fim.

| # | Resultado |
|---|---|
| 1 | ✅ 15 escolas em 2 pastas, 9 entradas cada |
| 2 | ✅ Desert Wind e Clay Pigeon com nível, tipo, custo (`(-1)`, `2*`, `—`) e efeito; compêndio bloqueado |
| 3 | ✅ Aba Marcial: 5 vantagens e 7 restrições universais |
| 4 | ✅ Iron Heart 0 → 1 por 200, 1 → 2 por 100; 2 → 3 recusado ("não pode passar do Level"); Martial Adept 2 |
| 5 | ✅ Tiger Claw recusada (fora da lista); override do Mestre inclui sem custo |
| 6 | ✅ Clay Pigeon 3 e Point Blank 2: Gunslinger 3, Martial Adept 2 |
| 7 | ✅ Devoted Spirit 4: Ox Body como efeito, HP máximo 4 → 8; o Mestre desliga e religa (8 → 4 → 8); Zephyr Dance (Desert Wind 4) só texto |
| 8 | ✅ Desfazer Devoted Spirit 4: valor 3 e passiva removida (HP 4); desfazer Iron Heart 2 devolve 100 XP |
| 9 | ✅ Exemplo da p. 261 no montador (Martial Adept 3): orçamento ao vivo 6/0 → falta 3, 6/2 → falta 1, 6/3 ok; salvo por 300 XP com entrada `specialAttack` |
| 10 | ✅ 5 pontos com 1 de restrição: "faltam 1"; 7 pontos: "1 ponto a mais" |
| 11 | ✅ Trick Shot: só universais, Clay Pigeon e Point Blank; ações Standard Attack, Called Shot, Full Auto Burst; nível 3 (Gunslinger) |
| 12 | ✅ Trick Shot de 3 pontos por 150; edição para 4 (+ Ocelot's Roar) por 50; desfazer volta à definição anterior e devolve 50 |
| 13 | ✅ Weapon (Syrneth) com Hand Weapon: recusa "arma errada" (override oferecido ao Mestre) |
| 14 | ✅ First Accuracy ×2 + Penetration ×1: ataque 3k3 → 5k3; Pen 0 → 2 no dano |
| 15 | ✅ Blistering Flourish com 2 raises (24 contra TN 10): botão Aplicar efeitos → alvo Dazed 2 rodadas |
| 16 | ✅ Skill (Athletics) 5k3 = 3 contra SD 8 do alvo: falha, cartão "o ataque falha", sem rolar o ataque |
| 17 | ✅ Difficult Strike na rodada 2 recusado; Last Resort recusado na mesma cena; "Nova cena" libera |
| 18 | ✅ Trick Shot com base Called Shot (Laspistol): localização Head escolhida, −2k0, ação completa |
| 19 | ✅ Burning Blade: dano com Incendiary; Opening the Path: SD do atacante 14 → 4, volta no início do próximo turno; meia ação gasta |
| 20 | ✅ Trick Shot com Heavy Webber (Blast): aviso "só o alvo mais próximo" |
| 21 | ✅ Base Aim: meia ação `aim` e ataque pronto; "Ataque preparado" pela aba: Standard Attack 6k3 (3 + 2 das vantagens + 1 da mira), pronto zerado |
| — | ✅ Aplicar dano com `resolve`: armadura 5 ignorada e Resilience ÷ 2 → 10 / 2 = 5 ferimentos (4 HP + 1 crítico); Felling Giants (Res 4 − 2) |

Correção da validação: o cartão de dano aplicado mostrava a Resilience da ficha, não a usada; passa a mostrar a
Resilience ajustada (`damage-service.applyTo`).
