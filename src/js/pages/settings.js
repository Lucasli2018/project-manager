/* ============================================================
   page: 项目设置
   ============================================================ */
window.PM = window.PM || {};
PM.pages = PM.pages || {};

(function () {
  const U = PM.utils;
  const C = PM.constants;

  const ACCENTS = ["#4f7cff", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#0ea5e9", "#334155"];

  PM.pages.settings = {
    title: "项目设置",
    actionLabel: null,
    action() {},

    render(c) {
      const pj = PM.store.current();
      const p = pj;

      const accentSwatches = ACCENTS.map((col) => {
        const sel = (p.accent || "#4f7cff").toLowerCase() === col.toLowerCase();
        return '<span class="swatch' + (sel ? " sel" : "") + '" data-accent="' + col + '" style="background:' + col + '"></span>';
      }).join("");

      const statusLabelRows = C.STATUSES.map((st) => {
        const cur = PM.store.statusLabel(st.key);
        return (
          '<div class="field-row" style="align-items:center">' +
          '<span class="col-dot" style="width:10px;height:10px;border-radius:50%;background:' + st.color + ';display:inline-block;flex-shrink:0"></span>' +
          '<input data-status-label="' + st.key + '" value="' + U.escapeHtml(cur) + '" placeholder="' + st.label + '" style="flex:1"/>' +
          "</div>"
        );
      }).join("");

      c.innerHTML =
        '<div class="settings-wrap">' +

        // 项目信息
        '<div class="card card-pad">' +
        '<div class="card-title">项目信息</div>' +
        '<div class="field"><label>项目名称</label><input id="p_name" value="' + U.escapeHtml(p.name) + '"/></div>' +
        '<div class="field"><label>项目描述</label><textarea id="p_desc" placeholder="一句话介绍这个项目…">' + U.escapeHtml(p.description || "") + "</textarea></div>" +
        "</div>" +

        // 外观
        '<div class="card card-pad">' +
        '<div class="card-title">外观主题</div>' +
        '<label style="margin-bottom:8px">强调色（应用于按钮与高亮）</label>' +
        '<div class="swatches">' + accentSwatches + "</div>" +
        '<input type="color" id="p_accent_custom" value="' + (p.accent || "#4f7cff") + '" style="width:46px;height:36px;padding:2px;margin-top:12px"/>' +
        '<span class="muted" style="font-size:12px;margin-left:8px">或自定义颜色</span>' +
        "</div>" +

        // 看板列名称
        '<div class="card card-pad">' +
        '<div class="card-title">看板列名称 <span class="sub">（自定义各状态列显示名）</span></div>' +
        statusLabelRows +
        "</div>" +

        // 里程碑
        '<div class="card card-pad">' +
        '<div class="card-title">里程碑 <span class="sub">（阶段目标，可在任务中关联）</span></div>' +
        '<div id="msWrap">' + milestoneList(pj.milestones) + "</div>" +
        '<button class="btn" id="s_add_ms" style="margin-top:14px">＋ 新建里程碑</button>' +
        "</div>" +

        // 数据管理
        '<div class="card card-pad">' +
        '<div class="card-title">数据管理</div>' +
        '<div class="kv-row"><span class="k">本地数据</span><span class="v">' + pj.tasks.length + " 任务 · " + pj.members.length + " 成员 · " + pj.milestones.length + " 里程碑</span></div>" +
        '<div class="row gap-12" style="margin-top:14px">' +
        '<button class="btn btn-primary" id="s_export">导出 JSON</button>' +
        '<button class="btn" id="s_import">导入 JSON</button>' +
        '<input type="file" id="s_import_file" accept="application/json,.json" class="hide"/>' +
        "</div>" +
        '<p class="muted" style="font-size:12px;margin-top:10px">导出用于备份；导入将<b>覆盖</b>当前全部数据（包含本项目在内的所有项目）。</p>' +
        "</div>" +

        // 危险区
        '<div class="card card-pad danger-zone">' +
        '<div class="card-title">危险区</div>' +
        '<div class="row spread">' +
        "<div><div style=\"font-weight:600\">恢复演示数据</div><div class=\"muted\" style=\"font-size:12px\">清空当前数据并重新载入默认示例</div></div>" +
        '<button class="btn btn-danger" id="s_reset">重置数据</button>' +
        "</div>" +
        "</div>" +

        "</div>";

      // ---- 事件 ----
      const nameInput = c.querySelector("#p_name");
      const descInput = c.querySelector("#p_desc");
      nameInput.addEventListener("change", () => {
        PM.store.updateProject({ name: nameInput.value.trim() || "未命名项目" });
        PM.ui.toast("项目名已保存", "ok");
      });
      descInput.addEventListener("change", () => {
        PM.store.updateProject({ description: descInput.value });
      });

      // 强调色
      const applyAccent = (col) => {
        if (PM.app && PM.app.applyAccent) PM.app.applyAccent(col);
      };
      U.qsa(".swatch[data-accent]", c).forEach((sw) => {
        sw.addEventListener("click", () => {
          const col = sw.getAttribute("data-accent");
          U.qsa(".swatch[data-accent]", c).forEach((x) => x.classList.remove("sel"));
          sw.classList.add("sel");
          c.querySelector("#p_accent_custom").value = col;
          PM.store.updateProject({ accent: col });
          applyAccent(col);
          // 同步顶栏项目切换器的圆点
          const dot = document.querySelector("#projTrigger .proj-dot");
          if (dot) dot.style.background = col;
        });
      });
      c.querySelector("#p_accent_custom").addEventListener("input", (e) => {
        const col = e.target.value;
        U.qsa(".swatch[data-accent]", c).forEach((x) => x.classList.remove("sel"));
        PM.store.update((s) => {
          s.projects[s.currentProjectId].accent = col;
        }, { silent: true });
        applyAccent(col);
        const dot = document.querySelector("#projTrigger .proj-dot");
        if (dot) dot.style.background = col;
      });
      c.querySelector("#p_accent_custom").addEventListener("change", () => {
        PM.ui.toast("主题色已保存", "ok");
      });

      // 看板列名
      U.qsa("[data-status-label]", c).forEach((inp) => {
        inp.addEventListener("change", () => {
          PM.store.setStatusLabel(inp.getAttribute("data-status-label"), inp.value.trim());
          PM.ui.toast("列名已更新", "ok");
        });
      });

      // 里程碑列表事件
      const msWrap = c.querySelector("#msWrap");
      if (msWrap) msWrap.innerHTML = milestoneList(pj.milestones);
      c.querySelectorAll("[data-ms-edit]").forEach((b) =>
        b.addEventListener("click", () => openMilestoneEditor(b.getAttribute("data-ms-edit")))
      );
      c.querySelector("#s_add_ms").addEventListener("click", () => openMilestoneEditor(null));
      c.querySelectorAll("[data-ms-del]").forEach((b) =>
        b.addEventListener("click", () => {
          const id = b.getAttribute("data-ms-del");
          const m = PM.store.milestone(id);
          PM.ui.confirm("确定删除里程碑「" + (m ? m.name : "") + "」？关联任务将解除里程碑绑定。", () => {
            PM.store.deleteMilestone(id);
            PM.ui.toast("里程碑已删除", "ok");
          });
        })
      );

      // 导出 / 导入 / 重置
      c.querySelector("#s_export").addEventListener("click", () => PM.io.exportJSON());
      const fileInput = c.querySelector("#s_import_file");
      c.querySelector("#s_import").addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        if (fileInput.files && fileInput.files[0]) {
          PM.io.importJSONFile(fileInput.files[0]);
        }
      });
      c.querySelector("#s_reset").addEventListener("click", () => {
        PM.ui.confirm("确定恢复演示数据？当前所有项目、任务与成员将被覆盖。", () => {
          PM.store.reset();
          if (PM.app && PM.app.applyAccent) PM.app.applyAccent(PM.store.current().accent);
          PM.ui.toast("已恢复演示数据", "ok");
        });
      });
    },
  };

  function milestoneList(list) {
    if (!list.length) return '<div class="muted" style="font-size:12.5px">暂无里程碑，点击下方按钮创建。</div>';
    return (
      '<div class="ms-list">' +
      list
        .map((m) => {
          const pr = PM.store.milestoneProgress(m.id);
          const meta =
            (pr.total ? pr.done + "/" + pr.total + " 完成 · " + pr.pct + "%" : "暂无关联任务") +
            (m.dueDate ? " · 截止 " + U.friendlyDate(m.dueDate) : "") +
            (pr.overdue ? " · ⚠ 已逾期" : "");
          return (
            '<div class="ms-item">' +
            '<div class="ms-top">' +
            '<div class="ms-name"><span class="ms-dot" style="background:' + (m.color || "#4f7cff") + '"></span>' + U.escapeHtml(m.name) + "</div>" +
            '<div style="display:flex;gap:6px">' +
            '<button class="btn btn-sm" data-ms-edit="' + m.id + '">编辑</button>' +
            '<button class="btn btn-sm btn-danger" data-ms-del="' + m.id + '">删除</button>' +
            "</div>" +
            "</div>" +
            '<div class="ms-meta' + (pr.overdue ? " overdue" : "") + '">' + U.escapeHtml(meta) + "</div>" +
            '<div class="ms-progress"><span style="width:' + pr.pct + "%;background:" + (m.color || "#4f7cff") + '"></span></div>' +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function openMilestoneEditor(msId) {
    const isEdit = !!msId;
    const m = isEdit ? PM.store.milestone(msId) : null;
    const color = (m && m.color) || "#4f7cff";
    const body =
      '<div class="field"><label>里程碑名称</label><input id="ms_name" placeholder="例如：V1.0 公测" value="' + (m ? U.escapeHtml(m.name) : "") + '"/></div>' +
      '<div class="field"><label>描述</label><textarea id="ms_desc" placeholder="可选">'+ (m ? U.escapeHtml(m.desc || "") : "") + '</textarea></div>' +
      '<div class="field-row">' +
      '<div class="field"><label>截止日期</label><input id="ms_due" type="date" value="' + (m && m.dueDate ? m.dueDate : "") + '"/></div>' +
      '<div class="field"><label>颜色</label><input type="color" id="ms_color" value="' + color + '" style="width:46px;height:38px;padding:2px"/></div>' +
      "</div>";
    PM.ui.modal({
      title: isEdit ? "编辑里程碑" : "新建里程碑",
      body,
      onMount(container, close) {
        const save = () => {
          const name = container.querySelector("#ms_name").value.trim();
          if (!name) {
            PM.ui.toast("请填写名称", "err");
            return;
          }
          const data = {
            name,
            desc: container.querySelector("#ms_desc").value.trim(),
            dueDate: container.querySelector("#ms_due").value || null,
            color: container.querySelector("#ms_color").value,
          };
          if (isEdit) PM.store.updateMilestone(msId, data);
          else PM.store.addMilestone(data);
          PM.ui.toast(isEdit ? "里程碑已更新" : "里程碑已创建", "ok");
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
