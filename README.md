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

## Planilha compartilhada de cores/precos
1. Crie uma planilha no Google Sheets chamada `Catalogo MDF`.
2. Importe o arquivo `catalogo-cores-template.csv`.
3. Aba `Compartilhar`:
   - `Qualquer pessoa com o link` = **Leitor**
   - adicione seu e-mail e o do Dreiky como **Editor**
4. Publique como CSV:
   - `Arquivo > Compartilhar > Publicar na Web`
   - escolha a aba do catalogo e formato **CSV**
   - copie a URL publicada.
5. No `app.js`, configure `COLOR_CATALOG_CSV_URL` com a URL publicada.

Colunas obrigatorias:
- `marca` (`arauco|duratex|guararapes|berneck`)
- `nome_cor`
- `preco_painel`
- `url_imagem`

## Observacao
- O seletor de marca no site atualiza automaticamente as cores e os precos com base na planilha.
- O botao "Solicitar Orcamento" envia o e-mail via FormSubmit com o link da configuracao e o G-code no corpo.
- Se aberto localmente (`file://`), o sistema cai para `mailto:` automaticamente.
- Em GitHub Pages, o envio e feito via `POST` para o FormSubmit (abre em nova aba).
