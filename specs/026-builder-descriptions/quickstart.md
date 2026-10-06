# Quickstart — validação da feature 026-builder-descriptions

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-026`; **Foundry reiniciado por completo**.

```bash
npm test
```

## Roteiro manual (montando a Jane, p. 18)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Raça: clicar em Tiefling | Painel: Dex ou Con, Intimidation e Weaponry, Size 5, Bloody Minded com o efeito, parágrafo | US2-1 |
| 2 | Exaltação: Werewolf | Painel: Feral Heart, Rage, Fast Healing, parágrafo | US2-2 |
| 3 | Classe | Cada classe com linha (papel e requisitos); Monk mostra o bloqueio e os requisitos | US2-3 |
| 4 | Backgrounds | 11 linhas descritivas (pt-BR e en) | US3-1 |
| 5 | Alinhamento: Malal | Painel com o resumo e o panteão | US2-4 |
| 6 | Assets e Hindrances | Enemy (+100 XP), Impulsive, Appearance (−100) com linha; feat racial com a raça exigida | US1-1/2 |
| 7 | Exalted Asset: Black Spiral Dancers | Painel com efeito e custo | US1-3 |
| 8 | XP: escolher feats no seletor | Descrição aparece antes de comprar; lista de compras com a linha | US1-4 |
| 9 | Equipamento: Autopistol, Flak, Stimm | Linha com dano/Pen/alcance, AP, adictividade/efeito | US3-2 |
| 10 | Trocar o idioma para pt-BR | Rótulos e backgrounds em português; descrições do compêndio em inglês | R4 |

## Validação (2026-10-05, Foundry 13.351, mundo Mist of Imlarin, Gamemaster)

Montador aberto com um rascunho de teste só em memória (nada salvo; o rascunho do Gamemaster ficou intacto e nenhum
ator foi criado).

| # | Resultado |
|---|---|
| 1 | Tiefling: Dexterity or Constitution; Intimidation, Weaponry; Size 5; "Bloody Minded: Damage dice showing a 1 can be rerolled."; 1º parágrafo cortado com "…" |
| 2 | Werewolf: Feral Heart (up to the Level); Rage; Fast Healing; parágrafo |
| 3 | 103 classes com linha; Initiate/Mercenary "Level 1"; Monk com o bloqueio e "Level 3 · Requires: Brawl 3, Acrobatics 3, Athletics 3, Ki Strike" |
| 4 | Wealth e os 8 backgrounds simples com a linha; Artifact com a linha sob o título. Backing não tem campo no montador (já era assim na 023), então o texto dele aparece só se o campo for criado |
| 5 | Malal: Pantheon Ruinous Powers e o resumo |
| 6 | 22 Hindrances e 22 Assets com linha; Enemy/Impulsive "+100 XP", Appearance "−100 XP" |
| 7 | Black Spiral Dancers: −100 XP, Requires Werewolf, efeito |
| 8 | Seletor de feat: a linha muda sem re-renderizar ("Ki Strike: Your blows without a weapon…"); Outsider com "Requires: Tiefling"; compra com a linha |
| 9 | Autopistol "2k2 I · Pen 0 · 30 m · ROF S/6 — …"; Flak "AP 5 · medium · Max Dex 5 — …"; Stimm "Addictivity moderate — …" |
| 10 | pt-BR: rótulos (Característica, Perícias, Tamanho, Poder racial, Recurso, Nível, Exige) e backgrounds em português; textos do compêndio em inglês. Idioma devolvido a en |

Correções feitas durante a validação:
- A linha de Intolerance aparecia como ") and avoid them…": o separador de frases quebrava em "etc.)" e "e.g.". Agora a
  frase só termina em ponto + espaço + maiúscula, sem contar as abreviações; caso coberto por teste. Varredura de feats,
  Exalted Assets, classes e equipamento sem linhas quebradas.
- A linha do seletor de compra (passo XP) leva o nome do feat ("Absolution: …"), já que os seletores ficam empilhados.
