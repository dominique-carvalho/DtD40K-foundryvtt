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
| 14 | Ramming Speed! (Destroyer) | 3k3 + Speed no alvo sem passar pelo escudo, metade no próprio; críticos +3 | FR-011 |
| 15 | Boarding Party | Rodadas com Crew comprometida; perdedor perde ⌊c/2⌋ + checks | US3-8 |
| 16 | Emergency Repair e Triage | Hull temporário 1d10 (+1d10 por 2 raises); Crew temporária | FR-011 |
| 17 | Viagem pelo Warp | Requisitos; passos 1–3 com modificadores; encontro rolado | US4-1/2 |
| 18 | Caças | Deploy 6: esquadrão com 6 caças, Crew −6; ataque 6k3; docking devolve | US4-3 |
| 19 | Bombardeio falho | Desvio 1k1 km + 1k0 por check e cartão 10k5+30 X | US4-4 |
| 20 | Hangar | Veículo da 013 embarcado com link; remover não apaga | US4-5 |
| 21 | Reparo de campo | Crafts TN 25: Hull e críticos limpos | US4-6 |

## Registro de validação — 2026-09-28

Mundo `teste-dtd` (Foundry 13.351), link no worktree 014, packs compilados com o Foundry fechado; o Foundry foi reiniciado
por completo para ler o `system.json` novo (relançar só o mundo não bastou). Dados de teste (atores "… 014", Military
Escort, Military Cruiser, Basic Ground Vehicle, esquadrão, cena "Teste 014", combate e 60 mensagens) removidos no fim;
Aldred Kain e Milton não foram tocados. Dados com resultado fixado por stub de `randomUniform`.

| # | Resultado observado |
|---|---|
| — | Os 15 packs carregam (ship-components 104, ships 6, demais com as contagens de antes); tipos `ship`, `squadron`, `shipComponent` registrados |
| 1 | 11 pastas (Hulls 14, Custom Hulls 4, Officers 12, consoles 7/6/7/8/6, Shields 20, Weapons 12, Torpedoes 8); Steamboat 10 BP, Crew 12, Hull 40, 2 universais, 1+1 armas; Lance 7k3 Dis 4 Acc 5 Crit 2 10 VU Flexible 10 BP; Photon 7k6 Dis 4 Acc 5 Crit 4 20 VU 10 BP |
| 2 | 6 naves de NPC; Military Cruiser importado: 185/185 BP, Hull 95, Covariant 170/5, SD 5, iniciativa +5, 2 Array + Heavy Lance à frente e 2 Turret atrás; o segundo Hardened Armor ocupa um slot universal |
| 3 | Nave do zero (Holdings 1) por drop: Steamboat, Standard Mk. I, Lance frente, Array trás e 5 primários = 60/50 BP com aviso; sem o Array, 50/50; token vinculado; Hull 40 e escudo 75 preenchidos |
| 4 | Targeting Computer e Fighter Bay (Tactical) vão para os 2 universais; o terceiro console avisa "More consoles than console slots." |
| 5 | Custom Destroyer: +5 Hull ×2 e arma à frente → Hull 65, 3 à frente, 6/11 CP; 7ª compra de Hull avisa o Upgrade Limit; divisão dos não universais pelo campo da ficha; nave com Hull cheio acompanha o máximo |
| 6 | Oficial 014 (Ballistics 3) no Tactical Officer por drop na linha: mantém 3 (NPC mantinha 4); drop fora da linha pede o posto |
| 7 | Military Escort: SD 25, iniciativa rolada 1d10 + 15 (Sensors 5 com Enhanced Sensors + Acc 10) |
| 8 | Segunda Move no turno recusada: "Nave 014 already made its Manoeuver this turn." (override do Mestre oferecido) |
| 9 | Crew 12 → 4 depois de 8 comprometidos → 12 na rodada seguinte; depois de recarregar a página a reserva da rodada se mantém |
| 10 | Fire Everything com Lance Las: 8k3+5 = 29 contra 25, acerto; 24 de dano: escudo 75 → 51, Disruption 4; regenerou 6 por turno (57, 63) |
| 11 | Escudo zerado por 70 (excesso perdido); 15 no casco (30/45) e Crit Chart 4+2 = Bridge Rattled (−1 Crew, Command bloqueado); Desfazer restaurou |
| 12 | 100 de dano: Hull temporário (8) primeiro, Hull 0, destruída, ações recusadas, selo na ficha |
| 13 | Evasive pelo cartão: 8k4+5 = 37 → SD 43, ataque evitado, dano recusado; 8 Crew comprometidos |
| 14 | Ramming Speed! da Nave 014 (Escort): 27 contra 25; 2k2+6 = 24 no alvo passando pelo escudo, 12 na própria; Crit Chart +3 nos dois |
| 15 | Abordagem com 6 Crew: 6k2 = 16 contra 10k4 = 32; atacantes perdem 6 (½ de 6 + 3 checks), repelidos; 6 Crew perdidos |
| 16 | Emergency Repair 32 contra TN 30 limpou Engines Crippled; segunda no mesmo turno recusada (override): 8 de Hull temporário; Triage: 1 Crew temporária |
| 17 | Sem Navigator: aviso; com Navigator NPC e Portal Relay, Moderate: curso +5, condução 31 contra 20 (2 raises) → tempo ÷2; encontro 7 The Vanishing, −2 Crew |
| 18 | Deploy 6 caças: esquadrão com token, SD 25, Crew −6; ataque 6k3 (Ballistics do Tactical Officer), dano 3k3; acerto derruba 1 caça (Crew perdida); docking devolve 5 e remove o token |
| 19 | Bombardeio: 18 contra 30 (2 checks) → desvio 3k1 = 6 km ao S; cartão 10k5+30 X com Aplicar da 008 |
| 20 | Basic Ground Vehicle arrastado para o hangar e listado; remover não apaga o veículo |
| 21 | Reparo de campo (Chief Engineer NPC 8k4 = 32 contra 25): 2k2 = 16 de Hull e críticos limpos; segundo reparo pede Resupply |
| — | Multiphasic Mk. I: 4 camadas de 20; 25 de dano derruba a primeira (excesso perdido) |
| — | Target Subsystem: recusado sem Active Augury contra alvo com escudo; com Augury, passa pelo escudo, 24 no casco, Turret desligada (TN 24) e crítico |
| — | Fim do combate: Crew comprometida e efeitos da rodada zerados |

Correções feitas na validação: Hull atual acompanha o máximo com a nave cheia; Crew da rodada recalculada na troca de
rodada e ao carregar o mundo; aviso de manobra usa a rodada do turno que terminou; naves de NPC mantêm 4 também em postos
ausentes (e a defesa da abordagem usa o Tactical sem Chief of Security); Engines Crippled bloqueia também o Move; Target
Subsystem passa pelo escudo.
