#!/usr/bin/env node
const fs = require('fs');

const BLOG_URL = 'https://www.duratexmadeira.com.br/blog/todas-as-cores-dos-paineis-mdf-da-duratex/';
const OUT_CSV = 'duratex-cores-blog.csv';

function decode(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function csv(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slugToName(slug) {
  return decode(slug).replace(/[-_]+/g, ' ').trim().replace(/\b\w/g, (m) => m.toUpperCase());
}

function pickMeta(html, prop) {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  return m ? decode(m[1]) : '';
}

async function text(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' }, signal: controller.signal });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.text();
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, fn) {
  const out = [];
  let idx = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const i = idx++;
      try { out[i] = await fn(items[i], i); } catch { out[i] = null; }
    }
  });
  await Promise.all(workers);
  return out.filter(Boolean);
}

(async () => {
  console.log('Lendo blog Duratex...');
  const blog = await text(BLOG_URL);

  const links = [...new Set(
    [...blog.matchAll(/href="(https:\/\/www\.duratexmadeira\.com\.br\/produtos\/[^"]+)"/ig)]
      .map((m) => m[1])
      .filter((u) => /\/produtos\/[a-z0-9-]+\/?$/i.test(u))
  )];

  console.log('Links encontrados:', links.length);
  let done = 0;
  const rows = await mapLimit(links, 8, async (url) => {
    const html = await text(url, 9000);
    done += 1;
    if (done % 15 === 0) console.log(`Processadas: ${done}/${links.length}`);
    const slug = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
    const title = pickMeta(html, 'og:title') || slugToName(slug);
    const imageMeta = pickMeta(html, 'og:image');
    const allImgs = html.match(/https?:\/\/[^"\s>]+\.(?:jpg|jpeg|png|webp)(?:\?[^"\s>]*)?/ig) || [];
    const imgCandidates = allImgs
      .map((u) => decode(u))
      .filter((u) => !/duratex-logo|menu-image|ONDE-ENCONTRAR|246x237/i.test(u));
    let image = imageMeta;
    if (!image) image = imgCandidates.find((u) => u.toLowerCase().includes(`/${slug.toLowerCase()}`));
    if (!image) image = imgCandidates.find((u) => /assets\/.+\.(jpg|jpeg|png|webp)/i.test(u));
    if (!image) return null;
    return {
      marca: 'duratex',
      nome_cor: title.replace(/\s*\|.*$/, '').trim(),
      preco_painel: 330,
      url_imagem: image,
      url_produto: url,
    };
  });

  const dedupe = [];
  const seen = new Set();
  for (const r of rows) {
    const key = r.nome_cor.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    dedupe.push(r);
  }

  const out = ['marca,nome_cor,preco_painel,url_imagem,url_produto'];
  dedupe.forEach((r) => out.push([r.marca, r.nome_cor, r.preco_painel, r.url_imagem, r.url_produto].map(csv).join(',')));
  fs.writeFileSync(OUT_CSV, out.join('\n'), 'utf8');

  console.log('Arquivo:', OUT_CSV);
  console.log('Links de produto no blog:', links.length);
  console.log('Cores coletadas (dedupe):', dedupe.length);
})();
