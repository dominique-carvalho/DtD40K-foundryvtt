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

## Registro de validação

### 2026-09-26 — Foundry 13.351, mundo "teste dtd", usuário Gamemaster

Sistema carregado do worktree `DtD40K-foundryvtt-007` (junction `Data/systems/dtd40k`), packs gerados com
`npm run build:packs`. **Pack compilado conferido no Foundry antes dos passos**: `index.size` = 170, 33 pastas
(73 armas, 10 armaduras, 18 gear, 16 cibernéticos, 16 drogas, 5 materiais, 16 Wonders, 16 Hearthstones); Power
Armor com o efeito embutido. Raridades e perfis do inventário conferidos antes contra `pdftotext -table` do PDF
(72 linhas de arma idênticas; gear, cibernéticos, drogas e armaduras idênticos). Os passos 4–36 foram executados
pelos serviços que a ficha chama, com os diálogos respondidos por script e os dados controlados
(`CONFIG.Dice.randomUniform`) para acerto, raises, emperramento e Wealth Strain; na ficha aberta foram clicados
equipar, quantidade, rolar ataque, encaixe de hearthstone e o botão "Rolar dano" do chat; o diálogo de ataque, o
de aquisição e a ficha de item editável foram abertos sem stub. Atores e mensagens de teste apagados no fim.

| # | Resultado |
|---|---|
| 1 | ✅ 170 itens em 33 pastas, contagens da spec |
| 2 | ✅ Autopistol (Pistol, Ordinary, Basic ou Ranged 1, 2k2 I, Pen 0, S/6, 30 m, 12, Full, Common); Carapace (Heavy, AP 7, Max Dex 4, Uncommon, peça avulsa Common); tooltips de Accurate e Proven (3) no Hunting Rifle |
| 3 | ⚠️ Só conferido no arquivo `pt-BR.json`; a interface foi vista em inglês |
| 4 | ✅ Autopistol, Carapace e Medkit no inventário, qualidade Common, quantidade 1 |
| 5 | ✅ Carapace sem proficiência: AP 7 em tudo, Static Defense 14 → 7; com Armor Proficiency (Heavy): 11 (−3) |
| 6 | ✅ Flak com Medium: sem penalidade |
| 7 | ✅ Dex 5, Str 3, Carapace: Speed 7 (Dex 4), Static Defense com Dex 5; sem armadura, Speed 8 |
| 8 | ✅ Power Armor com Power: AP 12, Str 1 → 2, Resilience 4 → 5, penalidade 8; tirada, volta; peça avulsa de Power Armor: AP 0 e sem bônus |
| 9 | ✅ Capacete de Carapace + Mesh: Head 7, demais 4 |
| 10 | ✅ Bionic Heart instalado: Gizzards 4 → 6 e concede Hardy (origem = o implante); desinstalado, os dois saem |
| 11 | ✅ Carapace Best: AP 8, Max Dex 5 |
| 12 | ✅ Level 2, Ballistics 3: Autopistol 3k3 sem o feat, 5k3 com Weapon Proficiency (Ranged 1) |
| 13 | ✅ Lasgun com Weapon Proficiency (Basic): 5k3 |
| 14 | ✅ Hand Weapon com Str 3: dano 6k2; Autopistol 2k2 |
| 15 | ✅ Brass Knuckles: Brawl, 0k2 + Str (3k2); desarmado 0k1 + Str (3k1) |
| 16 | ✅ SAW sem apoio: 2k2 (−3k1) e sem full auto; apoiado em full auto: 7k4; o diálogo só oferece full auto (ROF -/10) |
| 17 | ✅ Hunting Rifle à queima-roupa com mira completa: 10k5 (+2k1, +2k1, Accurate +1k0) |
| 18 | ✅ Full auto com 4 raises: 5 acertos no cartão; dano 6k2 (+4k0); botão "Rolar dano" do chat posta o cartão |
| 19 | ✅ Level 2 com três 1s mantidos: aviso de emperramento |
| 20 | ✅ Proven (3) do Hunting Rifle rerrola no dano (nota no cartão) |
| 21 | ✅ Weapon Focus (Hunting Rifle): 5k3 → 7k3 |
| 22 | ⚠️ Poor/Good de arma não exercitados no Foundry (cobertos por teste unitário) |
| 23 | ✅ Wealth 3, Lasgun: 3k3 contra TN 10, item no inventário, tempo "One hour" |
| 24 | ✅ Bolt Pistol falha: TN 20 → 25 na segunda tentativa |
| 25 | ✅ Carapace Best: TN 25 |
| 26 | ✅ Boltgun TN 25 com Wealth 3: Strain 8 + 2 = 10 → Wealth −3 (efetivo 0); Mestre encerra → 3 |
| 27 | ✅ Laspistol falha por 1 (9 contra 10); 1 ponto de Liquid Wealth → passa, item entra, sobra 1 |
| 28 | ✅ Wealth 0: recusa; Mestre dá o item |
| 29 | ✅ Vagas iniciais: Bolt Pistol (Rare), Carapace (Uncommon), 2 Laspistols (Common); Meltagun, terceiro Common e Lasgun Good (= Uncommon) recusados |
| 30 | ✅ Slaught: 10 → 9 doses, Dex 1 → 2, teste de Willpower TN 15 |
| 31 | ✅ Falha: vício Minor (−1k0 em todas as rolagens); segunda falha: Moderate (dados não explodem) |
| 32 | ✅ Machinator Array: Str 2 → 3, Dex 2 → 1, Resilience 4 → 5 |
| 33 | ✅ Con 2: terceira mechadendrite recusada com aviso |
| 34 | ✅ Hand Weapon de Orichalcum: ataque 3k3 → 5k3, dano 6k2 → 8k2, Artifact 2 |
| 35 | ✅ Stone of Healing encaixada: Medicae +1k1; hospedeiro guardado: sem efeito |
| 36 | ✅ Segunda hearthstone na mesma arma: recusa; Gem of the Calm Heart num Hearthstone Amulet vestido concede Common Sense, retirada tira |
| 37 | ⚠️ Não exercitado (o mundo só tem o usuário Gamemaster) |

Correções feitas durante a validação: armas só de full auto (SAW, Heavy Bolter) ofereciam tiro único no diálogo;
a ficha da armadura passa a mostrar a raridade da peça avulsa.
