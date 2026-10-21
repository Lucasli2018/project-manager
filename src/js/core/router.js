/* ============================================================
   router — 极简 hash 路由
   ============================================================ */
window.PM = window.PM || {};

PM.router = {
  current: "dashboard",
  routes: ["dashboard", "kanban", "team", "settings"],

  parse() {
    const h = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
    return this.routes.includes(h) ? h : "dashboard";
  },

  go(page) {
    if (location.hash === "#/" + page) {
      // 已在该页，直接触发渲染
      if (PM.app) PM.app.render();
    } else {
      location.hash = "#/" + page;
    }
  },

  start(onChange) {
    this._onChange = onChange;
    window.addEventListener("hashchange", () => {
      this.current = this.parse();
      onChange(this.current);
    });
    this.current = this.parse();
    onChange(this.current);
  },
};
