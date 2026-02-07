# Landing Frontend (GitHub Pages)

Esta pasta contem uma versao 100% frontend da tela de orcamento (`quote2`), sem Flask/backend.

## Arquivos
- `index.html`
- `styles.css`
- `app.js`

## Como publicar no GitHub Pages
1. Suba esta pasta para um repositorio (na raiz ou em uma branch `gh-pages`).
2. No GitHub: `Settings > Pages`.
3. Selecione a branch/pasta que contem `landing/index.html`.
4. Publique.

## Personalizacao rapida
No arquivo `landing/app.js`, altere:
- `DEFAULTS.whatsappNumber`
- `DEFAULTS.emailTo`
- custos e medidas padrao em `DEFAULTS`.

## Observacao
- O envio de e-mail usa FormSubmit com token (`https://formsubmit.co/ajax/?token=...`) e **nao funciona** abrindo o HTML local (`file://`).
- Para funcionar no Android/desktop, publique em servidor (GitHub Pages) e acesse via `https://...`.
- Se aberto localmente, o sistema cai para `mailto:` automaticamente (sem destinatario predefinido).
