(function () {
  "use strict";

  const DEFAULTS = {
    panelWidth: 1830,
    panelHeight: 2700,
    cutWidthSaw: 6,
    cutWidthRouter: 14,
    panelCost: 350,
    cutCostSaw: 3.5,
    edgeBandRate: 2,
    edgeBandAllowance: 50,
    whiteTxPieceRate: {
      "6": 38,
      "18": 58,
    },
    routerRate: {
      "6": 30,
      "15": 30,
      "18": 30,
    },
    routerMax: {
      "6": 220,
      "15": 220,
      "18": 220,
    },
    whatsappNumber: "554197190158",
    emailTo: "g2mplanejados@gmail.com",
    emailEndpoint: "https://formsubmit.co/ajax/6db5f26a7b24c72bbc9ed8175c334d8c",
  };

  const state = {
    result: null,
    cutMode: "router",
    selectedBrand: "arauco",
    activePanelIndex: 0,
  };

  const COLOR_CATALOG_CSV_URL = "https://docs.google.com/spreadsheets/d/1FMgGYJK5SHGEz6x--SezD4Fcf92QENOzJHrFKFIucyE/edit?hl=pt-br&gid=0#gid=0";
  const BRANDS = [
    { key: "arauco", label: "Arauco" },
    { key: "duratex", label: "Duratex" },
    { key: "guararapes", label: "Guararapes" },
    { key: "berneck", label: "Berneck" },
  ];
  const EDGE_SIDES = [
    { key: "top", label: "Superior", short: "Sup." },
    { key: "right", label: "Direito", short: "Dir." },
    { key: "bottom", label: "Inferior", short: "Inf." },
    { key: "left", label: "Esquerdo", short: "Esq." },
  ];
  const PRODUCTION_CSV_HEADERS = [
    "(1)id",
    "(2)produto_principal",
    "(3)descricao_peca",
    "(4)quantidade",
    "(5)comprimento_bruto",
    "(6)comprimento_liquido",
    "(7)largura_bruta",
    "(8)largura_liquida",
    "(9)codigo_material",
    "(10)nesting_file",
    "(11)usinagem_a",
    "(12)usinagem_b",
    "(13)observacao_principal",
    "(14)observacao_peca",
    "(15)borda_frontal",
    "(16)borda_posterior",
    "(17)borda_esquerda",
    "(18)borda_direita",
    "(19)tipo_borda",
    "(20)cliente",
    "(21)projeto",
    "(22)pedido",
  ];
  const WINDOWS_1252_BYTES = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f,
  };

  const fallbackCatalog = {
    arauco: [
      { name: "Azul Sereno", url: "https://arauco.com.br/wp-content/uploads/2024/03/AZUL-SERENO-185x275-1.jpg", panelPrice: 400 },
      { name: "Beige", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-beige-arauco.webp", panelPrice: 400 },
      { name: "Beton", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-beton-arauco.webp", panelPrice: 400 },
      { name: "Branco TX", url: "https://arauco.com.br/wp-content/uploads/2024/03/Branco-Supremo-_Chess-185x275-1-scaled.jpg", panelPrice: 260 },
      { name: "Cacao", url: "https://arauco.com.br/wp-content/uploads/2024/03/Cacao-Chess-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Cafelatte", url: "https://arauco.com.br/wp-content/uploads/2024/03/produto-mdf-cafelatte-arauco.webp", panelPrice: 400 },
      { name: "Canela", url: "https://arauco.com.br/wp-content/uploads/2024/03/Canela-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Cinza Cristal", url: "https://arauco.com.br/wp-content/uploads/2024/03/Cinza-Cristal-_Chess-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Cinza Puro", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-cinza-puro.webp", panelPrice: 400 },
      { name: "Connect", url: "https://arauco.com.br/wp-content/uploads/2024/03/Connect-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Cristalina", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-cristalina-arauco.webp", panelPrice: 400 },
      { name: "Damasco", url: "https://arauco.com.br/wp-content/uploads/2024/03/Dasmasco-185-x-275-scaled.jpg", panelPrice: 400 },
      { name: "Ebano", url: "https://arauco.com.br/wp-content/uploads/2024/03/Ebano-Chess-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Frape", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-frape-arauco.webp", panelPrice: 400 },
      { name: "Grafito", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-grafito-arauco.webp", panelPrice: 400 },
      { name: "Gris", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-griss.webp", panelPrice: 400 },
      { name: "Jalapao", url: "https://arauco.com.br/wp-content/uploads/2024/03/Jalapao-185-x-275-3.jpg", panelPrice: 400 },
      { name: "Kashmir", url: "https://arauco.com.br/wp-content/uploads/2024/03/Kashmir-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Lavanda", url: "https://arauco.com.br/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-08-at-23.11.17.jpeg", panelPrice: 400 },
      { name: "Lord", url: "https://arauco.com.br/wp-content/uploads/2024/03/Lord-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Maragogi", url: "https://arauco.com.br/wp-content/uploads/2024/03/Maragogi-185-x-275-3.jpg", panelPrice: 400 },
      { name: "Oceano", url: "https://arauco.com.br/wp-content/uploads/2024/01/oceano.webp", panelPrice: 400 },
      { name: "Sal Rosa", url: "https://arauco.com.br/wp-content/uploads/2024/03/Sal-Rosa-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Salvia", url: "https://arauco.com.br/wp-content/uploads/2024/03/SALVIA-185x275-1-scaled.jpg", panelPrice: 400 },
      { name: "Verde Jade", url: "https://arauco.com.br/wp-content/uploads/2024/03/Verde-Jade-183x275_menor-scaled.jpg", panelPrice: 400 }
    ],
    duratex: [],
    guararapes: [],
    berneck: [],
  };

  let catalogByBrand = JSON.parse(JSON.stringify(fallbackCatalog));

  const itemsEl = document.getElementById("items");
  const layoutGridEl = document.getElementById("layout-grid");
  const layoutEmptyEl = document.getElementById("layout-empty");
  const panelTabsEl = document.getElementById("panel-tabs");
  const panelListEl = document.getElementById("panel-list");

  const sumPanelsEl = document.getElementById("sum-panels");
  const sumCutsEl = document.getElementById("sum-cuts");
  const sumCostEl = document.getElementById("sum-cost");
  const sumMethodEl = document.getElementById("sum-method");
  const sumPieceAreaEl = document.getElementById("sum-piece-area");
  const sumPieceCostEl = document.getElementById("sum-piece-cost");
  const materialConsultationEl = document.getElementById("material-consultation");
  const sumTotalLabelEl = document.getElementById("sum-total-label");
  const sumCutTypeEl = document.getElementById("sum-cut-type");
  const sumCutUnitEl = document.getElementById("sum-cut-unit");
  const sumCutCostEl = document.getElementById("sum-cut-cost");
  const sumEdgeSidesEl = document.getElementById("sum-edge-sides");
  const sumEdgeLengthEl = document.getElementById("sum-edge-length");
  const sumEdgeCostEl = document.getElementById("sum-edge-cost");

  const toggleLabelsEl = document.getElementById("toggle-labels");
  const toggleDimensionsEl = document.getElementById("toggle-dimensions");
  const brandSelectEl = document.getElementById("brand-select");

  function labelForIndex(index) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let idx = index + 1;
    let label = "";
    while (idx > 0) {
      idx -= 1;
      label = letters[idx % 26] + label;
      idx = Math.floor(idx / 26);
    }
    return label;
  }

  function normalizeBrand(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return BRANDS.some((b) => b.key === normalized) ? normalized : "arauco";
  }

  function getCurrentPalette() {
    const brand = normalizeBrand(state.selectedBrand);
    return catalogByBrand[brand] || [];
  }

  function getColorByName(name, brand) {
    const selectedBrand = normalizeBrand(brand || state.selectedBrand);
    const list = catalogByBrand[selectedBrand] || [];
    const normalizedName = normalizeColorKey(name);
    return list.find((color) => normalizeColorKey(color.name) === normalizedName) || null;
  }

  function cleanColorName(value) {
    return String(value || "").trim().replace(/\s+/g, " ") || "Sem cor";
  }

  function normalizeColorKey(value) {
    return cleanColorName(value)
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normalizeEdgeSides(value) {
    const sides = Array.isArray(value) ? value : [];
    return EDGE_SIDES.map((side) => side.key).filter((side) => sides.includes(side));
  }

  function edgeSideNames(value, short) {
    const sides = normalizeEdgeSides(value);
    if (!sides.length) return "Nenhum";
    return sides
      .map((key) => {
        const side = EDGE_SIDES.find((item) => item.key === key);
        return short ? side.short : side.label;
      })
      .join(", ");
  }

  function rotateEdgeSides(value) {
    const clockwise = { top: "right", right: "bottom", bottom: "left", left: "top" };
    return normalizeEdgeSides(value).map((side) => clockwise[side]);
  }

  function edgeBandLengthMm(item) {
    return normalizeEdgeSides(item.edgeSides).reduce((total, side) => {
      const sideLength = side === "top" || side === "bottom" ? Number(item.width) : Number(item.height);
      return total + sideLength + DEFAULTS.edgeBandAllowance;
    }, 0);
  }

  function edgeStrokeColor(name) {
    const normalized = normalizeColorKey(name || "fita");
    let hash = 0;
    for (let i = 0; i < normalized.length; i += 1) {
      hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
    }
    return `hsl(${hash % 360} 72% 42%)`;
  }

  function parseCsvLine(line) {
    const output = [];
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
        output.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    output.push(cur.trim());
    return output;
  }

  function normalizeHeader(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  }

  function extractSheetInfo(rawUrl) {
    try {
      const url = new URL(rawUrl);
      const idMatch = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/i);
      if (!idMatch) return null;
      const gid = url.searchParams.get("gid") || (url.hash.match(/gid=(\d+)/i)?.[1]) || "0";
      return { sheetId: idMatch[1], gid: gid };
    } catch {
      return null;
    }
  }

  function parseGvizRows(text) {
    const match = text.match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/s);
    if (!match) return [];
    const payload = JSON.parse(match[1]);
    const cols = payload?.table?.cols || [];
    const rows = payload?.table?.rows || [];
    const headers = cols.map((c) => normalizeHeader(c?.label || c?.id || ""));
    return rows.map((row) => {
      const obj = {};
      (row?.c || []).forEach((cell, idx) => {
        obj[headers[idx] || `col_${idx}`] = cell && Object.prototype.hasOwnProperty.call(cell, "v") ? cell.v : "";
      });
      return obj;
    });
  }

  function parseCsvRows(text) {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = parseCsvLine(lines[0]).map((h) => normalizeHeader(h.replace(/^\uFEFF/, "")));
    return lines.slice(1).map((line) => {
      const cols = parseCsvLine(line);
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cols[idx] || "";
      });
      return obj;
    });
  }

  function parsePrice(value) {
    return Number(String(value || "0").replace(/\./g, "").replace(",", "."));
  }

  function applyCatalogRows(rows) {
    if (!rows.length) return false;
    const nextCatalog = JSON.parse(JSON.stringify(fallbackCatalog));
    const replacedBrands = new Set();

    rows.forEach((row) => {
      const brand = normalizeBrand(row.marca || row.brand);
      const name = String(row.nome_cor || row.cor || row.color_name || row.nome || "").trim();
      const imageUrl = String(row.url_imagem || row.imagem || row.image_url || row.image || "").trim();
      const price = parsePrice(row.preco_painel || row.preco || row.price || row.panel_price);
      if (!name || !imageUrl || !Number.isFinite(price) || price <= 0) return;

      if (!replacedBrands.has(brand)) {
        nextCatalog[brand] = [];
        replacedBrands.add(brand);
      }
      nextCatalog[brand].push({ name: name, url: imageUrl, panelPrice: price });
    });

    if (Object.values(nextCatalog).some((list) => list.length)) {
      catalogByBrand = nextCatalog;
      return true;
    }
    return false;
  }

  async function loadCatalogFromSheet() {
    if (!COLOR_CATALOG_CSV_URL) return;

    const response = await fetch(COLOR_CATALOG_CSV_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Falha ao carregar planilha de cores");
    const text = await response.text();

    const fromCsv = parseCsvRows(text);
    if (applyCatalogRows(fromCsv)) return;

    const info = extractSheetInfo(COLOR_CATALOG_CSV_URL);
    if (!info) return;

    const gvizUrl = `https://docs.google.com/spreadsheets/d/${info.sheetId}/gviz/tq?gid=${info.gid}&tqx=out:json`;
    const gvizResponse = await fetch(gvizUrl, { cache: "no-store" });
    if (!gvizResponse.ok) return;
    const gvizText = await gvizResponse.text();
    const fromGviz = parseGvizRows(gvizText);
    applyCatalogRows(fromGviz);
  }

  function populateBrandSelect() {
    if (!brandSelectEl) return;
    brandSelectEl.innerHTML = BRANDS.map((brand) => `<option value="${brand.key}">${brand.label}</option>`).join("");
    brandSelectEl.value = normalizeBrand(state.selectedBrand);
  }

  function populateColorNameOptions() {
    let datalist = document.getElementById("color-name-options");
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "color-name-options";
      document.body.appendChild(datalist);
    }
    datalist.innerHTML = getCurrentPalette()
      .map((color) => `<option value="${esc(color.name)}"></option>`)
      .join("");
  }

  function buildEdgeSidePicker() {
    return [
      '<details class="edge-side-picker">',
      '<summary><span data-role="edge-side-summary">0 lados</span></summary>',
      '<div class="edge-side-options">',
      EDGE_SIDES.map((side) => (
        '<label><input type="checkbox" data-role="edge-side" value="' + side.key + '"><span>' + side.label + "</span></label>"
      )).join(""),
      "</div>",
      "</details>",
    ].join("");
  }

  function updateEdgeSideSummary(row) {
    const sides = Array.from(row.querySelectorAll('input[data-role="edge-side"]:checked')).map((input) => input.value);
    const summary = row.querySelector('[data-role="edge-side-summary"]');
    if (summary) summary.textContent = sides.length === 1 ? "1 lado" : sides.length + " lados";
  }

  function rowTemplate() {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = [
      '<input type="text" name="item_label" class="item-label-input" maxlength="40" placeholder="Ex.: Porta direita" aria-label="ID da peça">',
      '<input type="text" name="item_width" minlength="1" maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="mm" aria-label="Largura em milímetros" required>',
      '<input type="text" name="item_height" minlength="1" maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="mm" aria-label="Altura em milímetros" required>',
      '<input type="number" name="item_qty" min="1" value="1" required>',
      '<select name="item_thickness" class="item-select" aria-label="Espessura em milímetros"><option value="6">6 mm</option><option value="15">15 mm</option><option value="18">18 mm</option></select>',
      '<input type="text" name="item_color" class="item-color-input" maxlength="50" list="color-name-options" placeholder="Nome da cor" aria-label="Nome da cor" required>',
      '<input type="text" name="edge_band_color" class="edge-band-color-input" maxlength="50" placeholder="Cor da fita" aria-label="Nome da cor da fita de borda">',
      buildEdgeSidePicker(),
      '<label class="checkbox compact"><input type="checkbox" class="rotate-toggle" checked></label>',
      '<button class="btn btn-ghost remove-row compact" type="button">-</button>',
    ].join("");
    return row;
  }

  function updateLabels() {
    Array.from(itemsEl.children).forEach((row, idx) => {
      const labelInput = row.querySelector('input[name="item_label"]');
      if (!labelInput) return;
      if (!String(labelInput.value || "").trim()) {
        labelInput.value = labelForIndex(idx);
      }
    });
  }

  function addRow(values) {
    const row = rowTemplate();
    if (values) {
      row.querySelector('input[name="item_label"]').value = values.label || "";
      row.querySelector('input[name="item_width"]').value = values.width;
      row.querySelector('input[name="item_height"]').value = values.height;
      row.querySelector('input[name="item_qty"]').value = values.quantity;
      row.querySelector(".rotate-toggle").checked = Boolean(values.canRotate);
      if (values.thickness) {
        row.querySelector('select[name="item_thickness"]').value = String(values.thickness);
      }
      row.querySelector('input[name="item_color"]').value = cleanColorName(values.color || "Branco TX");
      row.querySelector('input[name="edge_band_color"]').value = String(values.edgeBandColor || "").trim();
      normalizeEdgeSides(values.edgeSides).forEach((side) => {
        const checkbox = row.querySelector(`input[data-role="edge-side"][value="${side}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    itemsEl.appendChild(row);
    updateEdgeSideSummary(row);
    updateLabels();
  }

  function clearRows() {
    itemsEl.innerHTML = "";
  }

  function readItemsFromForm() {
    const rows = Array.from(itemsEl.querySelectorAll(".item-row"));
    const items = [];
    rows.forEach((row, idx) => {
      const labelInput = row.querySelector('input[name="item_label"]');
      const customLabel = String((labelInput && labelInput.value) || "").trim();
      const width = Number(row.querySelector('input[name="item_width"]').value || 0);
      const height = Number(row.querySelector('input[name="item_height"]').value || 0);
      const quantity = Number(row.querySelector('input[name="item_qty"]').value || 0);
      const canRotate = row.querySelector(".rotate-toggle").checked;
      const thickness = row.querySelector('select[name="item_thickness"]').value;
      const color = cleanColorName(row.querySelector('input[name="item_color"]').value);
      const edgeBandColor = String(row.querySelector('input[name="edge_band_color"]').value || "").trim();
      const edgeSides = Array.from(row.querySelectorAll('input[data-role="edge-side"]:checked')).map((input) => input.value);
      if (width > 0 && height > 0 && quantity > 0) {
        items.push({
          label: customLabel || labelForIndex(idx),
          width: width,
          height: height,
          quantity: quantity,
          canRotate: canRotate,
          thickness: thickness,
          color: color,
          edgeBandColor: edgeBandColor,
          edgeSides: normalizeEdgeSides(edgeSides),
          brand: state.selectedBrand,
        });
      }
    });
    return items;
  }

  function findPaletteByName(name, brand) {
    return getColorByName(name, brand) || {
      name: cleanColorName(name),
      url: "",
      panelPrice: DEFAULTS.panelCost,
    };
  }

  function expandItems(items) {
    const expanded = [];
    items.forEach((item) => {
      for (let i = 1; i <= item.quantity; i += 1) {
        expanded.push({
          width: item.width,
          height: item.height,
          canRotate: item.canRotate,
          label: item.quantity > 1 ? item.label + " " + i : item.label,
          thickness: item.thickness,
          color: item.color,
          edgeBandColor: item.edgeBandColor,
          edgeSides: normalizeEdgeSides(item.edgeSides),
          brand: item.brand || state.selectedBrand,
        });
      }
    });
    return expanded;
  }

  function newPanel(panelWidth, panelHeight) {
    return {
      width: panelWidth,
      height: panelHeight,
      items: [],
      free: [{ x: 0, y: 0, w: panelWidth, h: panelHeight }],
    };
  }

  function intersects(a, b) {
    return !(
      b.x >= a.x + a.w ||
      b.x + b.w <= a.x ||
      b.y >= a.y + a.h ||
      b.y + b.h <= a.y
    );
  }

  function contains(a, b) {
    return (
      b.x >= a.x &&
      b.y >= a.y &&
      b.x + b.w <= a.x + a.w &&
      b.y + b.h <= a.y + a.h
    );
  }

  function splitFreeRect(freeRect, usedRect) {
    if (!intersects(freeRect, usedRect)) return [freeRect];

    const fx1 = freeRect.x;
    const fy1 = freeRect.y;
    const fx2 = freeRect.x + freeRect.w;
    const fy2 = freeRect.y + freeRect.h;
    const ux1 = usedRect.x;
    const uy1 = usedRect.y;
    const ux2 = usedRect.x + usedRect.w;
    const uy2 = usedRect.y + usedRect.h;

    const splits = [];
    if (ux1 > fx1) splits.push({ x: fx1, y: fy1, w: ux1 - fx1, h: freeRect.h });
    if (ux2 < fx2) splits.push({ x: ux2, y: fy1, w: fx2 - ux2, h: freeRect.h });
    if (uy1 > fy1) splits.push({ x: fx1, y: fy1, w: freeRect.w, h: uy1 - fy1 });
    if (uy2 < fy2) splits.push({ x: fx1, y: uy2, w: freeRect.w, h: fy2 - uy2 });

    return splits.filter((r) => r.w > 0 && r.h > 0);
  }

  function pruneFreeRects(freeRects) {
    const pruned = [];
    freeRects.forEach((r1, i) => {
      let isContained = false;
      freeRects.forEach((r2, j) => {
        if (i !== j && contains(r2, r1)) isContained = true;
      });
      if (!isContained) pruned.push(r1);
    });
    return pruned;
  }

  function orientations(item) {
    const list = [{ w: item.width, h: item.height, rotated: false }];
    if (item.canRotate && item.width !== item.height) {
      list.push({ w: item.height, h: item.width, rotated: true });
    }
    return list;
  }

  function bestPlacement(freeRects, item, cutWidth) {
    let best = null;
    freeRects.forEach((fr) => {
      orientations(item).forEach((o) => {
        const ox = fr.x > 0 ? cutWidth : 0;
        const oy = fr.y > 0 ? cutWidth : 0;
        const needW = o.w + ox;
        const needH = o.h + oy;
        if (needW > fr.w || needH > fr.h) return;

        const shortSide = Math.min(fr.w - needW, fr.h - needH);
        const longSide = Math.max(fr.w - needW, fr.h - needH);
        const score = [shortSide, longSide, fr.y, fr.x];

        const candidate = {
          score: score,
          itemX: fr.x + ox,
          itemY: fr.y + oy,
          itemW: o.w,
          itemH: o.h,
          rotated: o.rotated,
          used: { x: fr.x, y: fr.y, w: needW, h: needH },
        };
        if (!best || compareScore(score, best.score) < 0) {
          best = candidate;
        }
      });
    });
    return best;
  }

  function compareScore(a, b) {
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return 0;
  }

  function placeOnPanel(panel, item, cutWidth) {
    const chosen = bestPlacement(panel.free, item, cutWidth);
    if (!chosen) return false;

    panel.items.push({
      x: chosen.itemX,
      y: chosen.itemY,
      width: chosen.itemW,
      height: chosen.itemH,
      label: item.label + (chosen.rotated ? " (r)" : ""),
      thickness: item.thickness,
      color: item.color,
      edgeBandColor: item.edgeBandColor,
      edgeSides: chosen.rotated ? rotateEdgeSides(item.edgeSides) : normalizeEdgeSides(item.edgeSides),
      rotated: chosen.rotated,
      brand: item.brand || state.selectedBrand,
    });

    const nextFree = [];
    panel.free.forEach((fr) => {
      splitFreeRect(fr, chosen.used).forEach((sp) => nextFree.push(sp));
    });
    panel.free = pruneFreeRects(nextFree);
    return true;
  }

  function packItemsMaxRects(items, panelWidth, panelHeight, cutWidth) {
    const sorted = items.slice().sort((a, b) => {
      const aa = a.width * a.height;
      const bb = b.width * b.height;
      if (bb !== aa) return bb - aa;
      return Math.max(b.width, b.height) - Math.max(a.width, a.height);
    });

    const panels = [];
    const unplaced = [];

    sorted.forEach((item) => {
      let placed = false;
      for (let i = 0; i < panels.length; i += 1) {
        if (placeOnPanel(panels[i], item, cutWidth)) {
          placed = true;
          break;
        }
      }
      if (placed) return;

      const panel = newPanel(panelWidth, panelHeight);
      if (placeOnPanel(panel, item, cutWidth)) {
        panels.push(panel);
      } else {
        unplaced.push(item);
      }
    });

    return {
      layouts: panels.map((p) => ({
        width: p.width,
        height: p.height,
        items: p.items,
      })),
      unplaced: unplaced,
    };
  }

  function packItemsVerticalStrips(items, panelWidth, panelHeight, cutWidth) {
    const sorted = items.slice().sort((a, b) => {
      const areaDifference = b.width * b.height - a.width * a.height;
      if (areaDifference !== 0) return areaDifference;
      return Math.max(b.width, b.height) - Math.max(a.width, a.height);
    });
    const panels = [];
    const unplaced = [];

    function addToStrip(panel, strip, item, orientation) {
      const y = strip.items.length ? strip.usedHeight + cutWidth : 0;
      const placedItem = {
        x: strip.x,
        y: y,
        width: orientation.w,
        height: orientation.h,
        label: item.label + (orientation.rotated ? " (r)" : ""),
        thickness: item.thickness,
        color: item.color,
        edgeBandColor: item.edgeBandColor,
        edgeSides: orientation.rotated ? rotateEdgeSides(item.edgeSides) : normalizeEdgeSides(item.edgeSides),
        rotated: orientation.rotated,
        brand: item.brand || state.selectedBrand,
      };
      strip.items.push(placedItem);
      strip.usedHeight = y + orientation.h;
      panel.items.push(placedItem);
    }

    sorted.forEach((item) => {
      let bestExistingStrip = null;
      panels.forEach((panel, panelIndex) => {
        panel.strips.forEach((strip, stripIndex) => {
          orientations(item).forEach((orientation) => {
            if (orientation.w !== strip.width) return;
            const y = strip.items.length ? strip.usedHeight + cutWidth : 0;
            if (y + orientation.h > panelHeight) return;
            const score = [panelHeight - (y + orientation.h), panelIndex, stripIndex, orientation.rotated ? 1 : 0];
            if (!bestExistingStrip || compareScore(score, bestExistingStrip.score) < 0) {
              bestExistingStrip = { panel: panel, strip: strip, orientation: orientation, score: score };
            }
          });
        });
      });

      if (bestExistingStrip) {
        addToStrip(bestExistingStrip.panel, bestExistingStrip.strip, item, bestExistingStrip.orientation);
        return;
      }

      let bestNewStrip = null;
      panels.forEach((panel, panelIndex) => {
        const x = panel.strips.length ? panel.usedWidth + cutWidth : 0;
        orientations(item).forEach((orientation) => {
          if (x + orientation.w > panelWidth || orientation.h > panelHeight) return;
          const score = [panelWidth - (x + orientation.w), panelHeight - orientation.h, panelIndex, orientation.rotated ? 1 : 0];
          if (!bestNewStrip || compareScore(score, bestNewStrip.score) < 0) {
            bestNewStrip = { panel: panel, x: x, orientation: orientation, score: score };
          }
        });
      });

      if (!bestNewStrip) {
        const panel = {
          width: panelWidth,
          height: panelHeight,
          items: [],
          strips: [],
          usedWidth: 0,
        };
        let bestOrientation = null;
        orientations(item).forEach((orientation) => {
          if (orientation.w > panelWidth || orientation.h > panelHeight) return;
          const score = [panelWidth - orientation.w, panelHeight - orientation.h, orientation.rotated ? 1 : 0];
          if (!bestOrientation || compareScore(score, bestOrientation.score) < 0) {
            bestOrientation = { orientation: orientation, score: score };
          }
        });
        if (!bestOrientation) {
          unplaced.push(item);
          return;
        }
        panels.push(panel);
        bestNewStrip = { panel: panel, x: 0, orientation: bestOrientation.orientation };
      }

      const strip = {
        x: bestNewStrip.x,
        width: bestNewStrip.orientation.w,
        usedHeight: 0,
        items: [],
      };
      bestNewStrip.panel.strips.push(strip);
      bestNewStrip.panel.usedWidth = strip.x + strip.width;
      addToStrip(bestNewStrip.panel, strip, item, bestNewStrip.orientation);
    });

    return {
      layouts: panels.map((panel) => ({
        width: panel.width,
        height: panel.height,
        items: panel.items,
        strips: panel.strips,
      })),
      unplaced: unplaced,
    };
  }

  function buildSawCutPlan(layout) {
    const panelWidth = Math.round(layout.width);
    const panelHeight = Math.round(layout.height);
    const cleanupCuts = [
      { type: "Limpeza lateral esquerda", startX: 0, startY: 0, endX: 0, endY: panelHeight, length: panelHeight },
      { type: "Limpeza lateral direita", startX: panelWidth, startY: 0, endX: panelWidth, endY: panelHeight, length: panelHeight },
      { type: "Limpeza superior", startX: 0, startY: 0, endX: panelWidth, endY: 0, length: panelWidth },
      { type: "Limpeza inferior", startX: 0, startY: panelHeight, endX: panelWidth, endY: panelHeight, length: panelWidth },
    ];
    const verticalCuts = new Map();
    const crossCuts = new Map();

    if (Array.isArray(layout.strips)) {
      layout.strips.forEach((strip) => {
        const startX = Math.round(strip.x);
        const endX = Math.round(strip.x + strip.width);
        if (endX < panelWidth && !verticalCuts.has(endX)) {
          verticalCuts.set(endX, {
            type: "Principal vertical",
            startX: endX,
            startY: 0,
            endX: endX,
            endY: panelHeight,
            length: panelHeight,
          });
        }
        strip.items.forEach((item) => {
          const endY = Math.round(item.y + item.height);
          if (endY >= panelHeight) return;
          const key = [startX, endX, endY].join(":");
          if (!crossCuts.has(key)) {
            crossCuts.set(key, {
              type: "Transversal da tira",
              startX: startX,
              startY: endY,
              endX: endX,
              endY: endY,
              length: endX - startX,
            });
          }
        });
      });
    } else {

      layout.items.forEach((item) => {
        const startX = Math.round(item.x);
        const endX = Math.round(item.x + item.width);
        const endY = Math.round(item.y + item.height);

        if (endX < panelWidth && !verticalCuts.has(endX)) {
          verticalCuts.set(endX, {
            type: "Principal vertical",
            startX: endX,
            startY: 0,
            endX: endX,
            endY: panelHeight,
            length: panelHeight,
          });
        }

        if (endY < panelHeight) {
          const key = [startX, endX, endY].join(":");
          if (!crossCuts.has(key)) {
            crossCuts.set(key, {
              type: "Transversal da tira",
              startX: startX,
              startY: endY,
              endX: endX,
              endY: endY,
              length: endX - startX,
            });
          }
        }
      });
    }

    return cleanupCuts.concat(Array.from(verticalCuts.values())
      .sort((a, b) => a.startX - b.startX)
      .concat(Array.from(crossCuts.values()).sort((a, b) => a.startX - b.startX || a.startY - b.startY)));
  }

  function estimateQuote(items, settings) {
    const expanded = expandItems(items);
    const grouped = expanded.reduce((acc, item) => {
      const brand = normalizeBrand(item.brand || state.selectedBrand);
      const color = cleanColorName(item.color);
      const thickness = String(item.thickness || "6");
      const key = brand + "::" + normalizeColorKey(color) + "::" + thickness;
      if (!acc[key]) acc[key] = { brand: brand, color: color, thickness: thickness, items: [] };
      acc[key].items.push(item);
      return acc;
    }, {});

    const layouts = [];
    let placedCount = 0;
    let unplacedTotal = 0;

    Object.keys(grouped).forEach((groupKey) => {
      const group = grouped[groupKey];
      const packed = settings.cutMode === "saw"
        ? packItemsVerticalStrips(group.items, settings.panelWidth, settings.panelHeight, settings.cutWidth)
        : packItemsMaxRects(group.items, settings.panelWidth, settings.panelHeight, settings.cutWidth);
      packed.layouts.forEach((layout) => {
        layouts.push({
          width: layout.width,
          height: layout.height,
          items: layout.items,
          strips: layout.strips || null,
          color: group.color,
          thickness: group.thickness,
          brand: group.brand,
          colorUrl: findPaletteByName(group.color, group.brand).url,
        });
      });
      placedCount += packed.layouts.reduce((acc, l) => acc + l.items.length, 0);
      unplacedTotal += packed.unplaced.length;
    });

    const totalPanels = Math.max(1, layouts.length);
    const sawCutPlans = settings.cutMode === "saw" ? layouts.map((layout) => buildSawCutPlan(layout)) : [];
    const totalCuts = settings.cutMode === "saw"
      ? sawCutPlans.reduce((total, cuts) => total + cuts.length, 0)
      : placedCount * 4;
    let cutCostTotal = 0;

    if (settings.cutMode === "router") {
      layouts.forEach((layout) => {
        layout.items.forEach((item) => {
          const thickness = String(item.thickness || "6");
          const rate = settings.routerRate[thickness] || settings.routerRate["6"];
          const maxCost = settings.routerMax[thickness] || settings.routerMax["6"];
          const areaM2 = (Number(item.width) * Number(item.height)) / 1_000_000;
          const itemCost = Math.min(maxCost, areaM2 * rate);
          cutCostTotal += itemCost;
        });
      });
    } else {
      cutCostTotal = totalCuts * settings.cutCostSaw;
    }

    let edgeBandLengthMmTotal = 0;
    let edgeBandSideCount = 0;
    layouts.forEach((layout) => {
      layout.items.forEach((item) => {
        const sides = normalizeEdgeSides(item.edgeSides);
        edgeBandSideCount += sides.length;
        edgeBandLengthMmTotal += edgeBandLengthMm(item);
      });
    });
    const edgeBandLengthM = edgeBandLengthMmTotal / 1000;
    const edgeBandCostTotal = edgeBandLengthM * settings.edgeBandRate;

    let whiteTxPieceAreaM2 = 0;
    let whiteTxPieceCostTotal = 0;
    const materialConsultations = new Set();
    layouts.forEach((layout) => {
      const thickness = String(layout.thickness || "6");
      const isWhiteTx = normalizeColorKey(layout.color) === normalizeColorKey("Branco TX");
      const rate = isWhiteTx ? Number(settings.whiteTxPieceRate[thickness] || 0) : 0;
      if (!rate) {
        materialConsultations.add((layout.color || "Sem cor") + " " + thickness + " mm");
        return;
      }
      layout.items.forEach((item) => {
        const areaM2 = (Number(item.width) * Number(item.height)) / 1_000_000;
        whiteTxPieceAreaM2 += areaM2;
        whiteTxPieceCostTotal += areaM2 * rate;
      });
    });
    const totalCost = whiteTxPieceCostTotal + cutCostTotal + edgeBandCostTotal;
    return {
      totalPanels: totalPanels,
      totalCuts: totalCuts,
      totalCost: totalCost,
      whiteTxPieceAreaM2: whiteTxPieceAreaM2,
      whiteTxPieceCostTotal: whiteTxPieceCostTotal,
      whiteTxPieceRate: settings.whiteTxPieceRate,
      materialConsultationRequired: materialConsultations.size > 0,
      materialConsultationLabels: Array.from(materialConsultations),
      cutCostTotal: cutCostTotal,
      edgeBandCostTotal: edgeBandCostTotal,
      edgeBandLengthM: edgeBandLengthM,
      edgeBandSideCount: edgeBandSideCount,
      cutMode: settings.cutMode,
      cutUnitPrice: settings.cutMode === "saw" ? settings.cutCostSaw : null,
      routerRatePerM2: settings.cutMode === "router" ? settings.routerRate["6"] : null,
      edgeBandRate: settings.edgeBandRate,
      edgeBandAllowance: settings.edgeBandAllowance,
      method: settings.cutMode === "saw" ? "guilhotina-vertical" : "custom-maxrects",
      layouts: layouts,
      sawCutPlans: sawCutPlans,
      raw: {
        requestedCount: expanded.length,
        placedCount: placedCount,
        unplacedCount: unplacedTotal,
      },
    };
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function dimFontSize(item) {
    const minSide = Math.min(item.width, item.height);
    const val = Math.round(minSide * 0.1);
    return Math.max(50, Math.min(120, val));
  }

  function labelFontSize(item) {
    const minSide = Math.min(item.width, item.height);
    const val = Math.round(minSide * 0.16);
    return Math.max(70, Math.min(160, val));
  }

  function renderEdgeBandLines(item, className) {
    const x = Math.round(item.x);
    const y = Math.round(item.y);
    const x2 = Math.round(item.x + item.width);
    const y2 = Math.round(item.y + item.height);
    const coordinates = {
      top: [x, y, x2, y],
      right: [x2, y, x2, y2],
      bottom: [x2, y2, x, y2],
      left: [x, y2, x, y],
    };
    const color = edgeStrokeColor(item.edgeBandColor);
    const baseClass = className || "edge-band-line";
    return normalizeEdgeSides(item.edgeSides)
      .map((side) => {
        const line = coordinates[side];
        return [
          `<line class="${baseClass} edge-band-line-shadow" x1="${line[0]}" y1="${line[1]}" x2="${line[2]}" y2="${line[3]}"></line>`,
          `<line class="${baseClass}" x1="${line[0]}" y1="${line[1]}" x2="${line[2]}" y2="${line[3]}" stroke="${color}"></line>`,
        ].join("");
      })
      .join("");
  }

  function renderLayouts() {
    const result = state.result;
    if (!result || !result.layouts.length) {
      layoutGridEl.innerHTML = "";
      panelTabsEl.innerHTML = "";
      layoutEmptyEl.style.display = "block";
      panelListEl.innerHTML = '<div class="panel-list-title">Painéis</div><div class="opcut-empty small">Nenhum painel calculado.</div>';
      return;
    }

    layoutEmptyEl.style.display = "none";
    state.activePanelIndex = Math.min(state.activePanelIndex, result.layouts.length - 1);
    const activePanelIndex = state.activePanelIndex;
    panelTabsEl.innerHTML = result.layouts
      .map((layout, panelIndex) => {
        const isActive = panelIndex === activePanelIndex;
        const panelCutCount = result.cutMode === "saw" ? result.sawCutPlans[panelIndex].length : layout.items.length * 4;
        return [
          `<button class="panel-tab${isActive ? " is-active" : ""}" id="panel-tab-${panelIndex}" type="button" role="tab" aria-selected="${isActive}" aria-controls="panel-layout-${panelIndex}" tabindex="${isActive ? "0" : "-1"}" data-panel-index="${panelIndex}">`,
          `<span>Chapa ${panelIndex + 1}</span>`,
          `<small>${esc(layout.color || "Branco TX")} • ${esc(layout.thickness || "6")} mm • ${panelCutCount} ${result.cutMode === "saw" ? "cortes" : "traj."}</small>`,
          `</button>`,
        ].join("");
      })
      .join("");
    layoutGridEl.innerHTML = result.layouts
      .map((layout, panelIndex) => {
        const isActive = panelIndex === activePanelIndex;
        const patternId = "panelPattern" + panelIndex;
        const hatchId = "pieceHatch" + panelIndex;
        const panelTexture = layout.colorUrl
          ? `<image href="${esc(layout.colorUrl)}" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"></image>`
          : '<rect x="0" y="0" width="180" height="180" fill="#d8d1c7"></rect>';
        const itemsSvg = layout.items
          .map((item) => {
            const lf = labelFontSize(item);
            const df = dimFontSize(item);
            const cx = Math.round(item.x + item.width / 2);
            const cy = Math.round(item.y + item.height / 2);
            const tx = Math.round(item.x + df);
            const edgeBandLines = renderEdgeBandLines(item);
            return [
              `<rect class="layout-item" x="${Math.round(item.x)}" y="${Math.round(item.y)}" width="${Math.round(item.width)}" height="${Math.round(item.height)}" fill="url(#${hatchId})"></rect>`,
              edgeBandLines,
              `<text class="layout-label-text" x="${cx}" y="${cy}" style="font-size:${lf}px">${esc(item.label || "Item")}</text>`,
              `<text class="layout-dim-text" x="${cx}" y="${Math.round(item.y + df)}" style="font-size:${df}px">${Math.round(item.width)} mm</text>`,
              `<text class="layout-dim-text" x="${tx}" y="${cy}" transform="rotate(-90 ${tx} ${cy})" style="font-size:${df}px">${Math.round(item.height)} mm</text>`,
            ].join("");
          })
          .join("");

        return [
          `<div class="layout-card${isActive ? " is-active" : ""}" id="panel-layout-${panelIndex}" role="tabpanel" aria-labelledby="panel-tab-${panelIndex}" data-panel-index="${panelIndex}"${isActive ? "" : " hidden"}>`,
          `<div class="layout-title">Painel ${panelIndex + 1} - ${esc(layout.brand || state.selectedBrand)} - ${esc(layout.color || "Branco TX")} - ${esc(layout.thickness || "6")} mm</div>`,
          `<div class="layout-meta">Medidas internas: ${Math.round(layout.width)} x ${Math.round(layout.height)} mm${layout.items.some((item) => normalizeEdgeSides(item.edgeSides).length) ? " • linhas coloridas = fita de borda" : ""}</div>`,
          `<svg class="layout-svg" viewBox="0 0 ${Math.round(layout.width)} ${Math.round(layout.height)}" preserveAspectRatio="xMidYMid meet">`,
          `<defs>`,
          `<pattern id="${patternId}" patternUnits="userSpaceOnUse" width="180" height="180">`,
          panelTexture,
          `</pattern>`,
          `<pattern id="${hatchId}" patternUnits="userSpaceOnUse" width="112" height="112">`,
          `<rect x="0" y="0" width="112" height="112" fill="transparent"></rect>`,
          `<line x1="0" y1="0" x2="112" y2="112" stroke="#ffffff" stroke-opacity="0.9" stroke-width="1.6"></line>`,
          `<line x1="112" y1="0" x2="0" y2="112" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.1"></line>`,
          `</pattern>`,
          `</defs>`,
          `<rect class="layout-bg" x="0" y="0" width="${Math.round(layout.width)}" height="${Math.round(layout.height)}" fill="url(#${patternId})"></rect>`,
          itemsSvg,
          `</svg>`,
          `</div>`,
        ].join("");
      })
      .join("");

    panelListEl.innerHTML = [
      '<div class="panel-list-title">Painéis</div>',
      result.layouts
        .map((layout, idx) => {
          const rows = layout.items
            .map((item) => {
              const edgeInfo = normalizeEdgeSides(item.edgeSides).length
                ? `<small>Fita ${esc(item.edgeBandColor || "não informada")}: ${esc(edgeSideNames(item.edgeSides, true))}</small>`
                : "";
              return `<div class="panel-piece-row"><span>${esc(item.label)}${edgeInfo}</span><span>${Math.round(item.width)} x ${Math.round(item.height)} mm</span></div>`;
            })
            .join("");
          return [
            '<div class="panel-list-group">',
            `<button class="panel-list-row${idx === activePanelIndex ? " is-active" : ""}" type="button" data-panel-index="${idx}">`,
            `<span class="panel-list-label">Painel ${idx + 1} - ${esc(layout.brand || state.selectedBrand)} - ${esc(layout.color || "Branco TX")} - ${esc(layout.thickness || "6")} mm</span>`,
            `<span class="panel-list-size">${Math.round(layout.width)} x ${Math.round(layout.height)} mm</span>`,
            "</button>",
            `<div class="panel-piece-list">${rows}</div>`,
            "</div>",
          ].join("");
        })
        .join(""),
    ].join("");
  }

  function renderSummary() {
    const result = state.result;
    if (!result) {
      sumPanelsEl.textContent = "0";
      sumCutsEl.textContent = "0";
      sumCostEl.textContent = "0,00";
      sumPieceAreaEl.textContent = "0,00";
      sumPieceCostEl.textContent = "0,00";
      sumTotalLabelEl.textContent = "Valor estimado:";
      materialConsultationEl.textContent = "Para chapas diferentes de Branco TX, consulte o valor.";
      materialConsultationEl.classList.remove("is-active");
      sumCutTypeEl.textContent = state.cutMode === "saw" ? "Seccionadora" : "Router";
      sumCutUnitEl.textContent = "cortes";
      sumCutCostEl.textContent = "0,00";
      sumEdgeSidesEl.textContent = "0";
      sumEdgeLengthEl.textContent = "0,00";
      sumEdgeCostEl.textContent = "0,00";
      sumMethodEl.textContent = "custom-maxrects";
      return;
    }
    sumPanelsEl.textContent = String(result.totalPanels);
    sumCutsEl.textContent = String(result.totalCuts);
    sumCostEl.textContent = formatDecimal(result.totalCost);
    sumPieceAreaEl.textContent = formatDecimal(result.whiteTxPieceAreaM2);
    sumPieceCostEl.textContent = formatDecimal(result.whiteTxPieceCostTotal);
    sumTotalLabelEl.textContent = result.materialConsultationRequired ? "Subtotal estimado:" : "Valor estimado:";
    materialConsultationEl.textContent = result.materialConsultationRequired
      ? "Valor da chapa sob consulta: " + result.materialConsultationLabels.join(", ") + ". O subtotal não inclui esses materiais."
      : "Para chapas diferentes de Branco TX, consulte o valor.";
    materialConsultationEl.classList.toggle("is-active", result.materialConsultationRequired);
    sumCutTypeEl.textContent = result.cutMode === "saw" ? "Seccionadora" : "Router";
    sumCutUnitEl.textContent = result.cutMode === "saw"
      ? "operações (inclui 4 limpezas/chapa) × R$ 3,50"
      : "trajetórias (4 lados por peça) • R$ " + formatDecimal(result.routerRatePerM2) + "/m²";
    sumCutCostEl.textContent = formatDecimal(result.cutCostTotal);
    sumEdgeSidesEl.textContent = String(result.edgeBandSideCount);
    sumEdgeLengthEl.textContent = formatDecimal(result.edgeBandLengthM);
    sumEdgeCostEl.textContent = formatDecimal(result.edgeBandCostTotal);
    sumMethodEl.textContent = result.method + " / " + (result.cutMode === "saw" ? "seccionadora" : "router");
  }

  function formatDecimal(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function setActivePanel(index) {
    const parsedIndex = Number(index);
    if (!state.result || !Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= state.result.layouts.length) return;
    state.activePanelIndex = parsedIndex;
    const cards = layoutGridEl.querySelectorAll(".layout-card");
    const rows = panelListEl.querySelectorAll(".panel-list-row");
    const tabs = panelTabsEl.querySelectorAll(".panel-tab");
    cards.forEach((card) => {
      const active = card.dataset.panelIndex === String(parsedIndex);
      card.hidden = !active;
      card.classList.toggle("is-active", active);
    });
    rows.forEach((row) => {
      row.classList.toggle("is-active", row.dataset.panelIndex === String(parsedIndex));
    });
    tabs.forEach((tab) => {
      const active = tab.dataset.panelIndex === String(parsedIndex);
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
  }

  function applyOverlayState() {
    layoutGridEl.classList.toggle("hide-labels", !toggleLabelsEl.checked);
    layoutGridEl.classList.toggle("hide-dimensions", !toggleDimensionsEl.checked);
  }

  function buildOrderCode() {
    const now = Date.now().toString();
    const randomPart = String(Math.floor(Math.random() * 900 + 100));
    return "PED" + now.slice(-8) + randomPart;
  }

  function generateGcodeForPanel(layout, panelIndex) {
    const lines = [];
    lines.push("G21 ; mm");
    lines.push("G90 ; abs");
    lines.push("G0 Z5");
    lines.push("M3 S12000");
    lines.push("(Panel " + (panelIndex + 1) + " - " + (layout.color || "Sem cor") + " - " + String(layout.thickness || "6") + " mm)");
    layout.items.forEach((item) => {
      const x = Math.round(item.x);
      const y = Math.round(item.y);
      const w = Math.round(item.width);
      const h = Math.round(item.height);
      const label = String(item.label || "Item");
      lines.push("(Item " + label + ")");
      lines.push("G0 X" + x + " Y" + y);
      lines.push("G1 Z-3 F300");
      lines.push("G1 X" + (x + w) + " Y" + y + " F1200");
      lines.push("G1 X" + (x + w) + " Y" + (y + h));
      lines.push("G1 X" + x + " Y" + (y + h));
      lines.push("G1 X" + x + " Y" + y);
      lines.push("G0 Z5");
    });
    lines.push("M5");
    lines.push("G0 Z5");
    lines.push("G0 X0 Y0");
    lines.push("M2");
    return lines.join("\n");
  }

  function setSheetColumns(worksheet, widths) {
    worksheet["!cols"] = widths.map((width) => ({ wch: width }));
  }

  function normalizeProductionCode(value) {
    const normalized = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    return normalized || "ITEM";
  }

  function productionCsvCell(value) {
    const text = String(value ?? "").replace(/\r\n|\r|\n/g, " ");
    return /[;\"]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function encodeWindows1252(text) {
    const bytes = [];
    for (const character of String(text)) {
      const codePoint = character.codePointAt(0);
      if (codePoint <= 0x7f || (codePoint >= 0xa0 && codePoint <= 0xff)) {
        bytes.push(codePoint);
      } else if (WINDOWS_1252_BYTES[codePoint] !== undefined) {
        bytes.push(WINDOWS_1252_BYTES[codePoint]);
      } else {
        bytes.push(0x3f);
      }
    }
    return new Uint8Array(bytes);
  }

  function buildProductionCsv(order) {
    const items = Array.isArray(order.items) ? order.items : [];
    const cutLabel = state.cutMode === "saw" ? "Seccionadora" : "Router";
    const principalNote = [
      order.phone ? "Telefone: " + order.phone : "",
      order.shareUrl ? "Link: " + order.shareUrl : "",
    ].filter(Boolean).join(" | ");
    const rows = [PRODUCTION_CSV_HEADERS];

    items.forEach((item, index) => {
      const label = String(item.label || "Item " + (index + 1)).trim();
      const thickness = String(item.thickness || "").trim();
      const color = cleanColorName(item.color || "Sem cor");
      const edgeSides = normalizeEdgeSides(item.edgeSides);
      const edgeColor = String(item.edgeBandColor || "").trim();
      const edgeFor = (side) => edgeSides.includes(side) ? edgeColor : "";
      const nestingFile = normalizeProductionCode(label) + "_" + String(index + 1).padStart(3, "0");
      const brandKey = normalizeBrand(item.brand || state.selectedBrand);
      const brand = BRANDS.find((candidate) => candidate.key === brandKey);
      const width = Number(item.width || 0).toFixed(1);
      const height = Number(item.height || 0).toFixed(1);
      rows.push([
        label,
        label,
        label,
        Math.max(1, Math.round(Number(item.quantity || 1))),
        width,
        width,
        height,
        height,
        "MDF_" + (thickness || "0") + "_" + normalizeProductionCode(color),
        nestingFile,
        "",
        "",
        principalNote,
        "Marca: " + (brand ? brand.label : brandKey) + " | Corte: " + cutLabel,
        edgeFor("top"),
        edgeFor("bottom"),
        edgeFor("left"),
        edgeFor("right"),
        "",
        order.name || "",
        order.orderCode || "",
        order.orderCode || "",
      ]);
    });

    const csvText = rows.map((row) => row.map(productionCsvCell).join(";") + ";").join("\r\n") + "\r\n";
    const safeClient = String(order.name || "Cliente").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
    return {
      blob: new Blob([encodeWindows1252(csvText)], { type: "text/csv;charset=windows-1252" }),
      filename: "OP " + (order.orderCode || "ORCAMENTO") + " " + (safeClient || "Cliente") + ".csv",
    };
  }

  function buildQuoteWorkbook(order) {
    if (!window.XLSX) {
      throw new Error("Não foi possível carregar o gerador da planilha Excel. Recarregue a página e tente novamente.");
    }

    const workbook = window.XLSX.utils.book_new();
    const generatedAt = new Date().toLocaleString("pt-BR");
    const summaryRows = [
      ["ORÇAMENTO VORTEX MDF"],
      [],
      ["Pedido", order.orderCode],
      ["Data da solicitação", generatedAt],
      ["Cliente", order.name],
      ["Telefone", order.phone],
      ["Link compartilhável", order.shareUrl],
      ["Método de corte", state.result.cutMode === "saw" ? "Seccionadora" : "Router"],
      ["Unidade de medida", "Milímetros (mm)"],
      ["Painéis necessários", state.result.totalPanels],
      [state.result.cutMode === "saw" ? "Operações únicas de corte" : "Trajetórias (4 lados por peça)", state.result.totalCuts],
      ["Limpezas de borda por chapa", state.result.cutMode === "saw" ? 4 : "Não se aplica"],
      [state.result.cutMode === "saw" ? "Tarifa por corte (R$)" : "Tarifa Router (R$/m²)", state.result.cutMode === "saw" ? Number(state.result.cutUnitPrice || 0) : Number(state.result.routerRatePerM2 || 0)],
      ["Peças posicionadas", state.result.raw.placedCount],
      ["Peças não posicionadas", state.result.raw.unplacedCount],
      ["Área tarifada das peças Branco TX (m²)", Number(state.result.whiteTxPieceAreaM2 || 0)],
      ["Branco TX 6 mm (R$/m²)", Number(state.result.whiteTxPieceRate["6"] || 0)],
      ["Branco TX 18 mm (R$/m²)", Number(state.result.whiteTxPieceRate["18"] || 0)],
      ["Custo das peças Branco TX (R$)", Number(state.result.whiteTxPieceCostTotal || 0)],
      ["Valor de chapa sob consulta", state.result.materialConsultationRequired ? state.result.materialConsultationLabels.join(", ") : "Não"],
      ["Custo do corte (R$)", Number(state.result.cutCostTotal || 0)],
      ["Quantidade de lados com fita", state.result.edgeBandSideCount],
      ["Fita para colagem, com acréscimos (m)", Number(state.result.edgeBandLengthM || 0)],
      ["Custo da colagem da fita (R$)", Number(state.result.edgeBandCostTotal || 0)],
      [state.result.materialConsultationRequired ? "Subtotal estimado (R$)" : "Valor estimado (R$)", Number(state.result.totalCost || 0)],
    ];
    const summarySheet = window.XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
    setSheetColumns(summarySheet, [42, 95]);
    window.XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumo");

    const panelRows = [[
      "Painel",
      "Marca",
      "Cor",
      "Espessura (mm)",
      "Largura (mm)",
      "Altura (mm)",
      "Quantidade de peças",
      "Lados com fita",
      "Fita para colagem (m)",
    ]];
    state.result.layouts.forEach((layout, panelIndex) => {
      panelRows.push([
        panelIndex + 1,
        layout.brand || state.selectedBrand,
        layout.color || "Sem cor",
        Number(layout.thickness || 0),
        Math.round(layout.width),
        Math.round(layout.height),
        layout.items.length,
        layout.items.reduce((total, item) => total + normalizeEdgeSides(item.edgeSides).length, 0),
        layout.items.reduce((total, item) => total + edgeBandLengthMm(item), 0) / 1000,
      ]);
    });
    const panelsSheet = window.XLSX.utils.aoa_to_sheet(panelRows);
    panelsSheet["!autofilter"] = { ref: panelsSheet["!ref"] };
    setSheetColumns(panelsSheet, [10, 16, 26, 18, 16, 16, 22, 18, 22]);
    window.XLSX.utils.book_append_sheet(workbook, panelsSheet, "Painéis");

    const templateRows = [[
      "Painel",
      "ID da peça",
      "Marca",
      "Cor",
      "Espessura (mm)",
      "X (mm)",
      "Y (mm)",
      "Largura (mm)",
      "Altura (mm)",
      "Rotacionada",
      "Cor da fita de borda",
      "Lados com fita",
      "Fita para colagem (mm)",
      "Custo da colagem (R$)",
    ]];
    state.result.layouts.forEach((layout, panelIndex) => {
      layout.items.forEach((item) => {
        templateRows.push([
          panelIndex + 1,
          String(item.label || "Item").replace(/\s*\(r\)$/, ""),
          layout.brand || state.selectedBrand,
          layout.color || "Sem cor",
          Number(item.thickness || 0),
          Math.round(item.x),
          Math.round(item.y),
          Math.round(item.width),
          Math.round(item.height),
          item.rotated ? "Sim" : "Não",
          item.edgeBandColor || "",
          edgeSideNames(item.edgeSides, false),
          edgeBandLengthMm(item),
          (edgeBandLengthMm(item) / 1000) * DEFAULTS.edgeBandRate,
        ]);
      });
    });
    const templateSheet = window.XLSX.utils.aoa_to_sheet(templateRows);
    templateSheet["!autofilter"] = { ref: templateSheet["!ref"] };
    setSheetColumns(templateSheet, [10, 28, 16, 26, 18, 12, 12, 16, 16, 14, 24, 38, 24, 24]);
    window.XLSX.utils.book_append_sheet(workbook, templateSheet, "Gabarito");

    const cutRows = [[
      "Painel",
      "ID da peça",
      "Corte",
      "Início X (mm)",
      "Início Y (mm)",
      "Fim X (mm)",
      "Fim Y (mm)",
      "Comprimento (mm)",
    ]];
    state.result.layouts.forEach((layout, panelIndex) => {
      if (state.result.cutMode === "saw") {
        state.result.sawCutPlans[panelIndex].forEach((cut) => {
          cutRows.push([
            panelIndex + 1,
            "—",
            cut.type,
            cut.startX,
            cut.startY,
            cut.endX,
            cut.endY,
            cut.length,
          ]);
        });
        return;
      }

      layout.items.forEach((item) => {
        const label = String(item.label || "Item").replace(/\s*\(r\)$/, "");
        const x = Math.round(item.x);
        const y = Math.round(item.y);
        const width = Math.round(item.width);
        const height = Math.round(item.height);
        [
          ["Superior", x, y, x + width, y, width],
          ["Direito", x + width, y, x + width, y + height, height],
          ["Inferior", x + width, y + height, x, y + height, width],
          ["Esquerdo", x, y + height, x, y, height],
        ].forEach((cut) => {
          cutRows.push([panelIndex + 1, label, ...cut]);
        });
      });
    });
    const cutsSheet = window.XLSX.utils.aoa_to_sheet(cutRows);
    cutsSheet["!autofilter"] = { ref: cutsSheet["!ref"] };
    setSheetColumns(cutsSheet, [10, 28, 14, 18, 18, 16, 16, 20]);
    window.XLSX.utils.book_append_sheet(workbook, cutsSheet, "Cortes");

    const edgeRows = [[
      "Painel",
      "ID da peça",
      "Cor da fita",
      "Lado",
      "Medida da peça (mm)",
      "Acréscimo (mm)",
      "Comprimento cobrado (mm)",
      "Valor por metro (R$)",
      "Custo (R$)",
    ]];
    state.result.layouts.forEach((layout, panelIndex) => {
      layout.items.forEach((item) => {
        normalizeEdgeSides(item.edgeSides).forEach((sideKey) => {
          const side = EDGE_SIDES.find((candidate) => candidate.key === sideKey);
          const pieceLength = sideKey === "top" || sideKey === "bottom" ? Number(item.width) : Number(item.height);
          const chargedLength = pieceLength + DEFAULTS.edgeBandAllowance;
          edgeRows.push([
            panelIndex + 1,
            String(item.label || "Item").replace(/\s*\(r\)$/, ""),
            item.edgeBandColor || "Não informada",
            side.label,
            Math.round(pieceLength),
            DEFAULTS.edgeBandAllowance,
            Math.round(chargedLength),
            DEFAULTS.edgeBandRate,
            (chargedLength / 1000) * DEFAULTS.edgeBandRate,
          ]);
        });
      });
    });
    const edgeSheet = window.XLSX.utils.aoa_to_sheet(edgeRows);
    edgeSheet["!autofilter"] = { ref: edgeSheet["!ref"] };
    setSheetColumns(edgeSheet, [10, 28, 24, 16, 24, 18, 26, 22, 16]);
    window.XLSX.utils.book_append_sheet(workbook, edgeSheet, "Fitas de borda");

    const gcodeRows = [["Painel", "Cor", "Espessura (mm)", "Linha", "Comando"]];
    state.result.layouts.forEach((layout, panelIndex) => {
      generateGcodeForPanel(layout, panelIndex).split("\n").forEach((command, lineIndex) => {
        gcodeRows.push([panelIndex + 1, layout.color || "Sem cor", Number(layout.thickness || 0), lineIndex + 1, command]);
      });
    });
    const gcodeSheet = window.XLSX.utils.aoa_to_sheet(gcodeRows);
    gcodeSheet["!autofilter"] = { ref: gcodeSheet["!ref"] };
    setSheetColumns(gcodeSheet, [10, 26, 18, 10, 48]);
    window.XLSX.utils.book_append_sheet(workbook, gcodeSheet, "G-code");

    const output = window.XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      compression: true,
    });
    return {
      blob: new Blob([output], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      filename: "orcamento-" + order.orderCode + ".xlsx",
    };
  }

  async function sendEmailByForm(subject, body, attachments) {
    if (window.location.protocol === "file:") {
      throw new Error("FormSubmit exige pagina servida por servidor web.");
    }

    const formData = new FormData();
    formData.append("_subject", subject);
    formData.append("_captcha", "false");
    formData.append("_template", "table");
    formData.append("destinatario", DEFAULTS.emailTo);
    formData.append("mensagem", body);
    const files = Array.isArray(attachments) ? attachments : [attachments];
    files.filter(Boolean).forEach((attachment) => {
      formData.append("attachment", attachment.blob, attachment.filename);
    });

    const response = await fetch(DEFAULTS.emailEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false || data.success === "false") {
      throw new Error(data.message || "Não foi possível enviar a solicitação por e-mail.");
    }
    return data;
  }

  async function requestOrder() {
    if (!state.result || !state.result.layouts.length) {
      alert("Calcule o layout antes de solicitar o pedido.");
      return;
    }

    const name = (document.getElementById("lead-name")?.value || "").trim();
    const phone = (document.getElementById("lead-phone")?.value || "").trim();
    if (!name || !phone) {
      alert("Informe nome e telefone antes de solicitar o orcamento.");
      return;
    }

    if (!state.result || !state.result.layouts.length) {
      alert("Calcule o layout antes de solicitar o pedido.");
      return;
    }

    const orderCode = buildOrderCode();
    const payload = buildSharePayload();
    const encoded = base64UrlEncode(JSON.stringify(payload));
    const url = new URL(window.location.href);
    url.hash = "config=" + encoded;

    const gcodeBlocks = state.result.layouts.map((layout, idx) => {
      const header = "GCODE - Painel " + (idx + 1) + " - " + (layout.color || "Sem cor") + " - " + String(layout.thickness || "6") + " mm";
      return [header, generateGcodeForPanel(layout, idx)].join("\n");
    });
    const cutLabel = state.cutMode === "saw" ? "Seccionadora" : "Router";
    const estimatedValue = Number(state.result.totalCost || 0).toFixed(2);
    const panelsList = state.result.layouts.map((layout, idx) => {
      const panelTitle = "Painel " + (idx + 1) + " - " + (layout.color || "Sem cor") + " - " + String(layout.thickness || "6") + " mm";
      const size = Math.round(layout.width) + " x " + Math.round(layout.height) + " mm";
      const items = layout.items
        .map((item) => {
          const edgeInfo = normalizeEdgeSides(item.edgeSides).length
            ? "; fita " + (item.edgeBandColor || "não informada") + " em " + edgeSideNames(item.edgeSides, false) + " (" + formatDecimal(edgeBandLengthMm(item) / 1000) + " m com acréscimos)"
            : "; sem fita de borda";
          return "  - " + (item.label || "Item") + " (" + Math.round(item.width) + " x " + Math.round(item.height) + " mm; esp. " + String(item.thickness || "6") + " mm" + edgeInfo + ")";
        })
        .join("\n");
      return [panelTitle, "  Medidas: " + size, items].join("\n");
    }).join("\n\n");

    const emailBody = [
      "Solicitacao de orcamento - Vortex MDF",
      "Pedido: " + orderCode,
      "Nome: " + name,
      "Telefone: " + phone,
      "Link: " + url.toString(),
      "Corte: " + cutLabel,
      "Painéis necessários: " + state.result.totalPanels,
      (state.cutMode === "saw" ? "Operações únicas de corte: " : "Trajetórias (4 lados por peça): ") + state.result.totalCuts,
      "Peças posicionadas: " + state.result.raw.placedCount,
      "Peças não posicionadas: " + state.result.raw.unplacedCount,
      "Peças Branco TX: " + formatDecimal(state.result.whiteTxPieceAreaM2) + " m²; R$ " + formatDecimal(state.result.whiteTxPieceCostTotal) + " (6 mm: R$ 38,00/m²; 18 mm: R$ 58,00/m²)",
      state.result.materialConsultationRequired ? "Valor da chapa sob consulta: " + state.result.materialConsultationLabels.join(", ") : "Chapas diferentes de Branco TX: consultar valor",
      "Custo do corte: R$ " + formatDecimal(state.result.cutCostTotal) + (state.cutMode === "saw" ? " (" + state.result.totalCuts + " operações x R$ 3,50; inclui 4 limpezas por chapa)" : " (R$ " + formatDecimal(state.result.routerRatePerM2) + "/m²)"),
      "Fita de borda: " + state.result.edgeBandSideCount + " lados; " + formatDecimal(state.result.edgeBandLengthM) + " m com acréscimos; R$ " + formatDecimal(state.result.edgeBandCostTotal),
      (state.result.materialConsultationRequired ? "Subtotal estimado: R$ " : "Valor estimado: R$ ") + formatDecimal(estimatedValue),
      "Unidade de medida: milímetros (mm)",
      "Anexos: planilha Excel completa e CSV de produção no formato da OP de referência.",
      "",
      "----- PAINEIS -----",
      panelsList,
      "",
      "----- GCODE POR PAINEL -----",
      gcodeBlocks.join("\n\n"),
    ].join("\n");

    const subject = name + " - " + orderCode;

    const requestBtn = document.getElementById("request-order-btn");
    const confirmBtn = document.getElementById("order-confirm-send-btn");
    const statusEl = document.getElementById("order-confirm-status");
    requestBtn.disabled = true;
    if (confirmBtn) confirmBtn.disabled = true;
    if (statusEl) {
      statusEl.classList.remove("is-error", "is-success");
      statusEl.textContent = "Gerando a planilha e enviando o e-mail…";
    }
    try {
      const order = {
        orderCode: orderCode,
        name: name,
        phone: phone,
        shareUrl: url.toString(),
        items: readItemsFromForm(),
      };
      const workbookAttachment = buildQuoteWorkbook(order);
      const productionCsvAttachment = buildProductionCsv(order);
      await sendEmailByForm(subject, emailBody, [workbookAttachment, productionCsvAttachment]);
      if (statusEl) {
        statusEl.classList.add("is-success");
        statusEl.textContent = "Solicitação enviada com as planilhas Excel e CSV em anexo.";
      }
      setTimeout(closeOrderConfirmation, 1600);
    } catch (error) {
      if (statusEl) {
        statusEl.classList.add("is-error");
        statusEl.textContent = error.message || "Não foi possível enviar a solicitação.";
      }
    } finally {
      requestBtn.disabled = false;
      if (confirmBtn) confirmBtn.disabled = false;
    }
  }

  function closeOrderConfirmation() {
    const box = document.getElementById("order-confirm-box");
    const overlay = document.getElementById("order-confirm-overlay");
    const confirmBtn = document.getElementById("order-confirm-send-btn");
    if (confirmBtn?.disabled) return;
    if (box) box.hidden = true;
    if (overlay) overlay.hidden = true;
  }

  function openOrderConfirmation() {
    if (calcTimer) {
      clearTimeout(calcTimer);
      calcTimer = null;
      calculate();
    }
    if (!state.result || !state.result.layouts.length) {
      alert("Adicione ao menos uma placa válida antes de solicitar o orçamento.");
      return;
    }

    const name = (document.getElementById("lead-name")?.value || "").trim();
    const phone = (document.getElementById("lead-phone")?.value || "").trim();
    if (!name || !phone) {
      alert("Informe nome e telefone antes de solicitar o orçamento.");
      return;
    }
    const missingEdgeColor = readItemsFromForm().some((item) => item.edgeSides.length && !item.edgeBandColor);
    if (missingEdgeColor) {
      alert("Informe a cor da fita de borda nas peças que possuem lados selecionados.");
      return;
    }

    const shareUrl = updateUrlWithSharePayload();
    const box = document.getElementById("order-confirm-box");
    const overlay = document.getElementById("order-confirm-overlay");
    const recipient = document.getElementById("order-confirm-recipient");
    const summary = document.getElementById("order-confirm-summary");
    const link = document.getElementById("order-confirm-link");
    const status = document.getElementById("order-confirm-status");
    if (recipient) recipient.textContent = DEFAULTS.emailTo;
    if (summary) {
      summary.textContent =
        state.result.totalPanels +
        " painéis • " +
        state.result.totalCuts +
        (state.cutMode === "saw" ? " cortes únicos • " : " trajetórias • ") +
        formatDecimal(state.result.edgeBandLengthM) +
        " m de fita • R$ " +
        formatDecimal(state.result.totalCost) +
        (state.result.materialConsultationRequired ? " + chapa sob consulta" : "");
    }
    if (link) link.value = shareUrl;
    if (status) {
      status.textContent = "O e-mail incluirá todas as informações do orçamento e os arquivos Excel e CSV.";
      status.classList.remove("is-error", "is-success");
    }
    if (box) box.hidden = false;
    if (overlay) overlay.hidden = false;
    document.getElementById("order-confirm-send-btn")?.focus();
  }

  function base64UrlEncode(text) {
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function base64UrlDecode(text) {
    const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
    return decodeURIComponent(escape(atob(padded)));
  }

  function buildSharePayload() {
    const items = readItemsFromForm().map((item) => ({
      label: item.label,
      width: item.width,
      height: item.height,
      quantity: item.quantity,
      canRotate: item.canRotate,
      thickness: item.thickness,
      color: item.color,
      edgeBandColor: item.edgeBandColor,
      edgeSides: normalizeEdgeSides(item.edgeSides),
      brand: item.brand || state.selectedBrand,
    }));
    return {
      brand: state.selectedBrand,
      cutMode: state.cutMode,
      lead: {
        name: (document.getElementById("lead-name")?.value || "").trim(),
        phone: (document.getElementById("lead-phone")?.value || "").trim(),
      },
      items: items,
    };
  }

  function applySharePayload(payload) {
    if (!payload || !Array.isArray(payload.items)) return;
    state.selectedBrand = normalizeBrand(payload.brand || state.selectedBrand);
    if (brandSelectEl) brandSelectEl.value = state.selectedBrand;
    state.cutMode = payload.cutMode === "saw" ? "saw" : "router";
    const cutModeSelect = document.getElementById("cut-mode-select");
    if (cutModeSelect) cutModeSelect.value = state.cutMode;
    const leadName = document.getElementById("lead-name");
    const leadPhone = document.getElementById("lead-phone");
    if (leadName && payload.lead?.name) leadName.value = payload.lead.name;
    if (leadPhone && payload.lead?.phone) leadPhone.value = payload.lead.phone;
    clearRows();
    payload.items.forEach((item) => {
      addRow({
        label: item.label,
        width: item.width || 1000,
        height: item.height || 1000,
        quantity: item.quantity || 1,
        canRotate: item.canRotate !== false,
        thickness: item.thickness || 6,
        color: item.color || "Branco TX",
        edgeBandColor: item.edgeBandColor || "",
        edgeSides: normalizeEdgeSides(item.edgeSides),
      });
    });
  }

  function updateUrlWithSharePayload() {
    const payload = buildSharePayload();
    if (!payload.items.length) return "";
    const encoded = base64UrlEncode(JSON.stringify(payload));
    const url = new URL(window.location.href);
    url.hash = "config=" + encoded;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", url.toString());
    }
    return url.toString();
  }

  function generateShareLink() {
    const shareUrl = updateUrlWithSharePayload();
    if (!shareUrl) {
      alert("Adicione ao menos uma placa antes de gerar o link.");
      return;
    }
    const shareBox = document.getElementById("share-box");
    const shareOverlay = document.getElementById("share-overlay");
    const shareClose = document.getElementById("share-close-btn");
    const shareInput = document.getElementById("share-link-input");
    const copyBtn = document.getElementById("copy-link-btn");
    const nativeBtn = document.getElementById("share-native-btn");
    const hint = document.getElementById("share-hint");

    shareInput.value = shareUrl;
    shareBox.hidden = false;
    shareOverlay.hidden = false;

    const tryCopy = () => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(shareInput.value).then(() => {
        hint.textContent = "Link copiado para a area de transferencia.";
      }).catch(() => {});
    };

    tryCopy();

    copyBtn.onclick = () => {
      tryCopy();
    };

    if (navigator.share) {
      nativeBtn.hidden = false;
      nativeBtn.onclick = async () => {
        try {
          await navigator.share({
            title: "Vortex MDF — O corte exato do seu projeto.",
            text: "Confira esta configuração de corte da Vortex MDF.",
            url: shareInput.value,
          });
        } catch (err) {
          // ignore cancel
        }
      };
    } else {
      nativeBtn.hidden = true;
    }

    const closePopup = () => {
      shareBox.hidden = true;
      shareOverlay.hidden = true;
    };

    shareOverlay.onclick = closePopup;
    if (shareClose) {
      shareClose.onclick = closePopup;
    }
  }

  function buildPrintPages() {
    const printArea = document.getElementById("print-area");
    if (!printArea) return;
    printArea.innerHTML = "";

    state.result.layouts.forEach((layout, panelIndex) => {
      const page = document.createElement("div");
      page.className = "print-page";

      const title = document.createElement("div");
      title.className = "print-title";
      title.textContent =
        "Vortex MDF | Painel " +
        (panelIndex + 1) +
        " - " +
        (layout.color || "Sem cor") +
        " - " +
        String(layout.thickness || "6") +
        " mm" +
        " | " +
        Math.round(layout.width) +
        " x " +
        Math.round(layout.height) +
        " mm";
      page.appendChild(title);

      const content = document.createElement("div");
      content.className = "print-content";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "print-svg");
      svg.setAttribute("viewBox", `0 0 ${Math.round(layout.width)} ${Math.round(layout.height)}`);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bg.setAttribute("x", "0");
      bg.setAttribute("y", "0");
      bg.setAttribute("width", Math.round(layout.width));
      bg.setAttribute("height", Math.round(layout.height));
      bg.setAttribute("fill", "#fff");
      bg.setAttribute("stroke", "#000");
      bg.setAttribute("stroke-width", "2");
      svg.appendChild(bg);

      layout.items.forEach((item) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", Math.round(item.x));
        rect.setAttribute("y", Math.round(item.y));
        rect.setAttribute("width", Math.round(item.width));
        rect.setAttribute("height", Math.round(item.height));
        rect.setAttribute("fill", "#fff");
        rect.setAttribute("stroke", "#000");
        rect.setAttribute("stroke-width", "2");
        svg.appendChild(rect);

        const x = Math.round(item.x);
        const y = Math.round(item.y);
        const x2 = Math.round(item.x + item.width);
        const y2 = Math.round(item.y + item.height);
        const sideCoordinates = {
          top: [x, y, x2, y],
          right: [x2, y, x2, y2],
          bottom: [x2, y2, x, y2],
          left: [x, y2, x, y],
        };
        normalizeEdgeSides(item.edgeSides).forEach((side) => {
          const lineCoords = sideCoordinates[side];
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", lineCoords[0]);
          line.setAttribute("y1", lineCoords[1]);
          line.setAttribute("x2", lineCoords[2]);
          line.setAttribute("y2", lineCoords[3]);
          line.setAttribute("stroke", edgeStrokeColor(item.edgeBandColor));
          line.setAttribute("stroke-width", "12");
          svg.appendChild(line);
        });

        const cx = Math.round(item.x + item.width / 2);
        const cy = Math.round(item.y + item.height / 2);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", cx);
        text.setAttribute("y", cy - 22);
        text.setAttribute("font-size", "36");
        text.setAttribute("font-weight", "700");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.textContent = item.label || "Item";
        svg.appendChild(text);

        const dims = document.createElementNS("http://www.w3.org/2000/svg", "text");
        dims.setAttribute("x", cx);
        dims.setAttribute("y", cy + 22);
        dims.setAttribute("font-size", "28");
        dims.setAttribute("text-anchor", "middle");
        dims.setAttribute("dominant-baseline", "middle");
        dims.textContent = Math.round(item.width) + " x " + Math.round(item.height) + " mm";
        svg.appendChild(dims);
      });

      content.appendChild(svg);

      const legend = document.createElement("div");
      legend.className = "print-legend";
      layout.items.forEach((item) => {
        const label = item.label || "Item";
        const row = document.createElement("div");
        row.className = "legend-item";
        const edgeInfo = normalizeEdgeSides(item.edgeSides).length
          ? " | Fita " + (item.edgeBandColor || "não informada") + ": " + edgeSideNames(item.edgeSides, true)
          : " | Sem fita";
        row.textContent = label + " - " + Math.round(item.width) + " x " + Math.round(item.height) + " mm" + edgeInfo;
        legend.appendChild(row);
      });
      content.appendChild(legend);
      page.appendChild(content);

      printArea.appendChild(page);
    });
  }

  function printPanels() {
    if (!state.result || !state.result.layouts.length) {
      alert("Calcule o layout antes de imprimir.");
      return;
    }
    buildPrintPages();
    window.print();
  }

  function loadFromHash() {
    const hash = window.location.hash || "";
    const match = hash.match(/config=([^&]+)/);
    if (!match) return;
    try {
      const decoded = base64UrlDecode(match[1]);
      const payload = JSON.parse(decoded);
      applySharePayload(payload);
    } catch (err) {
      console.warn("Falha ao carregar configuracao do link", err);
    }
  }

  function calculate() {
    const settings = {
      panelWidth: DEFAULTS.panelWidth,
      panelHeight: DEFAULTS.panelHeight,
      cutWidth: state.cutMode === "router" ? DEFAULTS.cutWidthRouter : DEFAULTS.cutWidthSaw,
      panelCost: DEFAULTS.panelCost,
      cutCostSaw: DEFAULTS.cutCostSaw,
      edgeBandRate: DEFAULTS.edgeBandRate,
      edgeBandAllowance: DEFAULTS.edgeBandAllowance,
      whiteTxPieceRate: DEFAULTS.whiteTxPieceRate,
      routerRate: DEFAULTS.routerRate,
      routerMax: DEFAULTS.routerMax,
      cutMode: state.cutMode,
    };
    if (settings.panelWidth <= 0 || settings.panelHeight <= 0) {
      alert("Painel largura/altura devem ser maiores que zero.");
      return;
    }

    const items = readItemsFromForm();
    if (!items.length) {
      alert("Adicione ao menos uma placa valida.");
      return;
    }

    state.result = estimateQuote(items, settings);
    renderSummary();
    renderLayouts();
    applyOverlayState();
    updateUrlWithSharePayload();
  }

  let calcTimer = null;
  function scheduleCalculate() {
    if (calcTimer) clearTimeout(calcTimer);
    calcTimer = setTimeout(() => {
      calcTimer = null;
      calculate();
    }, 250);
  }

  function resetProject() {
    state.result = null;
    state.activePanelIndex = 0;
    clearRows();
    addRow({ width: 1000, height: 1000, quantity: 1, canRotate: true, thickness: 6, color: "Branco TX" });
    calculate();
  }

  document.getElementById("add-row-btn").addEventListener("click", function () {
    addRow({ width: 1000, height: 1000, quantity: 1, canRotate: true, thickness: 6, color: "Branco TX" });
    scheduleCalculate();
  });

  itemsEl.addEventListener("click", function (event) {
    const button = event.target.closest(".remove-row");
    if (!button) return;
    const row = button.closest(".item-row");
    if (!row) return;
    if (itemsEl.children.length > 1) {
      row.remove();
      updateLabels();
      scheduleCalculate();
    } else {
      row.querySelectorAll("input").forEach((input) => {
        if (input.type === "checkbox") {
          input.checked = input.classList.contains("rotate-toggle");
        } else {
          input.value = "";
        }
      });
      updateEdgeSideSummary(row);
      scheduleCalculate();
    }
  });

  function handleRowChange(event) {
    const edgeSide = event.target.closest('input[data-role="edge-side"]');
    if (edgeSide) {
      const row = edgeSide.closest(".item-row");
      if (row) updateEdgeSideSummary(row);
      scheduleCalculate();
      return;
    }
    const other = event.target.closest('select[name="item_thickness"], .rotate-toggle');
    if (other) {
      scheduleCalculate();
    }
  }

  itemsEl.addEventListener("change", handleRowChange);

  itemsEl.addEventListener("input", function (event) {
    const input = event.target.closest('input[name="item_label"], input[name="item_width"], input[name="item_height"], input[name="item_qty"], input[name="item_color"], input[name="edge_band_color"]');
    if (!input) return;

    if (input.name === "item_width" || input.name === "item_height") {
      const digits = String(input.value || "").replace(/\D/g, "").slice(0, 4);
      input.value = digits;
    }

    scheduleCalculate();
  });

  panelTabsEl.addEventListener("click", function (event) {
    const tab = event.target.closest(".panel-tab");
    if (!tab) return;
    setActivePanel(tab.dataset.panelIndex);
  });

  panelTabsEl.addEventListener("keydown", function (event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = Array.from(panelTabsEl.querySelectorAll(".panel-tab"));
    if (!tabs.length) return;
    const currentIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    event.preventDefault();
    setActivePanel(tabs[nextIndex].dataset.panelIndex);
    tabs[nextIndex].focus();
  });

  panelListEl.addEventListener("click", function (event) {
    const row = event.target.closest(".panel-list-row");
    if (!row) return;
    setActivePanel(row.dataset.panelIndex);
  });

  toggleLabelsEl.addEventListener("change", applyOverlayState);
  toggleDimensionsEl.addEventListener("change", applyOverlayState);
  const calcButton = document.getElementById("calculate-btn");
  if (calcButton) {
    calcButton.addEventListener("click", calculate);
  }
  document.getElementById("request-order-btn").addEventListener("click", function () {
    openOrderConfirmation();
  });
  document.getElementById("order-confirm-send-btn")?.addEventListener("click", requestOrder);
  document.getElementById("order-confirm-cancel-btn")?.addEventListener("click", closeOrderConfirmation);
  document.getElementById("order-confirm-close-btn")?.addEventListener("click", closeOrderConfirmation);
  document.getElementById("order-confirm-overlay")?.addEventListener("click", closeOrderConfirmation);
  document.getElementById("share-link-btn").addEventListener("click", generateShareLink);
  document.getElementById("print-panels-btn").addEventListener("click", printPanels);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeOrderConfirmation();
  });

  if (brandSelectEl) {
    brandSelectEl.addEventListener("change", function () {
      state.selectedBrand = normalizeBrand(brandSelectEl.value);
      populateColorNameOptions();
      scheduleCalculate();
    });
  }

  const cutModeSelectEl = document.getElementById("cut-mode-select");
  if (cutModeSelectEl) {
    cutModeSelectEl.addEventListener("change", function () {
      state.cutMode = cutModeSelectEl.value === "saw" ? "saw" : "router";
      scheduleCalculate();
    });
  }

  async function init() {
    populateBrandSelect();
    try {
      await loadCatalogFromSheet();
    } catch (error) {
      console.warn("Usando catalogo local (fallback).", error);
    }
    loadFromHash();
    populateColorNameOptions();
    if (!itemsEl.children.length) {
      resetProject();
    } else {
      calculate();
    }
  }

  init();
})();
