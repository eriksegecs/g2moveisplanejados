#!/usr/bin/env node
const fs = require('fs');

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else q = !q;
    } else if (ch === ',' && !q) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function readCatalog(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idxBrand = headers.findIndex((h) => ['marca', 'brand'].includes(h));
  const idxName = headers.findIndex((h) => ['nome_cor', 'nome', 'cor', 'color_name'].includes(h));
  const idxPrice = headers.findIndex((h) => ['preco_painel', 'preco', 'price', 'panel_price'].includes(h));
  const idxImage = headers.findIndex((h) => ['url_imagem', 'imagem', 'image', 'image_url'].includes(h));

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return {
      marca: String(cols[idxBrand] || '').trim().toLowerCase(),
      nome_cor: String(cols[idxName] || '').trim(),
      preco_painel: String(cols[idxPrice] || '').trim(),
      url_imagem: String(cols[idxImage] || '').trim(),
    };
  }).filter((r) => r.marca && r.nome_cor && r.preco_painel && r.url_imagem);
}

function esc(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const araucoBase = readCatalog('catalogo-cores-base.csv').filter((r) => r.marca === 'arauco');
const duratexBlog = readCatalog('duratex-cores-blog.csv').filter((r) => r.marca === 'duratex');
const collected = readCatalog('catalogo-cores-coletado.csv');

const out = [];
const seen = new Set();
function add(rows, filterFn) {
  for (const r of rows) {
    if (filterFn && !filterFn(r)) continue;
    const key = `${r.marca}::${r.nome_cor.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
}

add(araucoBase);
add(duratexBlog);
add(collected, (r) => r.marca === 'guararapes' || r.marca === 'berneck');
add(collected, (r) => r.marca === 'duratex');

const header = 'marca,nome_cor,preco_painel,url_imagem';
fs.writeFileSync('catalogo-cores-coletado.csv', [header, ...out.map((r) => [r.marca, r.nome_cor, r.preco_painel, r.url_imagem].map(esc).join(','))].join('\n'));

const count = out.reduce((a, r) => ((a[r.marca] = (a[r.marca] || 0) + 1), a), {});
console.log('Resumo final:', count);
