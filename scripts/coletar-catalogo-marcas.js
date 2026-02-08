#!/usr/bin/env node
const fs = require("fs");

const OUT = "catalogo-cores-coletado.csv";
const PRICE = { duratex: 330, guararapes: 320, berneck: 315 };

const decode = (s) => String(s || "").replace(/&amp;/g, "&");
const csv = (v) => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const slugToName = (slug) => decode(slug).replace(/[-_]+/g, " ").trim().replace(/\b\w/g, (m) => m.toUpperCase());

function placeholderImage(text) {
  return `https://dummyimage.com/300x450/e6e6e6/222.png&text=${encodeURIComponent(text)}`;
}

async function text(url) {
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.text();
}

function locs(xml) {
  const out = [];
  const re = /<loc>(.*?)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) out.push(decode(m[1]));
  return out;
}

(async () => {
  const rows = [];

  // Duratex (nomes por slug + imagem placeholder)
  const duratexXml = await text("https://www.duratexmadeira.com.br/padroes-sitemap.xml");
  const duratexUrls = [...new Set(locs(duratexXml).filter((u) => u.includes("/produtos/") && !u.includes("?post_type=")))];
  for (const url of duratexUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (!slug || slug === "produtos") continue;
    const nome = slugToName(slug);
    rows.push({ marca: "duratex", nome, preco: PRICE.duratex, imagem: placeholderImage(nome) });
  }

  // Guararapes (nomes por slug + imagem placeholder)
  const guaraXml = await text("https://guararapes.com.br/sitemap-pages.xml");
  const guaraUrls = [...new Set(locs(guaraXml).filter((u) => /\/produto\//.test(u) && !/\/en\//.test(u) && !/\/es\//.test(u)))];
  for (const url of guaraUrls) {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop();
    if (!slug) continue;
    const nome = slugToName(slug);
    rows.push({ marca: "guararapes", nome, preco: PRICE.guararapes, imagem: placeholderImage(nome) });
  }

  // Berneck (dados reais + imagem real)
  const berneckHtml = await text("https://www.berneck.com.br/products/bp-berneck/catalog");
  const m = berneckHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (m) {
    const data = JSON.parse(m[1]);
    const list = data?.props?.pageProps?.bps || [];
    for (const it of list) {
      if (!it?.pattern_image) continue;
      rows.push({
        marca: "berneck",
        nome: (it.complete_name || it.name || "").trim(),
        preco: PRICE.berneck,
        imagem: it.pattern_image,
      });
    }
  }

  // dedupe
  const uniq = [];
  const seen = new Set();
  for (const r of rows) {
    const key = `${r.marca}::${r.nome.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(r);
  }

  const lines = ["marca,nome_cor,preco_painel,url_imagem"];
  uniq.forEach((r) => lines.push([r.marca, r.nome, r.preco, r.imagem].map(csv).join(",")));
  fs.writeFileSync(OUT, lines.join("\n"), "utf8");

  const count = uniq.reduce((a, r) => ((a[r.marca] = (a[r.marca] || 0) + 1), a), {});
  console.log("Gerado:", OUT);
  console.log("Resumo:", count);
})();
