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
