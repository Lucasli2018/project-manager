/* ============================================================
   utils — 通用工具
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const U = {};

  U.uid = function (prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  // 今天 YYYY-MM-DD（本地时区）
  U.todayISO = function () {
    const d = new Date();
    return U.fmtDate(d);
  };

  U.fmtDate = function (d) {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return "";
    const p = (n) => String(n).padStart(2, "0");
    return dt.getFullYear() + "-" + p(dt.getMonth() + 1) + "-" + p(dt.getDate());
  };

  // 友好日期：今天 / 明天 / 昨天 / M月D日
  U.friendlyDate = function (iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    const t = new Date(U.todayISO() + "T00:00:00");
    const diff = Math.round((d - t) / 86400000);
    if (diff === 0) return "今天";
    if (diff === 1) return "明天";
    if (diff === -1) return "昨天";
    if (diff > 1 && diff <= 7) return diff + "天后";
    if (diff < -1 && diff >= -7) return -diff + "天前";
    return d.getMonth() + 1 + "月" + d.getDate() + "日";
  };

  U.isOverdue = function (iso, status) {
    if (!iso || status === "done") return false;
    return iso < U.todayISO();
  };

  U.escapeHtml = function (s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  // 简易 DOM 创建：el('div', {class:'x'}, [child, 'text'])
  U.el = function (tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.startsWith("on") && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  };

  U.qs = (sel, root) => (root || document).querySelector(sel);
  U.qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  U.debounce = function (fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      const args = arguments, self = this;
      t = setTimeout(() => fn.apply(self, args), wait);
    };
  };

  U.initials = function (name) {
    if (!name) return "?";
    const n = name.trim();
    // 中文取后两字，英文取首字母
    if (/[一-龥]/.test(n)) return n.slice(-2);
    const parts = n.split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  };

  // 颜色：根据字符串生成稳定的深色系
  U.colorFromName = function (name) {
    const palette = [
      "#4f7cff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
      "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
    ];
    let h = 0;
    for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
  };

  PM.utils = U;
})();
