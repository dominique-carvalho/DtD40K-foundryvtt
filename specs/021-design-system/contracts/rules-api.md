# Contract: verificação automática (021)

Sem módulo de regra novo. `tests/unit/design-tokens.test.mjs` (Node, sem Foundry):

| Caso | Entrada | Esperado |
|---|---|---|
| Contraste Vellum | `ink`, `ink-muted`, `ink-subtle`, `lapis`, `seal`, `phosphor` sobre `paper` e `paper-raised` de `styles/tokens.css` | ≥ 4.5 |
| Contraste Cogitator | `ink`, `ink-muted`, `ink-subtle`, `lapis`, `brass`, `phosphor` sobre `paper` e `paper-raised` | ≥ 4.5 |
| Exceções documentadas | `brass` (Vellum) e `seal` (Cogitator) | só registradas, sem exigir 4.5 |
| Estilos | cada arquivo de `system.json → styles` | existe |
| Fontes | cada `url()` de `styles/fonts.css` | aponta para arquivo existente em `fonts/` |
| Licenças | cada família em `fonts/` | tem `OFL-<família>.txt` |
