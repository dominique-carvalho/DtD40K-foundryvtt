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
