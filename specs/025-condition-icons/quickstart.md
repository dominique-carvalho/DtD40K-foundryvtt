# Quickstart — validação da feature 025-condition-icons

## Pré-requisitos

- Link `Data/systems/dtd40k` apontando para o worktree `DtD40K-foundryvtt-025`; `npm run build:icons` e
  `npm run build:packs`; **Foundry reiniciado por completo** e o mundo aberto.

```bash
npm test
```

## Roteiro manual

| # | Passo | Resultado esperado | Spec |
|---|---|---|---|
| 1 | HUD de um token: abrir a lista de condições | 30 selos redondos, todos distintos, anel na cor do grupo | US1-1/2/3 |
| 2 | Ligar Stunned, On Fire, Prone e Unconscious num token | Os 4 selos sobre o token, legíveis a 20 px; os mesmos na ficha | US1-1, SC-003 |
| 3 | Marcar o token como derrotado | Sobreposição com o selo de Dead | US1-4 |
| 4 | Degeneração (Alinhamento), técnica marcial com efeito, Barrel Roll | Efeitos com os selos próprios | US2-1 |
| 5 | Equipar Power Armor e ativar uma droga do compêndio | Efeitos com o ícone do item | US2-2 |
| 6 | Mundo com condição aplicada antes da 025 → Atualizar ícones | Contagem com "efeitos"; selo novo; imagem personalizada mantida | FR-006 |
| 7 | Tema claro e escuro | Selos legíveis nos dois | SC-003 |
| 8 | `build:icons` duas vezes; zip como o da release | Sem mudanças; zip ≤ 2,5 MB | SC-004 |

## Registro de validação — 2026-10-05

Foundry 13.351, mundo Mist of Imlarin, link apontando para o worktree da 025, Foundry reiniciado por completo.

| # | Resultado |
|---|---|
| 1 | `CONFIG.statusEffects`: 30 condições, 30 imagens distintas em `assets/icons/conditions/`, todas servidas; paleta de condições do HUD do token com os 30 selos |
| 2 | Stunned, On Fire, Prone e Unconscious num token: os 4 selos sobre o token, legíveis, com o anel na cor do grupo; a lista de condições da ficha usa os selos (ativas destacadas) |
| 3 | Dead como sobreposição: selo de Dead sobre o token (`specialStatusEffects.DEFEATED = "dead"`) |
| 4 | Degeneração (`applyDegeneration`, Palsy): efeito com `effects/degeneration.svg` e `flags.dtd40k.effectIcon`. Técnica marcial e Barrel Roll conferidos só no código (`CONFIG.DTD.ICONS.effect.*` + `effectIcon`), sem acionar no Foundry |
| 5 | Power Armor equipada e Drive no ator: os efeitos com o ícone do item (`armor/power-armor.svg`, `drug/drive.svg`); no compêndio, o efeito da Power Armor tem o `img` do item |
| 6 | Efeitos antigos (Stunned com `icons/svg/stoned.svg`, degeneração com caveira, efeito de droga com `aura.svg`) e um personalizado → Atualizar ícones: "14 images will change: … and 14 effects"; confirmado: condição → selo, degeneração → selo, efeitos de item → ícone do item; o personalizado mantido. Os efeitos raciais e de armadura de Aldred Kain e Milton e o All Out Attack do Milton também foram atualizados (imagens anteriores registradas) |
| 7 | Ficha nos temas claro e escuro: selos legíveis |
| 8 | `build:icons` de novo: 0 escritos, 0 packs alterados; zip local 2,34 MB |
