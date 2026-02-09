#!/usr/bin/env node
const fs = require('fs');

const INPUT = 'catalogo-cores-coletado.csv';
const OUTPUT = 'catalogo-cores-coletado.csv';

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

function esc(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const duratexBad = /(ambiente|conceito|sala|cozinha|dormit|slider|home-copy|onde-encontrar|590x370|842x533|976x468|3110x|3026x|2778x|2880x|2160px)/i;
const guaraBad = /(amb3d|ambiente|imagemambiente|cena|painel-com-tv|cozinha|dormit|sala|capa|menu|frameply|mdf-cru|guararapes\s+pain[eé]is)/i;

const lines = fs.readFileSync(INPUT, 'utf8').split(/\r?\n/).filter(Boolean);
const header = parseCsvLine(lines[0]);
const idxBrand = header.findIndex((h) => ['marca', 'brand'].includes(h.toLowerCase()));
const idxName = header.findIndex((h) => ['nome_cor', 'nome', 'cor', 'color_name'].includes(h.toLowerCase()));
const idxPrice = header.findIndex((h) => ['preco_painel', 'preco', 'price', 'panel_price'].includes(h.toLowerCase()));
const idxImage = header.findIndex((h) => ['url_imagem', 'imagem', 'image', 'image_url'].includes(h.toLowerCase()));

const kept = [];
const removed = [];
for (let i = 1; i < lines.length; i += 1) {
  const cols = parseCsvLine(lines[i]);
  const brand = String(cols[idxBrand] || '').trim().toLowerCase();
  const name = String(cols[idxName] || '').trim();
  const price = String(cols[idxPrice] || '').trim();
  const image = String(cols[idxImage] || '').trim();
  if (!brand || !name || !price || !image) continue;

  let drop = false;
  if (brand === 'duratex') drop = duratexBad.test(name) || duratexBad.test(image) || /produtos - duratex/i.test(name);
  if (brand === 'guararapes') drop = guaraBad.test(name) || guaraBad.test(image);

  if (drop) removed.push({ brand, name, image });
  else kept.push({ brand, name, price, image });
}

const out = ['marca,nome_cor,preco_painel,url_imagem'];
kept.forEach((r) => out.push([r.brand, r.name, r.price, r.image].map(esc).join(',')));
fs.writeFileSync(OUTPUT, out.join('\n'), 'utf8');

const count = kept.reduce((a, r) => ((a[r.brand] = (a[r.brand] || 0) + 1), a), {});
const rcount = removed.reduce((a, r) => ((a[r.brand] = (a[r.brand] || 0) + 1), a), {});
console.log('Mantidos:', count);
console.log('Removidos:', rcount);
