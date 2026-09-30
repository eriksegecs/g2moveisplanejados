const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

// Exercita o exportador real, sem iniciar o site, acessar a rede ou enviar e-mails.
const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const testSource = source.replace(
  /\s+init\(\);\s*\}\)\(\);\s*$/,
  "\n  globalThis.exportCsv = buildProductionCsv;\n})();\n"
);
assert.notEqual(testSource, source, "a inicialização do site deve ser desativada no teste");
const context = {
  Blob,
  document: {
    getElementById: () => ({ addEventListener() {} }),
    addEventListener() {},
  },
};
vm.createContext(context);
vm.runInContext(testSource, context, { filename: "app.js" });

const piece = Object.freeze({
  label: "Porta Carvalho",
  width: 1000,
  height: 500,
  quantity: 2,
  thickness: "18",
  color: "Carvalho",
  edgeBandColor: "Pérola",
  brand: "arauco",
});

async function exportRow(edgeSides, canRotate = false) {
  const item = Object.freeze({ ...piece, edgeSides: Object.freeze([...edgeSides]), canRotate });
  const original = JSON.stringify(item);
  const attachment = context.exportCsv({ orderCode: "TESTE", items: [item] });
  const text = new TextDecoder("windows-1252").decode(await attachment.blob.arrayBuffer());
  assert.equal(JSON.stringify(item), original, "exportar não pode alterar os lados ou medidas do site");
  assert.ok(text.endsWith(";\r\n"));
  const [header, data] = text.trimEnd().split("\r\n").map((line) => line.split(";"));
  assert.equal(header.length, 23, "22 colunas e delimitador final");
  assert.equal(data.length, header.length);
  return Object.fromEntries(header.map((key, index) => [key, data[index]]));
}

const edgeColumns = [
  "(15)borda_frontal", "(16)borda_posterior", "(17)borda_esquerda", "(18)borda_direita",
];
const cases = [
  ["superior", ["top"], ["", "", "Pérola", ""]],
  ["inferior", ["bottom"], ["", "", "", "Pérola"]],
  ["esquerdo", ["left"], ["Pérola", "", "", ""]],
  ["direito", ["right"], ["", "Pérola", "", ""]],
  ["superior e inferior", ["top", "bottom"], ["", "", "Pérola", "Pérola"]],
  ["esquerdo e direito", ["left", "right"], ["Pérola", "Pérola", "", ""]],
  ["todos os lados", ["top", "right", "bottom", "left"], ["Pérola", "Pérola", "Pérola", "Pérola"]],
  ["sem fita", [], ["", "", "", ""]],
];

for (const [name, sides, expected] of cases) {
  test("CSV de produção: " + name, async () => {
    // A permissão de giro no encaixe não muda os eixos da peça original exportada.
    for (const canRotate of [false, true]) {
      const row = await exportRow(sides, canRotate);
      assert.deepEqual(edgeColumns.map((column) => row[column]), expected);
      assert.equal(row["(5)comprimento_bruto"], "500.0");
      assert.equal(row["(6)comprimento_liquido"], "500.0");
      assert.equal(row["(7)largura_bruta"], "1000.0");
      assert.equal(row["(8)largura_liquida"], "1000.0");
      assert.equal(row["(4)quantidade"], "2");
    }
  });
}
