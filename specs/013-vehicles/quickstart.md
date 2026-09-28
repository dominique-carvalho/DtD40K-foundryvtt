# Quickstart — validação da feature 013-vehicles

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-013`; mundo relançado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `vehicle-components` com os componentes e armas em 8 pastas e `vehicles` com 16 atores.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir Vehicle Components | Pastas e contagens da spec; Wheeled, Standard Frame, AC/2 | US1-1 |
| 2 | Abrir Vehicles | 16 veículos; Basic Ground Vehicle com os stats | US1-2 |
| 3 | Montar o carro (orçamento 50) | 50/50 VP, 8/8 slots | US2-1 |
| 4 | Componente a mais | Aviso de slots | US2-2 |
| 5 | Duas trações | Troca com meia ação; DR e perícia mudam | US2-3 |
| 6 | Veículo do livro fora do orçamento | Aviso; valores do livro | US2-4 |
| 7 | SD com Momentum 0 e 1 | −6; 2 | US3-1 |
| 8 | Move e fim de turno sem mover | Momentum 3 e alcance; depois 0 | US3-2 |
| 9 | Punch It Boost (Acc 2) | Momentum +3; ação completa | US3-3 |
| 10 | Skirmish com artilheiro | Parada do artilheiro sem feats; dano com +10 sem Força | US3-4 |
| 11 | Evasive Maneuvers | Metade do teste soma à SD | US3-5 |
| 12 | Ramming | 7k3+4 nos dois; Control Test ou Out of Control | US3-6 |
| 13 | Control Test falhado (10) | Turn Over | US3-7 |
| 14 | Quinto ferimento na cena | Crítico de veículo | US3-8 |
| 15 | 0 HP | Destruído | US3-9 |
| 16 | Jury Rig com 2 raises | +3 HP temporários, uma vez | US3-10 |
| 17 | Perseguição de 4 rodadas | Pernas, obstáculo +2 raises, perícia repetida −2 checks, vencedor | US4-1/2 |
| 18 | Punch It com stunt 2 e Barrel Roll | Reação extra | US4-3 |
| 19 | Reparo | 1 dia; 1k1 × 5 | US4-4 |

## Registro de validação — 2026-09-27

Mundo `teste-dtd` (Foundry 13.351), link no worktree 013, packs recompilados com o Foundry fechado. Dados de teste
(atores "… 013", Scorpion Tank, Basic Ground Vehicle, Variable Man Machine, cena "Teste 013", combate e mensagens)
removidos no fim; Aldred Kain e Milton não foram tocados. Dados com resultado fixado por stub de `randomUniform`.

| # | Resultado observado |
|---|---|
| — | Todos os 13 packs carregam: vehicle-components 131, vehicles 16, equipment 170, feats 274 etc. |
| 1 | 8 pastas (Accessories 30, Accommodations 4, Armor 21, Control Systems 14, Drivetrains 9, Frames 9, Modifications 7, Weapons 37 = 27 armas + 10 munições/modos); Wheeled DR 5, 5 VP, Drive; Standard Frame 10/10, 15 VP; ficha da AC/2: 4k2+10 I, Pen 5, S/2, 500 m, Proven (3), Vhcl, 2 slots, 10 VP |
| 2 | 16 veículos; Basic Ground Vehicle importado: Size 8, Speed 4, Acc 1, Man 0, Wheeled, Standard Frame, Armor 3, HP 10, Res 10, SD −6, 50/50 VP, 8/8 slots, sem aviso |
| 3 | Veículo novo montado por drop (Wheeled, Standard Frame, Armor 3, 4 Cargo Space, 4 Passenger Space somando quantidade): 50/50 VP, 8/8 slots |
| 4 | Ejector Seat a mais: avisos "Too many slots: 9 of 8" e "Over budget: 60 of 50 VP" na notificação e na ficha |
| 5 | Variable Man Machine: Aerospace (DR 10, Pilot) → Walker (DR 4, Drive); com Mobile Decouplers gasta reação; no Scorpion Tank com segunda tração, meia ação (vehicleSwitchDrive) e recusa de meia ação repetida com override do Mestre |
| 6 | Variable Man Machine: 322/300 VP com aviso; valores do livro "300 (Holdings 2)", "18/18" |
| 7 | Carro: SD −6 com Momentum 0, 2 com Momentum 1 |
| 8 | Move no Scorpion Tank: Momentum 2 → 3, "up to 36 m, 180°", meia ação do piloto; fim do turno com Move mantém 3; turno seguinte sem Move: Momentum 0 e cartão |
| 9 | Punch It Boost com Acc 2: Momentum 1 → 4, ação completa; Overheating tirou 1 HP |
| 10 | Skirmish com o artilheiro (Ballistics 3): 3k3, sem +Level e sem −3k1 de pesada, nota "Vehicle weapon"; dano 2k2+10 = 26 sem Força; meia ação do artilheiro |
| 11 | Ataque de Autogun no tanque: cartão com Evasive (sem Dodge); piloto 4k1 = 8 → SD −10 + 4 = −6; reação do piloto gasta; segunda reação recusada (override) |
| 12 | Ramming Size 14, Momentum 3, Speed 4: dois cartões 7k3+4 (16) e cartão com Control Test e Out of Control; Aplicar no tanque: 16 → 6 depois de AP 10, 0 HP com Res 11 |
| 13 | Botão Control Test: 4k1−10 (Unstable) = −2 contra TN 15, falha; Out of Control 10: Turn Over, −3 HP, virado, Momentum 0 |
| 14 | 5 ferimentos no carro (Wheeled): crítico d10 2 Stalled; 5 no tanque (Tracked): sem crítico; Desfazer volta HP e ferimentos na cena; motor morto recusa Punch It e aceita Move |
| 15 | 150 no tanque: 0 HP, destruído, "Destroyed" no cartão do Aplicar e na ficha; Move recusado |
| 16 | Jury Rig com Crafts 4k1 = 31 (2 raises): +3 HP temporários, uma vez (a opção some); segundo Jury Rig religou o motor |
| — | Crítico 10 no carro: explosão no início da rodada seguinte, 10k5+30 X com Blast 10, destruído |
| 17 | Perseguição de 4 rodadas (carro pelo piloto × Alvo): obstáculo +10, perícia repetida −10, empate sem perna, placar 2–1 e vencedor no cartão; botão do Mestre nos controles de token |
| 18 | Punch It com stunt 2 e Barrel Roll: reações do piloto 1 → 2; efeito some no início do turno seguinte dele |
| 19 | Reparo Size 8, 6 HP perdidos, Crafts 3 com 2 raises (24 contra TN 14), Wealth 2: 1 dia, 5×1k1 = 10 → 10/10; HP temporários e Jury Rig liberados |
| — | Barrage: ação completa e dois ataques; Vehicle CQC Weapon com Manipulator Arms: 6k5+10 (+Força 6) |

Correções feitas na validação: campo `parent` do componente (reservado pelo DataModel) virou `forWeapon`; ícones
inexistentes; HP do frame ao adicioná-lo; tripulante de token não vinculado; Unstable só no Control Test; bônus
negativo do Evasive; Jury Rig não bloqueado pelo motor morto; "Destroyed" e crítico no cartão do Aplicar; token de
veículo novo vinculado por padrão; cabeçalho da tabela da perseguição.
