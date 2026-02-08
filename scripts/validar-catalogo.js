#!/usr/bin/env node
/*
Validador de catálogo MDF (CSV)
Uso:
  node scripts/validar-catalogo.js [caminho-do-csv]
Exemplo:
  node scripts/validar-catalogo.js catalogo-cores-template.csv
*/

const fs = require("fs");
const path = require("path");

const REQUIRED_HEADERS = ["marca", "nome_cor", "preco_painel", "url_imagem"];
const VALID_BRANDS = new Set(["arauco", "duratex", "guararapes", "berneck"]);

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }

  out.push(cur.trim());
  return out;
}

function normalizePrice(raw) {
  const str = String(raw || "").trim();
  if (!str) return NaN;

  // Aceita: 350 | 350.50 | 350,50 | 1.350,50
  if (/^\d{1,3}(\.\d{3})+,\d+$/.test(str)) {
    return Number(str.replace(/\./g, "").replace(",", "."));
  }

  if (/^\d+,\d+$/.test(str)) {
    return Number(str.replace(",", "."));
  }

  return Number(str);
}

function isLikelyImageUrl(url) {
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

function main() {
  const input = process.argv[2] || "catalogo-cores-template.csv";
  const filePath = path.resolve(process.cwd(), input);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    console.error("❌ CSV vazio ou sem linhas de dados.");
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missing.length) {
    console.error(`❌ Colunas obrigatórias ausentes: ${missing.join(", ")}`);
    process.exit(1);
  }

  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));

  const errors = [];
  const warnings = [];
  const seen = new Set();
  const perBrand = {
    arauco: 0,
    duratex: 0,
    guararapes: 0,
    berneck: 0,
  };

  for (let lineNo = 2; lineNo <= lines.length; lineNo += 1) {
    const row = parseCsvLine(lines[lineNo - 1]);
    const marca = String(row[idx.marca] || "").trim().toLowerCase();
    const nomeCor = String(row[idx.nome_cor] || "").trim();
    const precoRaw = String(row[idx.preco_painel] || "").trim();
    const urlImagem = String(row[idx.url_imagem] || "").trim();

    if (!VALID_BRANDS.has(marca)) {
      errors.push(`Linha ${lineNo}: marca inválida "${marca}"`);
      continue;
    }

    perBrand[marca] += 1;

    if (!nomeCor) {
      errors.push(`Linha ${lineNo}: nome_cor vazio`);
    }

    const key = `${marca}::${nomeCor.toLowerCase()}`;
    if (seen.has(key)) {
      errors.push(`Linha ${lineNo}: cor duplicada para a marca (${marca} / ${nomeCor})`);
    } else {
      seen.add(key);
    }

    const preco = normalizePrice(precoRaw);
    if (!Number.isFinite(preco) || preco <= 0) {
      errors.push(`Linha ${lineNo}: preco_painel inválido "${precoRaw}"`);
    }

    if (!isLikelyImageUrl(urlImagem)) {
      errors.push(`Linha ${lineNo}: url_imagem inválida "${urlImagem}"`);
    } else if (!/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(urlImagem)) {
      warnings.push(`Linha ${lineNo}: url_imagem sem extensão de imagem comum (${urlImagem})`);
    }
  }

  console.log("\n📊 Resumo por marca:");
  Object.entries(perBrand).forEach(([brand, count]) => {
    console.log(`- ${brand}: ${count} cores`);
  });

  const emptyBrands = Object.entries(perBrand)
    .filter(([, count]) => count === 0)
    .map(([brand]) => brand);

  if (emptyBrands.length) {
    warnings.push(`Marcas sem cores cadastradas: ${emptyBrands.join(", ")}`);
  }

  if (warnings.length) {
    console.log("\n⚠️ Avisos:");
    warnings.forEach((w) => console.log(`- ${w}`));
  }

  if (errors.length) {
    console.log("\n❌ Erros:");
    errors.forEach((e) => console.log(`- ${e}`));
    process.exit(1);
  }

  console.log("\n✅ Catálogo válido.");
}

main();
