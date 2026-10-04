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

## Registro de validação — 2026-10-04

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 023 (packs compilados no worktree). O mundo
já estava aberto quando o link foi trocado, então o servidor ainda usava o `system.json` da 022: o `builder.css` foi
carregado pela mesma linha `@import ... layer(system)` que o manifesto da 023 gera (a 023 não muda packs). Mestre e
Player2 (jogador, sem permissão de criar atores) em abas separadas.

| # | Resultado |
|---|---|
| 1 | Botão "New character" na aba de atores; assistente no passo Conceito, com os 14 passos, o resumo e o rodapé |
| 2 | Avançar sem nome: não avançou, "Your character needs a name."; botão "Release (GM)" para o Mestre |
| 3 | Tiefling: escolha de bônus no passo (Dexterity ou Constitution); Werewolf; o resumo mostrou raça, exaltação e Dex 2 |
| 4 | Física 6 / Mental 4 / Social 2 com os pontos da Jane: valores finais Str 3, Dex 5, Con 2, Cha 2, Fel 2, Cmp 1, Int 3, Wis 2, Wil 2. Con +1 (7 na Física): "PHYSICAL 7 / 6", bloqueado com motivo; corrigido, passou |
| 5 | Perícias Física 8 / Social 6 / Mental 4; Brawl 4: bloqueado pelo teto. Especialidades: só Dexterity (5) oferecida; Brawl 3 não aparece |
| 6 | 103 classes; 7 de Level 1 liberadas no topo (Brother, Initiate, Mercenary, Negotiator, Peasant, Ratcatcher, Scholar), as outras com o motivo. A Monk é Level 3 na 7.7a (p. 151, Ki Strike e perícias 3), então aparece bloqueada; o exemplo da p. 18 não segue a entrada da classe. Monk escolhida e liberada pelo Mestre |
| 7 | Allies 3, Contacts 2, Wealth 2: 7 de 7 grátis; Wealth 3: 50 XP, saldo 550 |
| 8 | Enemy e Impulsive: 800 XP; terceira Hindrance: "At most two Hindrances." |
| 9 | Appearance −100; Exalted Asset: só os 5 da Werewolf (Black Spiral Dancers, Get of Fenris, Iron Masters, Red Talons, Silent Striders); Black Spiral Dancers: saldo 600 |
| 10 | Malal (três panteões listados); resumo com "Devotion 6" (depois da correção) |
| 11 | Brawl 3 → 4 (50) e Outsider (100): saldo 450. Lightning Attack: "Not on the list of any class the character has.", sem descontar. Os quatro feats da Jane também estão fora da lista da Monk na 7.7a; liberados pelo Mestre, o saldo foi a 50, como no livro (depois da correção) |
| 12 | Vagas 1 Rare (32 itens), 1 Uncommon (37), 2 Common (28), 2 Very Common (8); dos 69 Rare do compêndio ficaram de fora os 16 hearthstones, 16 wonders e 5 materiais. Vaga vazia: "Some equipment slots are empty.", sem bloquear. Biofoam não existe no compêndio: Bionic Heart como Rare |
| 13 | Fechar e reabrir (várias vezes, com recarga): "You have a draft: Jane, at the … step"; Continuar voltou ao passo com as escolhas |
| 14 | Jane criada com dono, ficha aberta em criação: raça, exaltação, Monk, Malal (Devotion 6), valores, Quick hands, Allies 3, Contacts 2, Wealth 2, 9 feats, 6 itens com vaga inicial, log de XP com 8 compras, 50 XP restantes; rascunho apagado (depois das correções). Os feats com sub-categoria (Wholeness of Body, Weapon Proficiency) pediram a escolha na conclusão |
| 15 | Player2 montou a Pia sem o botão de liberar; concluiu com o Mestre conectado: ator criado pelo Mestre, dono = Player2, preenchido, rascunho apagado |
| 16 | Sem Mestre conectado: "No GM is connected to create the character; your draft is kept.", nenhum ator criado, rascunho mantido |

Correções feitas na validação:
- Texto perdido ao trocar de campo: a mudança do campo anterior re-renderizava a janela; o campo em que o jogador
  entrou mantém foco, cursor e o que já foi digitado.
- Especialidades: a flag do rascunho expande chaves com ponto; ficam aninhadas e são achatadas na leitura.
- Compras liberadas pelo Mestre: o saldo do assistente e o log de XP da ficha cobram o custo delas (antes ficavam de
  graça e o saldo não batia).
- Concluir regravava o rascunho ao fechar o assistente.
- Resumo mostra a Devotion inicial (p. 286).
- Valor 4+ sem especialidade avisa no passo (o Brawl da Jane chega a 4 pela compra de XP).
