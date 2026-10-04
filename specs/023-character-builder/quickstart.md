# Quickstart — validação da feature 023-character-builder

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-023`, com os packs compilados; recarregar.
- Mundo Mist of Imlarin; um usuário jogador sem permissão de criar atores (simulado) e o Mestre.

```bash
npm test
```

## Roteiro manual (Jane, p. 18)

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Aba de atores → Novo personagem | Assistente no passo Conceito | US1-1 |
| 2 | Avançar com nome vazio | Bloqueado com motivo; Mestre vê Liberar | US1-2 |
| 3 | Raça Tiefling com a escolha do bônus; exaltação Werewolf | Escolhas no passo; resumo atualiza | US1-3 |
| 4 | Características Física 6/Mental 4/Social 2; tentar 7 na Física | Bloqueado; corrigir passa | US1-2 |
| 5 | Perícias Física 8/Social 6/Mental 4; especialidade num valor 3 | Bloqueada | US1 / FR-006 |
| 6 | Classe | Monk na lista; classes sem pré-requisito marcadas | US1-4 |
| 7 | Backgrounds: 7 pontos; um 8º | 8º custa 50 XP do saldo | US2-1 |
| 8 | Hindrances Enemy e Impulsive; tentar a 3ª | 800 XP; 3ª recusada | US2-2 |
| 9 | Assets Appearance; Exalted Asset Black Spiral Dancers | −200; só assets de Werewolf listados | US2-3 |
| 10 | Malal | Devotion 6 no resumo | US2-4 |
| 11 | XP: Brawl 3→4, Outsider; feat fora da lista | Saldo cai; fora da lista bloqueado (Mestre libera) | US3 |
| 12 | Equipamento: um item por vaga; tentar artefato na Rare | Artefato não listado; vaga vazia só avisa | US4 |
| 13 | Fechar e reabrir | Continuar no mesmo passo com as escolhas | US5-3 |
| 14 | Concluir | Ator criado com dono; ficha em criação com raça, exaltação, valores, traços, log de XP e itens | US1-5 |
| 15 | Jogador sem permissão conclui com o Mestre conectado | Ator criado pelo Mestre, dono = jogador, preenchido | US5-1 |
| 16 | Sem Mestre conectado | Aviso; rascunho mantido | US5-2 |
