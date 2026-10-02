# Quickstart — validação da feature 020-exalted-asset-xp

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-020`, com os packs compilados; recarregar.
- Personagem de teste em criação com 600 XP e exaltação Werewolf; outro, Elf, para o Paragon.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Arrastar um asset de Werewolf (Black Spiral Dancers) e confirmar | 600 → 500; linha "Black Spiral Dancers · 100" no log | US1-1, FR-003 |
| 2 | Arrastar e cancelar a confirmação | Asset não entra; XP igual | US1-2 |
| 3 | Com 50 XP, arrastar como jogador | Recusado (XP insuficiente) | US1-3 |
| 4 | Com 50 XP, como Mestre, liberar | Asset entra; XP igual; sem linha | US1-4 |
| 5 | Segundo Exalted Asset liberado pelo Mestre | Cobra 100 | US1-5 |
| 6 | Elf escolhe Paragon | Elven Perfection entra sem cobrança | US2-1, FR-005 |
| 7 | Paragon fora da criação compra Action Hero | −100 XP; +1 Hero Point | US2-2 |
| 8 | Desfazer a linha do Action Hero | Asset some; XP volta; Hero Points ajustados | US3-1 |
| 9 | Remover um asset pela ficha; desfazer a linha | A remoção não devolve; o desfazer só devolve | US3-2, FR-008 |
| 10 | Exemplo da p. 18 | 50 XP restantes | SC-001 |

## Registro de validação — 2026-10-02

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 020 (packs compilados no worktree). Personagens
de teste criados por script: Test Wolf (Werewolf, em criação), Test Elf (Elf Paragon) e Test Jane (exemplo da p. 18:
Tiefling Werewolf Monk). Diálogos respondidos por stub; o jogador simulado com `isGM` falso.

| # | Resultado |
|---|---|
| 1 | Black Spiral Dancers: confirmação "Buy Black Spiral Dancers for 100 XP? (600 available)"; 600 → 500; linha `exaltedAsset` de 100 com o id do asset |
| 2 | Confirmação cancelada: asset não entrou; 600 |
| 3 | Com 50 XP, jogador: aviso "Not enough XP: costs 100, 50 available.", sem diálogo, asset não entrou |
| 4 | Com 50 XP, Mestre: aviso e liberação "As GM, allow it anyway at no cost?"; asset entrou; 50; nenhuma linha de compra |
| 5 | Get of Fenris como segundo asset: recusa do limite liberada pelo Mestre, depois a confirmação de 100; 500 → 400 |
| 6 | Elf escolhe Paragon: Elven Perfection entrou com `grantedBy: perfection`; 600; log vazio |
| 7 | Criação encerrada; Action Hero: 600 → 500; Hero Points 4 → 5 (máximo 5) |
| 8 | Desfazer a linha do Action Hero: asset apagado; 600; Hero Points 4/4 |
| 9 | Desfazer Get of Fenris: asset apagado, 400 → 500. Remover Black Spiral Dancers pela ficha: 500, linha mantida; desfazer a linha depois: 600, só devolução |
| 10 | Exemplo da p. 18: Enemy e Impulsive → 800; Black Spiral Dancers e Appearance → 600 (linhas `exaltedAsset` e `asset`); Brawl 3 → 4 → 550; Outsider → 450. Os feats gerais do exemplo não estão na lista do Monk (regra da 006): Unarmed Warrior e Fleet of Foot entraram pela liberação do Mestre sem custo; Wholeness of Body travou o script na escolha do feat (stub do diálogo, não a 020) e Weapon Proficiency não foi tentado. Com os 400 desses quatro, a conta fecha em 50 |

Correção feita na validação: o log de XP rejeitava o tipo `exaltedAsset` (lista `XP_KINDS` do schema); a compra
entrava sem a linha. Tipo incluído, com teste.
