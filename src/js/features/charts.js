/* ============================================================
   charts — 纯 SVG 图表（无第三方依赖）
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const Charts = {};

  // 环形图：items = [{label,value,color}]
  Charts.donut = function (items, size) {
    size = size || 170;
    const total = items.reduce((s, i) => s + i.value, 0);
    const r = size / 2 - 14;
    const c = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;
    let offset = 0;
    let segs = "";
    if (total === 0) {
      segs = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="16"/>`;
    } else {
      items.forEach((it) => {
        const frac = it.value / total;
        const len = frac * c;
        segs +=
          `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${it.color}" stroke-width="16" ` +
          `stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" ` +
          `transform="rotate(-90 ${cx} ${cy})"><title>${U_escape(it.label)}: ${it.value}</title></circle>`;
        offset += len;
      });
    }
    return (
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">` +
      segs +
      `<text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="28" font-weight="700" fill="#1e293b">${total}</text>` +
      `<text x="${cx}" y="${cy + 17}" text-anchor="middle" font-size="12" fill="#94a3b8">任务总数</text>` +
      `</svg>`
    );
  };

  // 纵向柱状图：items = [{label,value,color}]
  Charts.barV = function (items, opts) {
    opts = opts || {};
    const w = opts.w || 320;
    const h = opts.h || 170;
    const padB = 26;
    const padT = 14;
    const max = Math.max(1, ...items.map((i) => i.value));
    const n = items.length || 1;
    const slot = (w - 20) / n;
    const bw = Math.min(38, slot * 0.6);
    let bars = "";
    items.forEach((it, i) => {
      const bh = (it.value / max) * (h - padB - padT);
      const x = 10 + i * slot + (slot - bw) / 2;
      const y = h - padB - bh;
      bars +=
        `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${it.color || "#4f7cff"}">` +
        `<title>${U_escape(it.label)}: ${it.value}</title></rect>`;
      bars += `<text x="${x + bw / 2}" y="${h - 9}" text-anchor="middle" font-size="10.5" fill="#94a3b8">${U_escape(it.label)}</text>`;
      if (it.value > 0)
        bars += `<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" font-size="10.5" fill="#64748b">${it.value}</text>`;
    });
    return `<svg width="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${bars}</svg>`;
  };

  // 横向条形图（成员负载）：items = [{label,value,color}]
  Charts.barH = function (items, opts) {
    opts = opts || {};
    const w = opts.w || 340;
    const rowH = opts.rowH || 38;
    const labelW = 96;
    const barMax = w - labelW - 36;
    const max = Math.max(1, ...items.map((i) => i.value));
    let rows = "";
    items.forEach((it, i) => {
      const y = i * rowH;
      const bw = (it.value / max) * barMax;
      rows += `<text x="0" y="${y + rowH / 2 + 4}" font-size="12.5" fill="#475569">${U_escape(it.label)}</text>`;
      rows += `<rect x="${labelW}" y="${y + 8}" width="${barMax}" height="${rowH - 18}" rx="6" fill="#eef2f7"/>`;
      rows += `<rect x="${labelW}" y="${y + 8}" width="${Math.max(2, bw)}" height="${rowH - 18}" rx="6" fill="${it.color || "#4f7cff"}"/>`;
      rows += `<text x="${labelW + Math.max(2, bw) + 8}" y="${y + rowH / 2 + 4}" font-size="11.5" fill="#64748b">${it.value}</text>`;
    });
    const h = items.length * rowH;
    return `<svg width="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMinYMin meet">${rows}</svg>`;
  };

  function U_escape(s) {
    return PM.utils.escapeHtml(s);
  }

  PM.charts = Charts;
})();
