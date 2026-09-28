# Contract: integração Foundry (016)

## `module/documents/creation-service.mjs` (novo)

- `creationSummary(actor)` → resumo da criação (ver [data-model.md](../data-model.md)); usado pelo contexto do painel.
- `setCreationDots(actor, path, value)` → `Promise<boolean>`: com a criação ativa, `checkDots` + `canReach`; recusa com
  aviso (`DTD.Creation.Error.<reason>`), o Mestre confirma e passa; com a criação encerrada, só `canReach`.
- `endCreation(actor)` → só Mestre; com pendências, `DialogV2.confirm` listando-as; grava `system.creation.active:
  false`.

## Mudanças em serviços existentes

- `xp-service.advance`: troca `MAX_RATING` por `canReach` com `actor.system.ratingCaps` (aviso `atMax`/`sixLimit`).
- `feat-service.addFeat`: categoria `hindrance` com 2 Hindrances → recusa `hindranceLimit`; `asset`/`hindrance` com a
  criação encerrada → recusa `creationOnly` (o Mestre libera).
- `asset-service`: Exalted Asset com a criação encerrada → recusa (Paragon isento).
- `class-service.startClass`: passa `creation: actor.system.creation.active` ao `checkClassEntry`.

## Ficha

- Parte `creation` (`templates/actor/parts/creation.hbs`) no topo da aba principal, só com a criação ativa e para o dono
  ou o Mestre: contadores por grupo, XP, especialidades, checklist e o botão Encerrar (Mestre).
- `#onSetDots` chama `setCreationDots`.
- A ação `endCreation` passa a chamar `creation-service.endCreation`; o botão sai da aba Equipamento.

## i18n

`DTD.Creation.*`: título, grupos, "gastos/orçamento", XP, especialidades pendentes/excedentes, etapas e estados,
lembrete de idiomas, erros (`stepMax`, `budget`, `atMax`, `sixLimit`, `hindranceLimit`, `creationOnly`,
`creationLevel`), confirmação de encerramento.
