/* ============================================================
   page: 团队成员管理
   ============================================================ */
window.PM = window.PM || {};
PM.pages = PM.pages || {};

(function () {
  const U = PM.utils;

  const PALETTE = ["#4f7cff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

  PM.pages.team = {
    title: "团队成员",
    actionLabel: "添加成员",
    action() {
      openEditor(null);
    },

    render(c) {
      const pj = PM.store.current();
      const members = pj.members;

      c.innerHTML =
        '<div class="row spread" style="margin-bottom:16px">' +
        '<div class="muted">项目「' + U.escapeHtml(pj.name) + '」共 ' + members.length + " 位成员协作</div>" +
        "</div>";

      if (!members.length) {
        c.innerHTML +=
          '<div class="empty"><div class="eicon">👥</div><div>该项目还没有团队成员</div>' +
          '<button class="btn btn-primary" id="emptyAdd">添加第一位成员</button></div>';
        c.querySelector("#emptyAdd").addEventListener("click", () => openEditor(null));
        return;
      }

      const grid = document.createElement("div");
      grid.className = "team-grid";
      members.forEach((m) => {
        const w = PM.store.memberWorkload(m.id);
        const card = document.createElement("div");
        card.className = "member-card";
        card.innerHTML =
          '<div class="member-top">' +
          PM.ui.avatar(m, "lg") +
          '<div class="member-info">' +
          '<div class="m-name">' + U.escapeHtml(m.name) + "</div>" +
          (m.role ? '<div class="m-role">' + U.escapeHtml(m.role) + "</div>" : "") +
          (m.email ? '<div class="m-mail">' + U.escapeHtml(m.email) + "</div>" : "") +
          "</div>" +
          "</div>" +
          '<div class="member-stats">' +
          '<div class="member-stat"><div class="ms-v">' + w.total + '</div><div class="ms-l">负责任务</div></div>' +
          '<div class="member-stat"><div class="ms-v">' + w.active + '</div><div class="ms-l">进行中</div></div>' +
          '<div class="member-stat"><div class="ms-v">' + w.done + '</div><div class="ms-l">已完成</div></div>' +
          "</div>" +
          '<div class="member-actions">' +
          '<button class="btn btn-sm grow" data-edit="' + m.id + '">编辑</button>' +
          '<button class="btn btn-sm btn-danger" data-del="' + m.id + '">删除</button>' +
          "</div>";
        grid.appendChild(card);
      });
      c.appendChild(grid);

      U.qsa("[data-edit]", grid).forEach((b) =>
        b.addEventListener("click", () => openEditor(b.getAttribute("data-edit")))
      );
      U.qsa("[data-del]", grid).forEach((b) =>
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-del");
          const m = PM.store.member(id);
          PM.ui.confirm("确定删除成员「" + (m ? m.name : "") + "」？其负责的任务将变为未指派。", () => {
            PM.store.deleteMember(id);
            PM.ui.toast("成员已删除", "ok");
          });
        })
      );
    },
  };

  function openEditor(memberId) {
    const pj = PM.store.current();
    const isEdit = !!memberId;
    const m = isEdit ? PM.store.member(memberId) : null;
    const color = (m && m.color) || "#4f7cff";

    const swatches = PALETTE.map(
      (c) =>
        '<span class="swatch" data-color="' + c + '" style="background:' + c + (c === color ? ";border-color:#1e293b" : "") + '"></span>'
    ).join("");

    const body =
      '<div class="field"><label>姓名</label><input id="f_name" placeholder="例如：张三" value="' + (m ? U.escapeHtml(m.name) : "") + '"/></div>' +
      '<div class="field-row">' +
      '<div class="field"><label>角色</label><input id="f_role" placeholder="例如：前端工程师" value="' + (m ? U.escapeHtml(m.role || "") : "") + '"/></div>' +
      '<div class="field"><label>邮箱</label><input id="f_email" placeholder="name@studio.dev" value="' + (m ? U.escapeHtml(m.email || "") : "") + '"/></div>' +
      "</div>" +
      '<div class="field"><label>头像颜色</label>' +
      '<div class="row gap-8" style="margin-bottom:8px">' +
      '<input type="color" id="f_color" value="' + color + '" style="width:46px;height:38px;padding:2px"/>' +
      '<div class="swatches" id="swWrap">' + swatches + "</div>" +
      "</div></div>";

    PM.ui.modal({
      title: isEdit ? "编辑成员" : "添加成员",
      body,
      onMount(container, close) {
        const colorInput = container.querySelector("#f_color");
        const swWrap = container.querySelector("#swWrap");
        swWrap.addEventListener("click", (e) => {
          const sw = e.target.closest(".swatch");
          if (!sw) return;
          const col = sw.getAttribute("data-color");
          colorInput.value = col;
          U.qsa(".swatch", swWrap).forEach((x) => (x.style.borderColor = x === sw ? "#1e293b" : "transparent"));
        });

        const save = () => {
          const name = container.querySelector("#f_name").value.trim();
          if (!name) {
            PM.ui.toast("请填写姓名", "err");
            return;
          }
          const data = {
            name,
            role: container.querySelector("#f_role").value.trim(),
            email: container.querySelector("#f_email").value.trim(),
            color: colorInput.value,
          };
          if (isEdit) PM.store.updateMember(memberId, data);
          else PM.store.addMember(data);
          PM.ui.toast(isEdit ? "成员已更新" : "成员已添加", "ok");
          close();
        };

        const foot = document.querySelector(".modal-foot");
        if (foot) {
          foot.innerHTML = "";
          foot.appendChild(mkBtn("取消", "btn", close));
          foot.appendChild(mkBtn("保存", "btn btn-primary", save));
        }
      },
    });
  }

  function mkBtn(label, cls, onClick) {
    const b = document.createElement("button");
    b.className = cls;
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }
})();
