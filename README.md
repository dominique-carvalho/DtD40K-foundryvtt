# DtD40K-foundryvtt

## Compêndios

A fonte dos compêndios fica em `src/packs/<nome>/*.json` (um arquivo por documento, versionado).
O Foundry lê a versão compilada em LevelDB em `packs/<nome>/`, que **não é versionada** e é
gerada com:

```bash
npm run build:packs
```

- Feche o Foundry antes de rodar o build: com o mundo aberto, o LevelDB do pack fica bloqueado.
- Nunca edite `packs/` à mão; altere os JSON em `src/packs/` e rode o build de novo.
- Compêndios atuais: `races` (12 raças do livro base 1.6).
