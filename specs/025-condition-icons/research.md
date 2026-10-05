# Research — 025 Ícones das condições e dos efeitos

## R1 — Selo redondo (estilo B)

- **Decisão**: SVG autocontido, `viewBox="0 0 100 100"`, 512 px: disco de ferro `#1c2124` (r 48), anel na cor do
  grupo (r 44, traço 6) e glifo em tinta clara `#e8dfca` em `translate(20 20) scale(.117)`, com os paths compactados da
  024 (`compactPath`). Nova função pura `composeSeal({ glyphSvg, color })` em `scripts/lib/icons.mjs`, ao lado de
  `composeIcon`.
- **Racional**: é a prévia aprovada; o glifo claro sobre ferro lê bem a 20 px e o anel carrega a gravidade.
- **Alternativas**: placa Cogitador (pesa sobre o token); só o glifo (perde a identidade).

## R2 — Grupos de gravidade

Cores de `tokens.css` (tema escuro):

| Grupo | Cor | Condições |
|---|---|---|
| `harm` | `#c8372f` lacre | bloodLoss, onFire, dead, lostHand, lostArm, lostEye, lostFoot, lostLeg |
| `impaired` | `#e0963a` âmbar | blinded, deafened, dazed, stunned, diseased, helpless, surprised, jaded, unconscious |
| `restrained` | `#b3a88f` tinta suave | prone, restrained, immobilized, pinned, grappled, grappling, inCover |
| `favorable` | `#62f08f` fósforo | fullDefense, fightDefensively, allOutAttack, healingSurge, running, incorporeal |

Efeitos dos serviços: `degeneration` em `harm`; `martialAttack` e `martialSpecial` em `favorable` (efeitos sobre si) e
`harm` (sobre o alvo); `barrelRoll` em `favorable`.

## R3 — Onde ficam os dados

- **Decisão**: `src/icons/conditions.json` — `{ key, group, glyph }` para as 30 condições e os 4 efeitos de serviço
  (`effect:degeneration`, `effect:martialSelf`, `effect:martialTarget`, `effect:barrelRoll`), mais os grupos com a cor.
  O `build-icons` gera `assets/icons/conditions/<key>.svg` e `assets/icons/effects/<key>.svg`, baixa nada (glifos via
  `icons:fetch`) e inclui os autores no `CREDITS.md`.
- **Racional**: mesma fonte versionada e mesmo pipeline da 024 (FR-005).

## R4 — Condições no Foundry

- **Decisão**: `STATUS_EFFECTS` em `module/config.mjs` passa a usar `systems/dtd40k/assets/icons/conditions/<id>.svg`
  (um teste confere que as 30 existem e são distintas). A sobreposição de derrotado já usa o ícone da condição `dead`
  (`CONFIG.specialStatusEffects.DEFEATED = "dead"`).
- `DTD.ICONS.effect` com os 4 efeitos de serviço; alignment-, martial- e vehicle-service usam o mapa e passam a gravar
  `flags.dtd40k.effectIcon` (a chave), para a atualização do mundo reconhecê-los no futuro.

## R5 — Efeitos dos itens dos compêndios

- **Decisão**: o `build-icons` grava em cada efeito de um item (e de itens embutidos) o `img` do próprio item.
- **Racional**: o efeito é do item (armadura de força, droga, cibernético); usar o ícone dele é o que o Foundry faz
  quando o efeito nasce sem imagem.

## R6 — Atualizar os efeitos do mundo

- **Decisão**: `planIconUpdates` ganha o tipo `effect`. O menu da 024 lista também os efeitos dos atores e dos itens do
  mundo cuja imagem ainda é do Foundry, e escolhe a imagem nova assim, nesta ordem:
  1. condição (primeiro `statuses` que é uma condição do sistema) → selo da condição;
  2. `flags.dtd40k.degeneration` ou `flags.dtd40k.effectIcon` → selo do efeito;
  3. efeito de um item (pai ou `origin`) cujo `img` é do sistema → ícone do item.
- Efeitos antigos de técnicas marciais e do Barrel Roll duram até o próximo turno; não há o que atualizar neles.
- A contagem da confirmação ganha "efeitos".
