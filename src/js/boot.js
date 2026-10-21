/* ============================================================
   boot — 启动、路由、侧边栏、顶栏串联
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const U = PM.utils;
  const Store = PM.store;

  const NAV = [
    { key: "dashboard", label: "仪表盘总览", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>' },
    { key: "kanban", label: "任务看板", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="15" rx="1"/></svg>' },
    { key: "team", label: "团队成员", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M17.5 20a5.5 5.5 0 0 0-3-4.9"/></svg>' },
    { key: "settings", label: "项目设置", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 8.6a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3.6h.1A1.6 1.6 0 0 0 10 2.1V2a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 16 3.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>' },
  ];

  // 颜色加深（百分比，负号=变暗）
  function shade(hex, pct) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * (1 + pct))));
    g = Math.max(0, Math.min(255, Math.round(g * (1 + pct))));
    b = Math.max(0, Math.min(255, Math.round(b * (1 + pct))));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function applyAccent(col) {
    const root = document.documentElement;
    root.style.setProperty("--accent", col);
    root.style.setProperty("--accent-strong", shade(col, -0.14));
    root.style.setProperty("--accent-weak", col + "1a");
    // 侧边栏激活条同步
    document.documentElement.style.setProperty("--sidebar-active-bar", col);
  }

  const App = {
    render() {
      const key = PM.router.current;
      const page = PM.pages[key];
      if (!page) return;
      const content = document.getElementById("app-content");
      const prevScroll = content.scrollTop;
      content.innerHTML = "";
      page.render(content);
      content.scrollTop = prevScroll;

      // 顶栏
      document.getElementById("pageTitle").textContent = page.title || "";
      const sub = document.getElementById("pageSub");
      if (sub) sub.textContent = Store.get().project.name;
      const actions = document.getElementById("pageActions");
      actions.innerHTML = "";
      if (page.actionLabel) {
        const btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.textContent = page.actionLabel;
        btn.addEventListener("click", () => page.action && page.action());
        actions.appendChild(btn);
      }

      // 侧边栏高亮
      U.qsa(".nav-item").forEach((n) => {
        n.classList.toggle("active", n.getAttribute("data-key") === key);
      });
    },
    applyAccent,
  };
  PM.app = App;

  function buildNav() {
    const nav = document.getElementById("nav");
    NAV.forEach((item) => {
      const a = U.el(
        "button",
        { class: "nav-item", "data-key": item.key, onClick: () => PM.router.go(item.key) },
        [U.el("span", { html: item.icon }), U.el("span", { text: item.label })]
      );
      nav.appendChild(a);
    });
  }

  function init() {
    Store.load();
    applyAccent(Store.get().project.accent || "#4f7cff");
    document.getElementById("brandName").textContent = "项目管理";
    buildNav();
    // 状态变化时自动重渲染当前页
    Store.subscribe(() => App.render());
    PM.router.start(() => App.render());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
