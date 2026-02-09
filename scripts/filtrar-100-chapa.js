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

function esc(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const lines = fs.readFileSync('catalogo-cores-coletado.csv', 'utf8').split(/\r?\n/).filter(Boolean);
const head = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
const iBrand = head.findIndex((h) => ['marca', 'brand'].includes(h));
const iName = head.findIndex((h) => ['nome_cor', 'nome', 'cor', 'color_name'].includes(h));
const iPrice = head.findIndex((h) => ['preco_painel', 'preco', 'price', 'panel_price'].includes(h));
const iImg = head.findIndex((h) => ['url_imagem', 'imagem', 'image', 'image_url'].includes(h));

const out = [];
const removed = [];

for (let i = 1; i < lines.length; i += 1) {
  const c = parseCsvLine(lines[i]);
  const brand = String(c[iBrand] || '').trim().toLowerCase();
  const name = String(c[iName] || '').trim();
  const price = String(c[iPrice] || '').trim();
  const img = String(c[iImg] || '').trim();
  if (!brand || !name || !price || !img) continue;

  let keep = true;

  if (brand === 'duratex') {
    const bad = /(ambiente|sala|cozinha|dormit|quarto|painel-com-tv|slider|home-copy|onde-encontrar|590x370|842x533|976x468|2160px|3110x|3026x|2778x|2880x|felipe|denise|carlos)/i;
    const good = /(copiar|\.png\.webp$|_274mX184m|NEX-GEO-DURATEX-YOU|\/[0-9]{4}\/[0-9]{2}\/[^\/]+\.(png|webp)$)/i;
    keep = !bad.test(img) && good.test(img);
  }

  if (brand === 'guararapes') {
    const good = /(guararapes-produtos-|ChapaThumb)/i;
    keep = good.test(img);
  }

  if (keep) out.push({ brand, name, price, img });
  else removed.push({ brand, name, img });
}

const csvOut = ['marca,nome_cor,preco_painel,url_imagem'];
out.forEach((r) => csvOut.push([r.brand, r.name, r.price, r.img].map(esc).join(',')));
fs.writeFileSync('catalogo-cores-coletado.csv', csvOut.join('\n'), 'utf8');

const count = out.reduce((a, r) => ((a[r.brand] = (a[r.brand] || 0) + 1), a), {});
const rcount = removed.reduce((a, r) => ((a[r.brand] = (a[r.brand] || 0) + 1), a), {});
console.log('Mantidos:', count);
console.log('Removidos:', rcount);
