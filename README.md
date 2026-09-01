# G2 Móveis Planejados — orçamento e plano de corte

Aplicação 100% frontend para orçamento, plano de corte e fita de borda, sem Flask/backend.

## Arquivos
- `index.html`
- `styles.css`
- `app.js`

## Como publicar no GitHub Pages
1. Suba esta pasta para um repositorio (na raiz ou em uma branch `gh-pages`).
2. No GitHub: `Settings > Pages`.
3. Selecione a branch/pasta que contém o arquivo `index.html`.
4. Publique.

## Funcionamento do orçamento

- O layout é recalculado automaticamente a cada alteração.
- As peças são separadas em painéis diferentes conforme a combinação de cor e espessura.
- O tipo de corte pode ser `Router` ou `Seccionadora`.
- Na seccionadora, são considerados quatro cortes por peça, a R$ 3,50 cada.
- A colagem da fita de borda custa R$ 2,00 por metro, com acréscimo de 50 mm em cada lado selecionado.
- Os lados com fita aparecem no plano de corte, no gabarito lateral, na impressão, no e-mail e na planilha Excel.

## Solicitação por e-mail

O botão `Solicitar orçamento` abre uma confirmação e envia para `g2mplanejados@gmail.com`:

- dados do cliente e resumo completo dos custos;
- link compartilhável da configuração;
- painéis, peças, medidas, cores, fitas de borda e G-code;
- anexo `.xlsx` com as abas `Resumo`, `Painéis`, `Gabarito`, `Cortes`, `Fitas de borda` e `G-code`.

O envio usa o FormSubmit. No primeiro uso para esse destinatário, o FormSubmit envia uma mensagem de ativação para `g2mplanejados@gmail.com`; é necessário confirmar essa mensagem uma única vez. A planilha é gerada no navegador com SheetJS 0.20.3.

## Personalização rápida

No arquivo `app.js`, altere os valores de medidas, custos e destinatário no objeto `DEFAULTS`.

## Planilha compartilhada de cores/precos
1. Crie uma planilha no Google Sheets chamada `Catalogo MDF`.
2. Importe o arquivo `catalogo-cores-base.csv` (base inicial) ou `catalogo-cores-template.csv` (mínimo).
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

Validação do catálogo (antes de publicar):
- `node scripts/validar-catalogo.js catalogo-cores-base.csv`
- ou: `node scripts/validar-catalogo.js seu-arquivo.csv`

## Observações

- O seletor de marca mantém as sugestões e os preços cadastrados, mas a cor da peça é sempre um campo de texto livre.
- Cores digitadas com diferenças apenas de maiúsculas, espaços ou acentos são agrupadas no mesmo painel.
- O envio com anexo exige que a página esteja servida por HTTP/HTTPS; não funciona aberta diretamente por `file://`.
