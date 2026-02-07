(function () {
  "use strict";

  const DEFAULTS = {
    panelWidth: 1830,
    panelHeight: 2700,
    cutWidthSaw: 6,
    cutWidthRouter: 14,
    panelCost: 350,
    cutCostSaw: 3.5,
    routerRate: {
      "6": 16,
      "15": 30,
      "18": 30,
    },
    routerMax: {
      "6": 78,
      "15": 220,
      "18": 220,
    },
    whatsappNumber: "554197190158",
    emailEndpoint: "https://formsubmit.co/ajax/?token=6db5f26a7b24c72bbc9ed8175c334d8c",
  };

  const state = {
    result: null,
    cutMode: "router",
  };

  const colorPalette = [
    { name: "Azul Sereno", url: "https://arauco.com.br/wp-content/uploads/2024/03/AZUL-SERENO-185x275-1.jpg" },
    { name: "Beige", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-beige-arauco.webp" },
    { name: "Beton", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-beton-arauco.webp" },
    { name: "Branco TX", url: "https://arauco.com.br/wp-content/uploads/2024/03/Branco-Supremo-_Chess-185x275-1-scaled.jpg" },
    { name: "Cacao", url: "https://arauco.com.br/wp-content/uploads/2024/03/Cacao-Chess-185x275-1-scaled.jpg" },
    { name: "Cafelatte", url: "https://arauco.com.br/wp-content/uploads/2024/03/produto-mdf-cafelatte-arauco.webp" },
    { name: "Canela", url: "https://arauco.com.br/wp-content/uploads/2024/03/Canela-185x275-1-scaled.jpg" },
    { name: "Cinza Cristal", url: "https://arauco.com.br/wp-content/uploads/2024/03/Cinza-Cristal-_Chess-185x275-1-scaled.jpg" },
    { name: "Cinza Puro", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-cinza-puro.webp" },
    { name: "Connect", url: "https://arauco.com.br/wp-content/uploads/2024/03/Connect-185x275-1-scaled.jpg" },
    { name: "Cristalina", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-cristalina-arauco.webp" },
    { name: "Damasco", url: "https://arauco.com.br/wp-content/uploads/2024/03/Dasmasco-185-x-275-scaled.jpg" },
    { name: "Ebano", url: "https://arauco.com.br/wp-content/uploads/2024/03/Ebano-Chess-185x275-1-scaled.jpg" },
    { name: "Frape", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-frape-arauco.webp" },
    { name: "Grafito", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-grafito-arauco.webp" },
    { name: "Gris", url: "https://arauco.com.br/wp-content/uploads/2024/03/mdf-griss.webp" },
    { name: "Jalapao", url: "https://arauco.com.br/wp-content/uploads/2024/03/Jalapao-185-x-275-3.jpg" },
    { name: "Kashmir", url: "https://arauco.com.br/wp-content/uploads/2024/03/Kashmir-185x275-1-scaled.jpg" },
    { name: "Lavanda", url: "https://arauco.com.br/wp-content/uploads/2024/03/WhatsApp-Image-2024-03-08-at-23.11.17.jpeg" },
    { name: "Lord", url: "https://arauco.com.br/wp-content/uploads/2024/03/Lord-185x275-1-scaled.jpg" },
    { name: "Maragogi", url: "https://arauco.com.br/wp-content/uploads/2024/03/Maragogi-185-x-275-3.jpg" },
    { name: "Oceano", url: "https://arauco.com.br/wp-content/uploads/2024/01/oceano.webp" },
    { name: "Sal Rosa", url: "https://arauco.com.br/wp-content/uploads/2024/03/Sal-Rosa-185x275-1-scaled.jpg" },
    { name: "Salvia", url: "https://arauco.com.br/wp-content/uploads/2024/03/SALVIA-185x275-1-scaled.jpg" },
    { name: "Verde Jade", url: "https://arauco.com.br/wp-content/uploads/2024/03/Verde-Jade-183x275_menor-scaled.jpg" },
  ];

  const itemsEl = document.getElementById("items");
  const layoutGridEl = document.getElementById("layout-grid");
  const layoutEmptyEl = document.getElementById("layout-empty");
  const panelListEl = document.getElementById("panel-list");

  const sumPanelsEl = document.getElementById("sum-panels");
  const sumCutsEl = document.getElementById("sum-cuts");
  const sumCostEl = document.getElementById("sum-cost");
  const sumMethodEl = document.getElementById("sum-method");

  const toggleLabelsEl = document.getElementById("toggle-labels");
  const toggleDimensionsEl = document.getElementById("toggle-dimensions");

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

  let colorGroupId = 0;

  function buildColorPalette(groupName, defaultColor) {
    return (
      '<div class="color-picker" data-role="color-picker">' +
      '<button type="button" class="color-toggle" aria-label="Selecionar cor">' +
      '<span class="swatch swatch-selected" data-role="color-preview"></span>' +
      "</button>" +
      '<div class="color-palette" role="radiogroup" aria-label="Cor">' +
      colorPalette
        .map((color) => {
          const checked = color.name === defaultColor ? " checked" : "";
          return (
            '<label class="color-swatch" title="' +
            color.name +
            '">' +
            '<input type="radio" data-role="item-color" name="' +
            groupName +
            '" value="' +
            color.name +
            '"' +
            checked +
            ">" +
            '<span class="swatch" style="background-image:url(' +
            color.url +
            ')"></span>' +
            "</label>"
          );
        })
        .join("") +
      "</div>" +
      "</div>"
    );
  }

  function rowTemplate() {
    const row = document.createElement("div");
    row.className = "item-row";
    colorGroupId += 1;
    const groupName = "item_color_" + colorGroupId;
    row.innerHTML = [
      '<span class="item-label"></span>',
      '<input type="number" name="item_width" min="1" max="9999" inputmode="numeric" required>',
      '<input type="number" name="item_height" min="1" max="9999" inputmode="numeric" required>',
      '<input type="number" name="item_qty" min="1" value="1" required>',
      '<select name="item_thickness" class="item-select"><option value="6">6mm</option><option value="15">15mm</option><option value="18">18mm</option></select>',
      buildColorPalette(groupName, "Branco TX"),
      '<label class="checkbox compact"><input type="checkbox" class="rotate-toggle" checked></label>',
      '<button class="btn btn-ghost remove-row compact" type="button">-</button>',
    ].join("");
    return row;
  }

  function updateLabels() {
    Array.from(itemsEl.children).forEach((row, idx) => {
      const label = row.querySelector(".item-label");
      if (label) {
        label.textContent = labelForIndex(idx);
      }
    });
  }

  function addRow(values) {
    const row = rowTemplate();
    if (values) {
      row.querySelector('input[name="item_width"]').value = values.width;
      row.querySelector('input[name="item_height"]').value = values.height;
      row.querySelector('input[name="item_qty"]').value = values.quantity;
      row.querySelector(".rotate-toggle").checked = Boolean(values.canRotate);
      if (values.thickness) {
        row.querySelector('select[name="item_thickness"]').value = String(values.thickness);
      }
      if (values.color) {
        const radio = row.querySelector(`input[data-role="item-color"][value="${values.color}"]`);
        if (radio) {
          radio.checked = true;
        }
      }
    }
    itemsEl.appendChild(row);
    syncColorPreview(row);
    updateLabels();
  }

  function clearRows() {
    itemsEl.innerHTML = "";
  }

  function readItemsFromForm() {
    const rows = Array.from(itemsEl.querySelectorAll(".item-row"));
    const items = [];
    rows.forEach((row, idx) => {
      const width = Number(row.querySelector('input[name="item_width"]').value || 0);
      const height = Number(row.querySelector('input[name="item_height"]').value || 0);
      const quantity = Number(row.querySelector('input[name="item_qty"]').value || 0);
      const canRotate = row.querySelector(".rotate-toggle").checked;
      const thickness = row.querySelector('select[name="item_thickness"]').value;
      const colorInput = row.querySelector('input[data-role="item-color"]:checked');
      const color = colorInput ? colorInput.value : "White";
      if (width > 0 && height > 0 && quantity > 0) {
        items.push({
          label: labelForIndex(idx),
          width: width,
          height: height,
          quantity: quantity,
          canRotate: canRotate,
          thickness: thickness,
          color: color,
        });
      }
    });
    return items;
  }

  function findPaletteByName(name) {
    return colorPalette.find((color) => color.name === name) || colorPalette[0];
  }

  function syncColorPreview(row) {
    const colorInput = row.querySelector('input[data-role="item-color"]:checked');
    const preview = row.querySelector('[data-role="color-preview"]');
    if (!preview) return;
    const color = findPaletteByName(colorInput ? colorInput.value : "Branco TX");
    preview.style.backgroundImage = "url(" + color.url + ")";
  }

  function expandItems(items) {
    const expanded = [];
    items.forEach((item) => {
      for (let i = 1; i <= item.quantity; i += 1) {
        expanded.push({
          width: item.width,
          height: item.height,
          canRotate: item.canRotate,
          label: item.label + i,
          thickness: item.thickness,
          color: item.color,
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

  function estimateQuote(items, settings) {
    const expanded = expandItems(items);
    const grouped = expanded.reduce((acc, item) => {
      const key = item.color || "Branco TX";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const layouts = [];
    let placedCount = 0;
    let unplacedTotal = 0;

    Object.keys(grouped).forEach((colorName) => {
      const packed = packItemsMaxRects(
        grouped[colorName],
        settings.panelWidth,
        settings.panelHeight,
        settings.cutWidth
      );
      packed.layouts.forEach((layout) => {
        layouts.push({
          width: layout.width,
          height: layout.height,
          items: layout.items,
          color: colorName,
          colorUrl: (findPaletteByName(colorName) || colorPalette[0]).url,
        });
      });
      placedCount += packed.layouts.reduce((acc, l) => acc + l.items.length, 0);
      unplacedTotal += packed.unplaced.length;
    });

    const totalPanels = Math.max(1, layouts.length);
    let totalCuts = Math.max(1, placedCount * 2);
    let cutCostTotal = 0;

    if (settings.cutMode === "router") {
      const extraCuts = Math.max(0, placedCount - 1);
      totalCuts = Math.max(4, placedCount * 2 + extraCuts);
      cutCostTotal = 0;
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
      const extraCuts = Math.max(0, placedCount - 1);
      totalCuts = Math.max(4, placedCount * 2 + extraCuts);
      cutCostTotal = totalCuts * settings.cutCostSaw;
    }

    let panelCostTotal = 0;
    layouts.forEach((layout) => {
      if (String(layout.color || "").toLowerCase() === "branco tx") {
        panelCostTotal += 260;
      } else {
        panelCostTotal += 400;
      }
    });
    const totalCost = panelCostTotal + cutCostTotal;
    return {
      totalPanels: totalPanels,
      totalCuts: totalCuts,
      totalCost: totalCost,
      method: "custom-maxrects",
      layouts: layouts,
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
      .replace(/>/g, "&gt;");
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

  function renderLayouts() {
    const result = state.result;
    if (!result || !result.layouts.length) {
      layoutGridEl.innerHTML = "";
      layoutEmptyEl.style.display = "block";
      panelListEl.innerHTML = '<div class="panel-list-title">Paineis</div><div class="opcut-empty small">Nenhum painel calculado.</div>';
      return;
    }

    layoutEmptyEl.style.display = "none";
    layoutGridEl.innerHTML = result.layouts
      .map((layout, panelIndex) => {
        const patternId = "panelPattern" + panelIndex;
        const itemsSvg = layout.items
          .map((item) => {
            const lf = labelFontSize(item);
            const df = dimFontSize(item);
            const cx = Math.round(item.x + item.width / 2);
            const cy = Math.round(item.y + item.height / 2);
            const tx = Math.round(item.x + df);
            return [
              `<rect class="layout-item" x="${Math.round(item.x)}" y="${Math.round(item.y)}" width="${Math.round(item.width)}" height="${Math.round(item.height)}"></rect>`,
              `<text class="layout-label-text" x="${cx}" y="${cy}" style="font-size:${lf}px">${esc(item.label || "Item")}</text>`,
              `<text class="layout-dim-text" x="${cx}" y="${Math.round(item.y + df)}" style="font-size:${df}px">${Math.round(item.width)}</text>`,
              `<text class="layout-dim-text" x="${tx}" y="${cy}" transform="rotate(-90 ${tx} ${cy})" style="font-size:${df}px">${Math.round(item.height)}</text>`,
            ].join("");
          })
          .join("");

        return [
          `<div class="layout-card" data-panel-index="${panelIndex}">`,
          `<div class="layout-title">Painel ${panelIndex + 1} - ${esc(layout.color || "Branco TX")}</div>`,
          `<div class="layout-meta">Medidas internas: ${Math.round(layout.width)} x ${Math.round(layout.height)} mm</div>`,
          `<svg class="layout-svg" viewBox="0 0 ${Math.round(layout.width)} ${Math.round(layout.height)}" preserveAspectRatio="xMidYMid meet">`,
          `<defs>`,
          `<pattern id="${patternId}" patternUnits="userSpaceOnUse" width="180" height="180">`,
          `<image href="${layout.colorUrl || ""}" x="0" y="0" width="180" height="180" preserveAspectRatio="xMidYMid slice"></image>`,
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
      '<div class="panel-list-title">Paineis</div>',
      result.layouts
        .map((layout, idx) => {
          const rows = layout.items
            .map((item) => `<div class="panel-piece-row"><span>${esc(item.label)}</span><span>${Math.round(item.width)} x ${Math.round(item.height)}</span></div>`)
            .join("");
          return [
            '<div class="panel-list-group">',
            `<button class="panel-list-row" type="button" data-panel-index="${idx}">`,
            `<span class="panel-list-label">Painel ${idx + 1} - ${esc(layout.color || "Branco TX")}</span>`,
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
      sumCostEl.textContent = "0.00";
      sumMethodEl.textContent = "custom-maxrects";
      return;
    }
    sumPanelsEl.textContent = String(result.totalPanels);
    sumCutsEl.textContent = String(result.totalCuts);
    sumCostEl.textContent = Number(result.totalCost).toFixed(2);
    sumMethodEl.textContent = result.method;
  }

  function setActivePanel(index) {
    const cards = layoutGridEl.querySelectorAll(".layout-card");
    const rows = panelListEl.querySelectorAll(".panel-list-row");
    cards.forEach((card) => {
      const active = card.dataset.panelIndex === String(index);
      card.classList.toggle("is-active", active);
      card.classList.toggle("is-muted", !active);
    });
    rows.forEach((row) => {
      row.classList.toggle("is-active", row.dataset.panelIndex === String(index));
    });
  }

  function clearActivePanel() {
    const cards = layoutGridEl.querySelectorAll(".layout-card");
    const rows = panelListEl.querySelectorAll(".panel-list-row");
    cards.forEach((card) => {
      card.classList.remove("is-active");
      card.classList.remove("is-muted");
    });
    rows.forEach((row) => {
      row.classList.remove("is-active");
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

  function mmToM(value) {
    return (Number(value) / 1000).toFixed(3).replace(".", ",");
  }

  function buildOrderRows(layouts) {
    const rows = [];
    let idx = 1;
    layouts.forEach((layout, panelIndex) => {
      layout.items.forEach((item) => {
        const code = "MDF" + String(idx).padStart(2, "0") + "WPS";
        const rotated = String(item.label || "").includes("(r)") ? "1" : "0";
        rows.push([
          code,
          "Peca " + (item.label || idx),
          mmToM(item.width),
          mmToM(item.height),
          rotated,
          "Cor: " + (item.color || "Branca"),
          String(item.thickness || "6"),
          "P" + String(panelIndex + 1),
        ]);
        idx += 1;
      });
    });
    return rows;
  }

  function generateGcodeForPanel(layout, panelIndex) {
    const lines = [];
    lines.push("G21 ; mm");
    lines.push("G90 ; abs");
    lines.push("G0 Z5");
    lines.push("M3 S12000");
    lines.push("(Panel " + (panelIndex + 1) + " - " + (layout.color || "Sem cor") + ")");
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

  async function sendEmailByForm(subject, body) {
    if (window.location.protocol === "file:") {
      throw new Error("FormSubmit exige pagina servida por servidor web.");
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://formsubmit.co/ajax?token=6db5f26a7b24c72bbc9ed8175c334d8c";
    form.target = "_blank";

    const fields = {
      _subject: subject,
      _captcha: "false",
      _template: "table",
      mensagem: body,
    };

    Object.keys(fields).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
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
      const header = "GCODE - Painel " + (idx + 1) + " - " + (layout.color || "Sem cor");
      return [header, generateGcodeForPanel(layout, idx)].join("\n");
    });
    const cutLabel = state.cutMode === "router" ? "Router" : "Serra";
    const estimatedValue = Number(state.result.totalCost || 0).toFixed(2);
    const panelsList = state.result.layouts.map((layout, idx) => {
      const panelTitle = "Painel " + (idx + 1) + " - " + (layout.color || "Sem cor");
      const size = Math.round(layout.width) + " x " + Math.round(layout.height) + " mm";
      const items = layout.items
        .map((item) => "  - " + (item.label || "Item") + " (" + Math.round(item.width) + " x " + Math.round(item.height) + ")")
        .join("\n");
      return [panelTitle, "  Medidas: " + size, items].join("\n");
    }).join("\n\n");

    const emailBody = [
      "Solicitacao de orcamento",
      "Pedido: " + orderCode,
      "Nome: " + name,
      "Telefone: " + phone,
      "Link: " + url.toString(),
      "Corte: " + cutLabel,
      "Valor estimado: R$ " + estimatedValue,
      "",
      "----- PAINEIS -----",
      panelsList,
      "",
      "----- GCODE POR PAINEL -----",
      gcodeBlocks.join("\n\n"),
    ].join("\n");

    const subject = name + " - " + orderCode;

    const requestBtn = document.getElementById("request-order-btn");
    requestBtn.disabled = true;
    try {
      await sendEmailByForm(subject, emailBody);
      alert("Pedido enviado por formulario.");
    } catch (error) {
      const mailtoUrl =
        "mailto:g2mplanejados@gmail.com" +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(emailBody);
      if (String(error.message || "").includes("FormSubmit exige")) {
        window.location.href = mailtoUrl;
        alert("Abrindo email. Para o FormSubmit funcionar, rode em servidor (GitHub Pages).");
      } else {
        alert(error.message || "Nao foi possivel enviar o formulario.");
      }
    } finally {
      requestBtn.disabled = false;
    }
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
      width: item.width,
      height: item.height,
      quantity: item.quantity,
      canRotate: item.canRotate,
      thickness: item.thickness,
      color: item.color,
    }));
    return { items: items };
  }

  function applySharePayload(payload) {
    if (!payload || !Array.isArray(payload.items)) return;
    clearRows();
    payload.items.forEach((item) => {
      addRow({
        width: item.width || 1000,
        height: item.height || 1000,
        quantity: item.quantity || 1,
        canRotate: item.canRotate !== false,
        thickness: item.thickness || 6,
        color: item.color || "Branco TX",
      });
    });
  }

  function generateShareLink() {
    const payload = buildSharePayload();
    if (!payload.items.length) {
      alert("Adicione ao menos uma placa antes de gerar o link.");
      return;
    }
    const encoded = base64UrlEncode(JSON.stringify(payload));
    const url = new URL(window.location.href);
    url.hash = "config=" + encoded;
    const shareBox = document.getElementById("share-box");
    const shareOverlay = document.getElementById("share-overlay");
    const shareClose = document.getElementById("share-close-btn");
    const shareInput = document.getElementById("share-link-input");
    const copyBtn = document.getElementById("copy-link-btn");
    const nativeBtn = document.getElementById("share-native-btn");
    const hint = document.getElementById("share-hint");

    shareInput.value = url.toString();
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
            title: "Configuracao de placas",
            text: "Confira a configuracao das placas.",
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
        "Painel " +
        (panelIndex + 1) +
        " - " +
        (layout.color || "Sem cor") +
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

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", Math.round(item.x + item.width / 2));
        text.setAttribute("y", Math.round(item.y + item.height / 2));
        text.setAttribute("font-size", "40");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.textContent = item.label || "Item";
        svg.appendChild(text);
      });

      content.appendChild(svg);

      const legend = document.createElement("div");
      legend.className = "print-legend";
      layout.items.forEach((item) => {
        const label = item.label || "Item";
        const row = document.createElement("div");
        row.className = "legend-item";
        row.textContent = label + " - " + Math.round(item.width) + " x " + Math.round(item.height);
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
    clearRows();
    addRow({ width: 1000, height: 1000, quantity: 1, canRotate: true, thickness: 6, color: "Branco TX" });
    renderSummary();
    renderLayouts();
    applyOverlayState();
  }

  document.getElementById("add-row-btn").addEventListener("click", function () {
    addRow({ width: 1000, height: 1000, quantity: 1, canRotate: true, thickness: 6, color: "Branco TX" });
    scheduleCalculate();
  });

  const cutRouterBtn = document.getElementById("cut-router-btn");
  if (cutRouterBtn) {
    cutRouterBtn.addEventListener("click", function () {
      state.cutMode = "router";
      cutRouterBtn.classList.add("is-active");
      scheduleCalculate();
    });
  }

  itemsEl.addEventListener("click", function (event) {
    const toggle = event.target.closest(".color-toggle");
    if (toggle) {
      const picker = toggle.closest('[data-role="color-picker"]');
      if (picker) {
        const isOpen = picker.classList.toggle("is-open");
        if (isOpen) {
          document.querySelectorAll('[data-role="color-picker"].is-open').forEach((openPicker) => {
            if (openPicker !== picker) openPicker.classList.remove("is-open");
          });
        }
      }
      return;
    }

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
          input.checked = true;
        } else {
          input.value = "";
        }
      });
      scheduleCalculate();
    }
  });

  itemsEl.addEventListener("change", function (event) {
    const input = event.target.closest('input[data-role="item-color"]');
    if (input) {
      const row = input.closest(".item-row");
      if (!row) return;
      syncColorPreview(row);
      const picker = row.querySelector('[data-role="color-picker"]');
      if (picker) picker.classList.remove("is-open");
      scheduleCalculate();
      return;
    }
    const other = event.target.closest('select[name="item_thickness"], .rotate-toggle');
    if (other) {
      scheduleCalculate();
    }
  });

  itemsEl.addEventListener("input", function (event) {
    const input = event.target.closest('input[name="item_width"], input[name="item_height"], input[name="item_qty"]');
    if (!input) return;

    if (input.name === "item_width" || input.name === "item_height") {
      const digits = String(input.value || "").replace(/\D/g, "").slice(0, 4);
      input.value = digits;
    }

    scheduleCalculate();
  });

  document.addEventListener("click", function (event) {
    if (event.target.closest('[data-role="color-picker"]')) return;
    document.querySelectorAll('[data-role="color-picker"].is-open').forEach((picker) => {
      picker.classList.remove("is-open");
    });
  });

  panelListEl.addEventListener("click", function (event) {
    const row = event.target.closest(".panel-list-row");
    if (!row) return;
    if (row.classList.contains("is-active")) {
      clearActivePanel();
      return;
    }
    setActivePanel(row.dataset.panelIndex);
  });

  toggleLabelsEl.addEventListener("change", applyOverlayState);
  toggleDimensionsEl.addEventListener("change", applyOverlayState);
  const calcButton = document.getElementById("calculate-btn");
  if (calcButton) {
    calcButton.addEventListener("click", calculate);
  }
  document.getElementById("request-order-btn").addEventListener("click", function () {
    requestOrder();
  });
  document.getElementById("share-link-btn").addEventListener("click", generateShareLink);
  document.getElementById("print-panels-btn").addEventListener("click", printPanels);

  loadFromHash();
  if (!itemsEl.children.length) {
    resetProject();
  } else {
    calculate();
  }
})();
