# Quickstart — validação da feature 014-ships

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-014`; packs compilados **com o Foundry
  fechado**; mundo relançado depois. **Nenhum outro mundo em uso.**

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: `ship-components` e `ships` carregam com as contagens da spec, e os demais packs também.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir Ship Components | Pastas e contagens; Steamboat, Lance, Photon com os números da spec | US1-1 |
| 2 | Abrir Ships | 6 naves; Military Cruiser com Hull 95, Covariant Mk III, 2 Array + Heavy Lance à frente, 2 Turret atrás | US1-2 |
| 3 | Montar a nave do exemplo (Holdings 1) | 60/50 BP com aviso; sem o Array, 50/50 | US2-1 |
| 4 | Console sem slot do tipo | Vai para o Universal; sem Universal, aviso | US2-2 |
| 5 | Casco customizado Destroyer | +5 Hull ×2 e arma à frente: Hull 65, 3 à frente, 6/11 CP; além do limite, aviso | US2-3 |
| 6 | Oficial ligado a personagem | Dados mantidos = perícia dele; NPC 4 | US2-5 |
| 7 | SD e iniciativa da Sultana | SD 25; iniciativa 1d10 + 10 | US3-1 |
| 8 | Duas Manoeuver no turno | Segunda recusada (override do Mestre) | US3-2 |
| 9 | Crew na rodada | 8 de 16 no ataque, sobram 8; volta a 16 na rodada seguinte | US3-3 |
| 10 | Fire Everything com Lance Las | 8k3+5 contra SD 25; dano no escudo Mk I e Disruption 4; regeneração 6 | US3-4 |
| 11 | Acerto sem escudo | Hull cai e rola a Crit Chart com o Crit da arma; efeito fica na nave | US3-5 |
| 12 | Hull 0 | Destruída | US3-6 |
| 13 | Evasive Manoeuvers | Metade do teste soma à SD contra o ataque | US3-7 |
| 14 | Ramming Speed! (Destroyer) | 3k3 nos dois; crítico +3 | FR-011 |
| 15 | Boarding Party | Rodadas com Crew comprometida; perdedor perde ⌊c/2⌋ + checks | US3-8 |
| 16 | Emergency Repair e Triage | Hull temporário 1d10 (+1d10 por 2 raises); Crew temporária | FR-011 |
| 17 | Viagem pelo Warp | Requisitos; passos 1–3 com modificadores; encontro rolado | US4-1/2 |
| 18 | Caças | Deploy 6: esquadrão com 6 caças, Crew −6; ataque 6k3; docking devolve | US4-3 |
| 19 | Bombardeio falho | Desvio 1k1 km + 1k0 por check e cartão 10k5+30 X | US4-4 |
| 20 | Hangar | Veículo da 013 embarcado com link; remover não apaga | US4-5 |
| 21 | Reparo de campo | Crafts TN 25: Hull e críticos limpos | US4-6 |
