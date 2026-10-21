/* ============================================================
   ui — 模态框 / Toast / 确认框
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const U = PM.utils;

  const UI = {
    /* 打开模态框
       opts: {
         title, body(html string), lg(bool),
         onMount(container),            // 装配事件
         buttons: [{label, kind, onClick(close)}]  // kind: primary|default|danger
       }
       返回 close()
    */
    modal(opts) {
      const root = document.getElementById("modal-root");
      const overlay = U.el("div", { class: "modal-overlay" });
      const panel = U.el("div", { class: "modal" + (opts.lg ? " lg" : "") });

      const head = U.el("div", { class: "modal-head" }, [
        U.el("div", { class: "modal-title", text: opts.title || "" }),
        U.el("button", {
          class: "modal-close",
          html: "&times;",
          onClick: () => close(),
        }),
      ]);

      const body = U.el("div", { class: "modal-body" });
      if (opts.body) body.innerHTML = opts.body;

      const foot = U.el("div", { class: "modal-foot" });
      const buttons = opts.buttons || [{ label: "确定", kind: "primary", onClick: (c) => c() }];
      buttons.forEach((b) => {
        foot.appendChild(
          U.el("button", {
            class: "btn" + (b.kind === "primary" ? " btn-primary" : b.kind === "danger" ? " btn-danger" : ""),
            text: b.label,
            onClick: () => b.onClick(close),
          })
        );
      });

      panel.appendChild(head);
      panel.appendChild(body);
      if (buttons.length) panel.appendChild(foot);
      overlay.appendChild(panel);
      root.appendChild(overlay);

      function close() {
        overlay.remove();
      }
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
      });
      document.addEventListener("keydown", function esc(e) {
        if (e.key === "Escape") {
          close();
          document.removeEventListener("keydown", esc);
        }
      });

      if (opts.onMount) opts.onMount(body, close);
      // 自动聚焦首个输入
      const firstInput = body.querySelector("input,textarea,select");
      if (firstInput) setTimeout(() => firstInput.focus(), 30);

      return close;
    },

    /* 任务/成员表单等通用字段渲染（返回 HTML 片段字符串） */
    toast(msg, kind) {
      const root = document.getElementById("toast-root");
      const t = U.el("div", { class: "toast " + (kind || ""), text: msg });
      root.appendChild(t);
      setTimeout(() => {
        t.style.opacity = "0";
        t.style.transition = "opacity .25s";
        setTimeout(() => t.remove(), 260);
      }, 2200);
    },

    confirm(msg, onYes) {
      this.modal({
        title: "请确认",
        body: '<p style="color:var(--text-2);line-height:1.6">' + U.escapeHtml(msg) + "</p>",
        buttons: [
          { label: "取消", kind: "default", onClick: (c) => c() },
          {
            label: "确定",
            kind: "danger",
            onClick: (c) => {
              c();
              onYes && onYes();
            },
          },
        ],
      });
    },
  };

  // 头像 HTML（member 可为 null）
  UI.avatar = function (member, size) {
    size = size || "";
    const cls = "avatar" + (size ? " " + size : "");
    if (!member) {
      return '<div class="' + cls + '" style="background:#cbd5e1" title="未指派">?</div>';
    }
    const ini = PM.utils.initials(member.name);
    return (
      '<div class="' +
      cls +
      '" style="background:' +
      (member.color || "#94a3b8") +
      '" title="' +
      PM.utils.escapeHtml(member.name) +
      '">' +
      PM.utils.escapeHtml(ini) +
      "</div>"
    );
  };

  // 优先级徽章
  UI.priorityBadge = function (key) {
    const label = PM.constants.priorityLabel(key);
    const color = PM.constants.priorityColor(key);
    return '<span class="badge" style="color:' + color + ';background:' + color + '1a"><span class="dot"></span>' + label + "</span>";
  };

  PM.ui = UI;
})();
