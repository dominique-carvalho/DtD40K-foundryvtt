# Quickstart — validação da feature 007-equipment

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-007`; Foundry reiniciado após mudar o
  `system.json`. **Nenhum outro mundo em uso.**

## Testes e build

```bash
npm test
```

```bash
npm run build:packs
```

Antes de registrar dados: no mundo, `game.packs.get("dtd40k.equipment").index.size === 170`.

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir o compêndio Equipment | 73 armas, 10 armaduras, 18 gears, 16 cibernéticos, 16 drogas, 37 artefatos, em pastas | US1-1 |
| 2 | Abrir Autopistol, Carapace; tooltip de qualidade | Dados da spec | US1-2/3/4 |
| 3 | pt-BR | Rótulos traduzidos | US1-5 |
| 4 | Arrastar Autopistol, Carapace, Medkit | Na aba Equipamento, agrupados | US2-1 |
| 5 | Vestir Carapace sem/com Armor Proficiency (Heavy) | AP 7; SD −7 / −3 | US2-2/3 |
| 6 | Flak com Medium | Sem penalidade | US2-4 |
| 7 | Dex 5 + Carapace | Speed com Dex 4; SD com Dex 5 | US2-5 |
| 8 | Power Armor com Power | AP 12, Str +1, Resilience +1, SD −8 | US2-6 |
| 9 | Capacete de Carapace + Mesh | Head 7, demais 4 | US2-7 |
| 10 | Bionic Heart instalado | Gizzards +2 | US2-8 |
| 11 | Carapace Best | AP 8, Max Dex 5 | US2-9 |
| 12 | Autopistol com/sem Weapon Proficiency (Ranged 1), Level 2, Ballistics 3 | 5k3 / 3k3 | US3-1/2 |
| 13 | Lasgun com Weapon Proficiency (Basic) | Proficiente | US3-3 |
| 14 | Dano de Sword com Str 3; Autopistol | +3 dados rolados; 2k2 | US3-4 |
| 15 | Brass Knuckles; desarmado | Brawl, 0k2 + Str; 0k1 + Str | US3-5/6 |
| 16 | Heavy sem brace; Basic uma mão | −3k1; −2k0 | US3-7 |
| 17 | Point blank, curto, mira | +2k1, +1k0, +1k0/+2k1 | US3-8 |
| 18 | Full auto com raises | Acertos extras no cartão e no dano | US3-9 |
| 19 | Emperramento (Level 1, dois 1s mantidos) | Aviso | US3-10 |
| 20 | Qualidades numéricas | Defensive −2k0; Proven rerrola; Volatile explode em 9 | US3-11 |
| 21 | Weapon Focus/Specialization | +2k0 | US3-12 |
| 22 | Qualidade Poor/Good da arma | −1k0/+1k0; Unreliable/Reliable | US3-13 |
| 23 | Wealth 3 adquire Common | 3k3 vs 10; item no inventário | US4-1 |
| 24 | Nova tentativa | TN +5 | US4-2 |
| 25 | UnCom Best | TN 25 | US4-3 |
| 26 | TN 25 com Wealth 3 | Wealth Strain rolado e aplicado; Mestre encerra | US4-4/5 |
| 27 | Liquid Wealth após falha por 1 | Passa, consome 1 | US4-6 |
| 28 | Wealth 0 | Recusa; Mestre dá | US4-7 |
| 29 | Equipamento inicial | Vagas 1/1/2/2; recusa excedente | US4-8 |
| 30 | Slaught: usar dose | 9 doses, Dex +1, Willpower TN 15 | US5-1 |
| 31 | Falha no vício | Minor −1k0; Moderate sem explodir | US5-2 |
| 32 | Machinator Array | Str +1, Dex −1, Resilience +1 | US5-3 |
| 33 | 3ª mechadendrite com Con 2 | Aviso | US5-4 |
| 34 | Sword de Orichalcum | +2k0 ataque e dano; Artifact 2 | US5-5 |
| 35 | Stone of Healing encaixada | +1k1 Medicae; fora, sem efeito | US5-6 |
| 36 | Segunda hearthstone | Recusa | US5-7 |
| 37 | Observador | Só leitura | Edge |
