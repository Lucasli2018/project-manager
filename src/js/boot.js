/* ============================================================
   boot — 启动、路由、侧边栏、顶栏、项目切换器
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

  const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

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
    root.style.setProperty("--sidebar-active-bar", col);
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
      if (sub) sub.textContent = Store.current().name;
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

      // 同步当前项目强调色
      applyAccent(Store.current().accent || "#4f7cff");
      refreshProjectTrigger();
    },
    applyAccent,
  };
  PM.app = App;

  /* ---------------- 项目切换器 ---------------- */
  function buildProjectSwitch() {
    const host = document.getElementById("projSwitch");
    if (!host) return;
    host.innerHTML =
      '<button class="proj-trigger" id="projTrigger"></button>' +
      '<div class="proj-menu hide" id="projMenu"></div>';
    const trigger = host.querySelector("#projTrigger");
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleProjectMenu();
    });
    document.addEventListener("click", (e) => {
      if (!host.contains(e.target)) closeProjectMenu();
    });
    refreshProjectTrigger();
  }

  function refreshProjectTrigger() {
    const t = document.getElementById("projTrigger");
    if (!t) return;
    const p = Store.current();
    t.innerHTML =
      '<span class="proj-dot" style="background:' + (p.accent || "#4f7cff") + '"></span>' +
      '<span class="proj-name">' + U.escapeHtml(p.name) + "</span>" +
      CHEVRON;
  }

  function toggleProjectMenu() {
    const menu = document.getElementById("projMenu");
    if (!menu) return;
    if (menu.classList.contains("hide")) openProjectMenu();
    else closeProjectMenu();
  }
  function openProjectMenu() {
    const menu = document.getElementById("projMenu");
    if (!menu) return;
    const ids = Store.projectIds();
    const cur = Store.currentId();
    let html = '<div class="proj-menu-head">切换项目</div>';
    html += ids
      .map((id) => {
        const p = Store.state.projects[id];
        const sel = id === cur ? " sel" : "";
        const chk = id === cur ? CHECK : "";
        return (
          '<button class="proj-item' + sel + '" data-pid="' + id + '">' +
          '<span class="proj-dot" style="background:' + (p.accent || "#4f7cff") + '"></span>' +
          '<span class="proj-item-name">' + U.escapeHtml(p.name) + "</span>" +
          chk +
          "</button>"
        );
      })
      .join("");
    html +=
      '<div class="proj-menu-div"></div>' +
      '<button class="proj-item proj-action" id="pmNew">＋ 新建项目</button>' +
      '<button class="proj-item proj-action" id="pmManage">⚙ 管理项目</button>';
    menu.innerHTML = html;
    U.qsa("[data-pid]", menu).forEach((b) =>
      b.addEventListener("click", () => {
        switchTo(b.getAttribute("data-pid"));
        closeProjectMenu();
      })
    );
    menu.querySelector("#pmNew").addEventListener("click", () => {
      closeProjectMenu();
      openCreateProject();
    });
    menu.querySelector("#pmManage").addEventListener("click", () => {
      closeProjectMenu();
      openProjectManager();
    });
    menu.classList.remove("hide");
  }
  function closeProjectMenu() {
    const menu = document.getElementById("projMenu");
    if (menu) menu.classList.add("hide");
  }

  function switchTo(id) {
    if (Store.currentId() === id) return;
    Store.setCurrentProject(id);
    refreshProjectTrigger();
    // setCurrentProject 会 emit → render；这里兜底确保重渲染
    PM.router.go(PM.router.current);
  }

  function mkBtn(label, cls, onClick) {
    const b = document.createElement("button");
    b.className = cls;
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function openCreateProject() {
    const body =
      '<div class="field"><label>项目名称</label><input id="cp_name" placeholder="例如：网站改版" value=""/></div>' +
      '<div class="field"><label>项目描述</label><textarea id="cp_desc" placeholder="一句话介绍这个项目…"></textarea></div>' +
      '<div class="field"><label>主题色</label><div class="row gap-8"><input type="color" id="cp_accent" value="#4f7cff" style="width:46px;height:38px;padding:2px"/><span class="muted" style="font-size:12px">用于区分该项目</span></div></div>';
    PM.ui.modal({
      title: "新建项目",
      body,
      onMount(container, close) {
        const save = () => {
          const name = container.querySelector("#cp_name").value.trim();
          if (!name) {
            PM.ui.toast("请填写项目名称", "err");
            return;
          }
          Store.addProject({
            name,
            description: container.querySelector("#cp_desc").value.trim(),
            accent: container.querySelector("#cp_accent").value,
          });
          PM.ui.toast("项目已创建", "ok");
          refreshProjectTrigger();
          close();
          PM.router.go(PM.router.current);
        };
        const foot = document.querySelector(".modal-foot");
        if (foot) {
          foot.innerHTML = "";
          foot.appendChild(mkBtn("取消", "btn", close));
          foot.appendChild(mkBtn("创建", "btn btn-primary", save));
        }
      },
    });
  }

  function openProjectManager() {
    const ids = Store.projectIds();
    const rows = ids
      .map((id) => {
        const p = Store.state.projects[id];
        return (
          '<div class="pmrow" data-pid="' + id + '">' +
          '<input class="pm-name" data-pid="' + id + '" value="' + U.escapeHtml(p.name) + '"/>' +
          '<input type="color" class="pm-accent" data-pid="' + id + '" value="' + (p.accent || "#4f7cff") + '" style="width:38px;height:34px;padding:2px"/>' +
          '<button class="btn btn-sm" data-switch="' + id + '">切换</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + id + '">删除</button>' +
          "</div>"
        );
      })
      .join("");
    const body =
      '<div class="pm-list">' + rows + "</div>" +
      '<p class="muted" style="font-size:12px;margin-top:12px">重命名 / 改色即时保存；删除项目会一并清除其任务、成员与里程碑（至少保留一个项目）。</p>';
    PM.ui.modal({
      title: "管理项目",
      lg: true,
      body,
      onMount(container, close) {
        container.querySelectorAll(".pm-name").forEach((inp) =>
          inp.addEventListener("change", () => {
            const id = inp.getAttribute("data-pid");
            const v = inp.value.trim();
            if (!v) {
              PM.ui.toast("名称不能为空", "err");
              inp.value = Store.state.projects[id].name;
              return;
            }
            Store.updateProjectMeta(id, { name: v });
            if (id === Store.currentId()) refreshProjectTrigger();
          })
        );
        container.querySelectorAll(".pm-accent").forEach((inp) =>
          inp.addEventListener("input", () => {
            const id = inp.getAttribute("data-pid");
            Store.update((s) => {
              if (s.projects[id]) s.projects[id].accent = inp.value;
            }, { silent: true });
            if (id === Store.currentId()) {
              applyAccent(inp.value);
              refreshProjectTrigger();
            }
          })
        );
        container.querySelectorAll("[data-switch]").forEach((b) =>
          b.addEventListener("click", () => {
            switchTo(b.getAttribute("data-switch"));
            close();
          })
        );
        container.querySelectorAll("[data-del]").forEach((b) =>
          b.addEventListener("click", () => {
            const id = b.getAttribute("data-del");
            const p = Store.state.projects[id];
            PM.ui.confirm("确定删除项目「" + (p ? p.name : "") + "」？其全部数据将被清除。", () => {
              Store.deleteProject(id);
              refreshProjectTrigger();
              close();
              PM.router.go(PM.router.current);
              PM.ui.toast("项目已删除", "ok");
            });
          })
        );
      },
    });
  }

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
    applyAccent(Store.current().accent || "#4f7cff");
    document.getElementById("brandName").textContent = "项目管理";
    buildNav();
    buildProjectSwitch();
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
