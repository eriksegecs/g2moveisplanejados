#!/usr/bin/env node
const fs = require("fs");

const OUT = "catalogo-cores-coletado.csv";
const PRICE = { duratex: 330, guararapes: 320, berneck: 315 };

const decode = (s) => String(s || "")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">");
const csv = (v) => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const slugToName = (slug) => decode(slug).replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (m) => m.toUpperCase());

function parseLocs(xml) {
  const out = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) out.push(decode(m[1]));
  return out;
}

function pickMeta(html, prop) {
  const re = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i");
  const m = html.match(re);
  return m ? decode(m[1]) : "";
}

async function text(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.text();
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
      try {
        out[i] = await fn(items[i], i);
      } catch {
        out[i] = null;
      }
    }
  });
  await Promise.all(workers);
  return out.filter(Boolean);
}

async function collectDuratex() {
  const xml = await text("https://www.duratexmadeira.com.br/padroes-sitemap.xml");
  const urls = [...new Set(parseLocs(xml).filter((u) => u.includes("/produtos/") && !u.includes("?post_type=")))].slice(0, 120);
  let done = 0;

  return mapLimit(urls, 8, async (url) => {
    const html = await text(url, 9000);
    done += 1;
    if (done % 20 === 0) console.log(`Duratex: ${done}/${urls.length}`);

    const slug = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
    const allImgs = html.match(/https?:\/\/[^"\s>]+\.(?:jpg|jpeg|png|webp)/ig) || [];
    const imgCandidates = allImgs
      .map((u) => decode(u))
      .filter((u) => !/duratex-logo|menu-image|ONDE-ENCONTRAR|246x237/i.test(u));

    let image = imgCandidates.find((u) => u.toLowerCase().includes(`/${slug.toLowerCase()}`));
    if (!image) image = imgCandidates.find((u) => /assets\/.+\.(?:jpg|jpeg|png|webp)$/i.test(u));
    if (!image) return null;

    const rawTitle = pickMeta(html, "og:title") || slugToName(slug);
    const name = rawTitle.replace(/\s*\|.*$/, "").trim();
    return { marca: "duratex", nome: name, preco: PRICE.duratex, imagem: image };
  });
}

async function collectGuararapes() {
  const xml = await text("https://guararapes.com.br/sitemap-pages.xml");
  const urls = [...new Set(parseLocs(xml)
    .filter((u) => /\/produto\//.test(u))
    .filter((u) => !/\/en\//.test(u) && !/\/es\//.test(u)))].slice(0, 140);
  let done = 0;

  return mapLimit(urls, 8, async (url) => {
    const html = await text(url, 9000);
    done += 1;
    if (done % 20 === 0) console.log(`Guararapes: ${done}/${urls.length}`);
    const image = pickMeta(html, "og:image");
    if (!image) return null;
    const rawTitle = pickMeta(html, "og:title") || slugToName(new URL(url).pathname.split("/").filter(Boolean).pop());
    const name = rawTitle.replace(/\s*\|.*$/, "").trim();
    return { marca: "guararapes", nome: name, preco: PRICE.guararapes, imagem: image };
  });
}

async function collectBerneck() {
  const html = await text("https://www.berneck.com.br/products/bp-berneck/catalog");
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) return [];
  const data = JSON.parse(m[1]);
  const list = data?.props?.pageProps?.bps || [];
  return list
    .filter((it) => it?.pattern_image)
    .map((it) => ({
      marca: "berneck",
      nome: (it.complete_name || it.name || "").trim(),
      preco: PRICE.berneck,
      imagem: it.pattern_image,
    }));
}

function dedupe(rows) {
  const out = [];
  const seen = new Set();
  for (const r of rows) {
    const key = `${r.marca}::${String(r.nome).toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

(async () => {
  console.log("Coletando Duratex (imagens reais)...");
  const duratex = await collectDuratex();

  console.log("Coletando Guararapes (imagens reais)...");
  const guararapes = await collectGuararapes();

  console.log("Coletando Berneck (imagens reais)...");
  const berneck = await collectBerneck();

  const rows = dedupe([...duratex, ...guararapes, ...berneck]);

  const lines = ["marca,nome_cor,preco_painel,url_imagem"];
  rows.forEach((r) => lines.push([r.marca, r.nome, r.preco, r.imagem].map(csv).join(",")));
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");

  const count = rows.reduce((a, r) => ((a[r.marca] = (a[r.marca] || 0) + 1), a), {});
  console.log("Gerado:", OUT);
  console.log("Resumo:", count);
})();
