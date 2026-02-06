(function () {
  "use strict";

  const DEFAULTS = {
    panelWidth: 2750,
    panelHeight: 1850,
    cutWidth: 3,
    panelCost: 350,
    cutCost: 2,
    whatsappNumber: "5513982327841",
    emailTo: "eriksegecs@yahoo.com.br",
    emailEndpoint: "https://formsubmit.co/ajax/eriksegecs@yahoo.com.br",
  };

  const state = {
    result: null,
  };

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

  function rowTemplate() {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = [
      '<span class="item-label"></span>',
      '<input type="number" name="item_width" min="1" required>',
      '<input type="number" name="item_height" min="1" required>',
      '<input type="number" name="item_qty" min="1" value="1" required>',
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
    }
    itemsEl.appendChild(row);
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
      if (width > 0 && height > 0 && quantity > 0) {
        items.push({
          label: labelForIndex(idx),
          width: width,
          height: height,
          quantity: quantity,
          canRotate: canRotate,
        });
      }
    });
    return items;
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
    const packed = packItemsMaxRects(
      expanded,
      settings.panelWidth,
      settings.panelHeight,
      settings.cutWidth
    );
    const layouts = packed.layouts;
    const placedCount = layouts.reduce((acc, l) => acc + l.items.length, 0);
    const totalPanels = Math.max(1, layouts.length);
    const totalCuts = Math.max(1, placedCount * 2);
    const totalCost = totalPanels * settings.panelCost + totalCuts * settings.cutCost;
    return {
      totalPanels: totalPanels,
      totalCuts: totalCuts,
      totalCost: totalCost,
      method: "custom-maxrects",
      layouts: layouts,
      raw: {
        requestedCount: expanded.length,
        placedCount: placedCount,
        unplacedCount: packed.unplaced.length,
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
    const val = Math.round(minSide * 0.17);
    return Math.max(70, Math.min(180, val));
  }

  function labelFontSize(item) {
    const minSide = Math.min(item.width, item.height);
    const val = Math.round(minSide * 0.26);
    return Math.max(90, Math.min(260, val));
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
          `<div class="layout-title">Placa ${panelIndex + 1}</div>`,
          `<div class="layout-meta">Medidas internas: ${Math.round(layout.width)} x ${Math.round(layout.height)} mm</div>`,
          `<svg class="layout-svg" viewBox="0 0 ${Math.round(layout.width)} ${Math.round(layout.height)}" preserveAspectRatio="xMidYMid meet">`,
          `<rect class="layout-bg" x="0" y="0" width="${Math.round(layout.width)}" height="${Math.round(layout.height)}"></rect>`,
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
            `<span class="panel-list-label">Placa ${idx + 1}</span>`,
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
          "Material gerado pela simulacao",
          "18",
          "P" + String(panelIndex + 1),
        ]);
        idx += 1;
      });
    });
    return rows;
  }

  async function sendEmailByForm(orderCode, body) {
    const payload = {
      _subject: "Pedido " + orderCode,
      _captcha: "false",
      _template: "table",
      pedido: orderCode,
      mensagem: body,
    };

    const response = await fetch(DEFAULTS.emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Falha ao enviar formulario de e-mail.");
    }
  }

  async function requestOrder() {
    if (!state.result || !state.result.layouts.length) {
      alert("Calcule o layout antes de solicitar o pedido.");
      return;
    }

    const orderCode = buildOrderCode();
    const rows = buildOrderRows(state.result.layouts);
    const headerPipe = "codigo | descricao | largura | comprimento | rotaciona | observacao | espessura | materiaisSobra";
    const headerTab = "codigo\tdescricao\tlargura\tcomprimento\trotaciona\tobservacao\tespessura\tmateriaisSobra";
    const bodyLines = [
      "Solicitacao de pedido: " + orderCode,
      "",
      headerPipe,
      ...rows.map((r) => r.join(" | ")),
      "",
      headerTab,
      ...rows.map((r) => r.join("\t")),
    ];
    const body = bodyLines.join("\n");

    const requestBtn = document.getElementById("request-order-btn");
    requestBtn.disabled = true;
    try {
      await sendEmailByForm(orderCode, body);
      const waUrl =
        "https://wa.me/" +
        DEFAULTS.whatsappNumber +
        "?text=" +
        encodeURIComponent("Solicitacao de pedido: " + orderCode);
      window.open(waUrl, "_blank");
      alert("Pedido enviado por formulario. Codigo: " + orderCode);
    } catch (error) {
      alert(error.message || "Nao foi possivel enviar o formulario.");
    } finally {
      requestBtn.disabled = false;
    }
  }

  function calculate() {
    const settings = {
      panelWidth: DEFAULTS.panelWidth,
      panelHeight: DEFAULTS.panelHeight,
      cutWidth: DEFAULTS.cutWidth,
      panelCost: DEFAULTS.panelCost,
      cutCost: DEFAULTS.cutCost,
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

  function resetProject() {
    state.result = null;
    clearRows();
    addRow({ width: 1000, height: 1000, quantity: 1, canRotate: true });
    renderSummary();
    renderLayouts();
    applyOverlayState();
  }

  document.getElementById("add-row-btn").addEventListener("click", function () {
    addRow({ width: 1000, height: 1000, quantity: 1, canRotate: true });
  });

  itemsEl.addEventListener("click", function (event) {
    const button = event.target.closest(".remove-row");
    if (!button) return;
    const row = button.closest(".item-row");
    if (!row) return;
    if (itemsEl.children.length > 1) {
      row.remove();
      updateLabels();
    } else {
      row.querySelectorAll("input").forEach((input) => {
        if (input.type === "checkbox") {
          input.checked = true;
        } else {
          input.value = "";
        }
      });
    }
  });

  panelListEl.addEventListener("click", function (event) {
    const row = event.target.closest(".panel-list-row");
    if (!row) return;
    setActivePanel(row.dataset.panelIndex);
  });

  toggleLabelsEl.addEventListener("change", applyOverlayState);
  toggleDimensionsEl.addEventListener("change", applyOverlayState);
  document.getElementById("calculate-btn").addEventListener("click", calculate);
  document.getElementById("request-order-btn").addEventListener("click", function () {
    requestOrder();
  });

  resetProject();
})();
