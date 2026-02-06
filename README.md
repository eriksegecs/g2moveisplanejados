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
- O envio de e-mail agora usa formulario HTTP via FormSubmit (`https://formsubmit.co/ajax/...`), sem backend.
- No primeiro uso, voce precisa confirmar o endpoint por e-mail (verifique caixa de entrada/spam).
- O WhatsApp envia apenas o numero do pedido no texto.
