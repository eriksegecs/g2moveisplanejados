# Vortex MDF — O corte exato do seu projeto.

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

- A versão publicada aparece no rodapé no formato `AAAA.MM.DD.revisão`; esse identificador deve ser incrementado em cada nova publicação.
- A janela `Compartilhar` permite copiar o link, usar o compartilhamento do dispositivo e baixar o CSV da ordem de produção com a configuração atual.
- O layout é recalculado automaticamente a cada alteração.
- As chapas calculadas são exibidas individualmente por abas, sem navegação lateral.
- As peças são separadas em painéis diferentes conforme a combinação de cor e espessura.
- O tipo de corte pode ser `Router` ou `Seccionadora`.
- Na Router, são consideradas quatro trajetórias por peça e o serviço custa R$ 30,00 por m² cortado, em todas as espessuras.
- Na seccionadora, o layout organiza as peças em tiras verticais e prioriza o encaixe de outras peças na mesma tira. Cada corte vai até o fim da chapa ou da tira correspondente; uma operação já executada não é contada novamente. A limpeza das quatro bordas é contabilizada uma vez por chapa e cada operação custa R$ 3,50.
- O orçamento não cobra o valor da chapa inteira. Para Branco TX, utiliza a área das peças: R$ 38,00/m² em 6 mm e R$ 58,00/m² em 18 mm.
- Cores diferentes de Branco TX e espessuras sem tarifa cadastrada ficam marcadas como valor da chapa sob consulta.
- A colagem da fita de borda custa R$ 2,00 por metro, com acréscimo de 50 mm em cada lado selecionado.
- Os lados com fita aparecem no plano de corte, no gabarito lateral, na impressão, no e-mail e na planilha Excel.

## Solicitação por e-mail

O botão `Solicitar orçamento` abre uma confirmação e envia para `dreikyy@gmail.com`:

- dados do cliente e resumo completo dos custos;
- link compartilhável da configuração;
- painéis, peças, medidas, cores e fitas de borda;
- anexo `.xlsx` com as abas `Resumo`, `Painéis`, `Gabarito`, `Cortes` e `Fitas de borda`.
- anexo `.csv` no formato da ordem de produção de referência, com 22 colunas, separador `;`, quebra de linha Windows e codificação Windows-1252.

O envio usa o endpoint HTML nativo, oculto e ativado do FormSubmit associado a `dreikyy@gmail.com`, com `multipart/form-data` e campos de arquivo separados para o Excel e o CSV. A URL pública do formulário também é informada. A planilha é gerada no navegador com SheetJS 0.20.3.

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
