#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const PAGE_URL = 'https://www.guararapes.com.br/produtos/mdf/decorativos/design/paleta-cores/';
const OUT_DIR = path.resolve(process.cwd(), 'assets', 'guararapes-paleta-cores');
const INDEX_CSV = path.resolve(OUT_DIR, 'index.csv');

function decodeHtml(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function safeName(name) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const html = await fetch(PAGE_URL, { headers: { 'user-agent': 'Mozilla/5.0' } }).then((r) => r.text());
  const matches = html.match(/https?:\/\/[^"'\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/ig) || [];

  const normalized = [...new Set(matches
    .map((u) => decodeHtml(u))
    .filter((u) => /images\.prismic\.io\/guararapes\//i.test(u))
    .map((u) => u.split('?')[0]))];

  const rows = [['arquivo', 'url_original']];
  let ok = 0;

  for (let i = 0; i < normalized.length; i += 1) {
    const url = normalized[i];
    const base = path.basename(new URL(url).pathname);
    const filename = `${String(i + 1).padStart(3, '0')}_${safeName(base)}`;
    const outPath = path.join(OUT_DIR, filename);

    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buf);
      rows.push([filename, url]);
      ok += 1;
      if (ok % 20 === 0) console.log(`Baixadas: ${ok}/${normalized.length}`);
    } catch (e) {
      console.warn('Falha:', url, e.message);
    }
  }

  fs.writeFileSync(INDEX_CSV, rows.map((r) => r.map(csvEscape).join(',')).join('\n'), 'utf8');

  console.log('Concluído.');
  console.log('Pasta:', OUT_DIR);
  console.log('Total URLs únicas:', normalized.length);
  console.log('Imagens baixadas:', ok);
  console.log('Índice:', INDEX_CSV);
})();
