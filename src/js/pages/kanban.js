/* ============================================================
   page: 任务看板（拖拽 + 筛选 + 增改 + 里程碑）
   ============================================================ */
window.PM = window.PM || {};
PM.pages = PM.pages || {};

(function () {
  const U = PM.utils;
  const C = PM.constants;

  // 模块级筛选状态（跨重渲染保留）
  const filter = { text: "", assignee: "", priority: "", tag: "", milestone: "" };

  function match(t) {
    if (filter.text) {
      const q = filter.text.toLowerCase();
      if (!(t.title.toLowerCase().includes(q) || (t.desc || "").toLowerCase().includes(q))) return false;
    }
    if (filter.assignee && (t.assigneeId || "") !== filter.assignee) return false;
    if (filter.priority && t.priority !== filter.priority) return false;
    if (filter.tag && !(t.tags || []).includes(filter.tag)) return false;
    if (filter.milestone && (t.milestoneId || "") !== filter.milestone) return false;
    return true;
  }

  function allTags() {
    const set = new Set();
    PM.store.current().tasks.forEach((t) => (t.tags || []).forEach((x) => set.add(x)));
    return Array.from(set).sort();
  }

  PM.pages.kanban = {
    title: "任务看板",
    actionLabel: "新建任务",
    action() {
      openEditor(null);
    },

    render(c) {
      const pj = PM.store.current();
      const members = pj.members;
      const tags = allTags();
      const milestones = pj.milestones;

      c.innerHTML =
        // 工具栏
        '<div class="kb-toolbar">' +
        '<div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>' +
        '<input id="kbSearch" type="text" placeholder="搜索任务标题或描述…" value="' + U.escapeHtml(filter.text) + '"/></div>' +
        '<select id="kbAssignee"><option value="">全部负责人</option>' +
        members.map((m) => '<option value="' + m.id + '"' + (filter.assignee === m.id ? " selected" : "") + ">" + U.escapeHtml(m.name) + "</option>").join("") +
        "</select>" +
        '<select id="kbPriority"><option value="">全部优先级</option>' +
        C.PRIORITIES.map((p) => '<option value="' + p.key + '"' + (filter.priority === p.key ? " selected" : "") + ">" + p.label + "</option>").join("") +
        "</select>" +
        '<select id="kbMilestone"><option value="">全部里程碑</option>' +
        milestones.map((m) => '<option value="' + m.id + '"' + (filter.milestone === m.id ? " selected" : "") + ">" + U.escapeHtml(m.name) + "</option>").join("") +
        "</select>" +
        '<select id="kbTag"><option value="">全部标签</option>' +
        tags.map((t) => '<option value="' + U.escapeHtml(t) + '"' + (filter.tag === t ? " selected" : "") + ">" + U.escapeHtml(t) + "</option>").join("") +
        "</select>" +
        '<button class="btn btn-ghost btn-sm" id="kbClear">清除筛选</button>' +
        '<span class="kb-filter-count" id="kbCount"></span>' +
        "</div>" +
        // 看板
        '<div class="board" id="kbBoard"></div>';

      // 工具栏事件
      const search = c.querySelector("#kbSearch");
      search.addEventListener("input", () => {
        filter.text = search.value.trim();
        renderBoard(c);
      });
      c.querySelector("#kbAssignee").addEventListener("change", (e) => {
        filter.assignee = e.target.value;
        renderBoard(c);
      });
      c.querySelector("#kbPriority").addEventListener("change", (e) => {
        filter.priority = e.target.value;
        renderBoard(c);
      });
      c.querySelector("#kbMilestone").addEventListener("change", (e) => {
        filter.milestone = e.target.value;
        renderBoard(c);
      });
      c.querySelector("#kbTag").addEventListener("change", (e) => {
        filter.tag = e.target.value;
        renderBoard(c);
      });
      c.querySelector("#kbClear").addEventListener("click", () => {
        filter.text = filter.assignee = filter.priority = filter.tag = filter.milestone = "";
        c.querySelector("#kbSearch").value = "";
        c.querySelector("#kbAssignee").value = "";
        c.querySelector("#kbPriority").value = "";
        c.querySelector("#kbMilestone").value = "";
        c.querySelector("#kbTag").value = "";
        renderBoard(c);
      });

      renderBoard(c);
    },
  };

  // 仅重渲染看板区域（保留工具栏输入焦点）
  function renderBoard(c) {
    const board = c.querySelector("#kbBoard");
    const pj = PM.store.current();
    const total = pj.tasks.length;
    let shown = 0;

    board.innerHTML = C.STATUSES.map((st) => {
      const all = PM.store.tasksByStatus(st.key);
      const list = all.filter(match);
      shown += list.length;
      const cards = list.length
        ? list.map(cardHTML).join("")
        : '<div class="kb-empty">暂无任务</div>';

      return (
        '<div class="kb-col">' +
        '<div class="kb-col-head">' +
        '<span class="col-dot" style="background:' + st.color + '"></span>' +
        '<span class="col-name">' + U.escapeHtml(PM.store.statusLabel(st.key)) + "</span>" +
        '<span class="col-count">' + list.length + (list.length !== all.length ? "/" + all.length : "") + "</span>" +
        "</div>" +
        '<div class="kb-col-body" data-status="' + st.key + '">' + cards + "</div>" +
        '<button class="kb-add" data-status="' + st.key + '">+ 添加任务</button>' +
        "</div>"
      );
    }).join("");

    // 列放置区
    U.qsa(".kb-col-body", board).forEach((body) => {
      const status = body.getAttribute("data-status");
      PM.dnd.enableDropZone(body, status, (id, beforeId) => onDrop(id, status, beforeId));
    });

    // 卡片拖拽 + 点击编辑
    U.qsa(".kb-card", board).forEach((card) => {
      const id = card.getAttribute("data-id");
      const status = card.getAttribute("data-status");
      PM.dnd.enableCard(card, id, (dragId, beforeId) => onDrop(dragId, status, beforeId));
      card.addEventListener("click", () => openEditor(id));
    });

    // 添加按钮
    U.qsa(".kb-add", board).forEach((btn) => {
      btn.addEventListener("click", () => openEditor(null, btn.getAttribute("data-status")));
    });

    const countEl = c.querySelector("#kbCount");
    if (countEl) {
      const filtering = filter.text || filter.assignee || filter.priority || filter.tag || filter.milestone;
      countEl.textContent = filtering ? "筛选结果 " + shown + " / " + total + " 项" : "共 " + total + " 项";
    }
  }

  function onDrop(dragId, newStatus, beforeId) {
    if (!dragId) return;
    PM.store.moveTask(dragId, newStatus, beforeId);
    // store.emit 会触发整页重渲染；这里无需手动 renderBoard
  }

  function cardHTML(t) {
    const m = PM.store.member(t.assigneeId);
    const pColor = C.priorityColor(t.priority);
    const overdue = U.isOverdue(t.dueDate, t.status);
    const tags = (t.tags || [])
      .map((x) => '<span class="tag">' + U.escapeHtml(x) + "</span>")
      .join("");
    const ms = t.milestoneId ? PM.store.milestone(t.milestoneId) : null;
    const msChip = ms
      ? '<span class="kc-ms" style="color:' + ms.color + ";background:" + ms.color + '1a"><span class="dot"></span>' + U.escapeHtml(ms.name) + "</span>"
      : "";
    return (
      '<div class="kb-card" data-id="' + t.id + '" data-status="' + t.status + '" style="border-left-color:' + pColor + '">' +
      '<div class="kc-title">' + U.escapeHtml(t.title) + "</div>" +
      (tags || msChip ? '<div class="kc-tags">' + tags + msChip + "</div>" : "") +
      '<div class="kc-meta">' + PM.ui.priorityBadge(t.priority) + "</div>" +
      '<div class="kc-foot">' +
      (m ? PM.ui.avatar(m, "sm") : '<span class="muted" style="font-size:12px">未指派</span>') +
      (t.dueDate
        ? '<span class="kc-due' + (overdue ? " overdue" : "") + '">' + (overdue ? "⚠ " : "📅 ") + U.friendlyDate(t.dueDate) + "</span>"
        : "") +
      "</div>" +
      "</div>"
    );
  }

  /* ---------------- 任务编辑器 ---------------- */
  function openEditor(taskId, presetStatus) {
    const pj = PM.store.current();
    const isEdit = !!taskId;
    const t = isEdit ? pj.tasks.find((x) => x.id === taskId) : null;
    const members = pj.members;
    const milestones = pj.milestones;

    const memberOpts =
      '<option value="">未指派</option>' +
      members.map((m) => '<option value="' + m.id + '"' + ((t && t.assigneeId === m.id) ? " selected" : "") + ">" + U.escapeHtml(m.name) + "</option>").join("");

    const statusOpts = C.STATUSES.map(
      (st) =>
        '<option value="' + st.key + '"' +
        ((t && t.status === st.key) || (!t && presetStatus === st.key) ? " selected" : "") +
        ">" + U.escapeHtml(PM.store.statusLabel(st.key)) + "</option>"
    ).join("");

    const prioOpts = C.PRIORITIES.map(
      (p) => '<option value="' + p.key + '"' + ((t && t.priority === p.key) || (!t && p.key === "medium") ? " selected" : "") + ">" + p.label + "</option>"
    ).join("");

    const milestoneOpts =
      '<option value="">无里程碑</option>' +
      milestones.map((m) => '<option value="' + m.id + '"' + ((t && t.milestoneId === m.id) ? " selected" : "") + ">" + U.escapeHtml(m.name) + "</option>").join("");

    const body =
      '<div class="field"><label>任务标题</label><input id="f_title" placeholder="例如：完成登录页开发" value="' + (t ? U.escapeHtml(t.title) : "") + '"/></div>' +
      '<div class="field"><label>描述</label><textarea id="f_desc" placeholder="补充说明（可选）">' + (t ? U.escapeHtml(t.desc || "") : "") + "</textarea></div>" +
      '<div class="field-row">' +
      '<div class="field"><label>状态</label><select id="f_status">' + statusOpts + "</select></div>" +
      '<div class="field"><label>优先级</label><select id="f_priority">' + prioOpts + "</select></div>" +
      "</div>" +
      '<div class="field-row">' +
      '<div class="field"><label>负责人</label><select id="f_assignee">' + memberOpts + "</select></div>" +
      '<div class="field"><label>截止日期</label><input id="f_due" type="date" value="' + (t && t.dueDate ? t.dueDate : "") + '"/></div>' +
      "</div>" +
      '<div class="field"><label>所属里程碑</label><select id="f_milestone">' + milestoneOpts + "</select></div>" +
      '<div class="field"><label>标签（用逗号分隔）</label><input id="f_tags" placeholder="前端, 核心" value="' + (t && t.tags ? U.escapeHtml(t.tags.join(", ")) : "") + '"/></div>';

    PM.ui.modal({
      title: isEdit ? "编辑任务" : "新建任务",
      body,
      onMount(container, close) {
        const save = () => {
          const title = container.querySelector("#f_title").value.trim();
          if (!title) {
            PM.ui.toast("请填写任务标题", "err");
            return;
          }
          const data = {
            title,
            desc: container.querySelector("#f_desc").value.trim(),
            status: container.querySelector("#f_status").value,
            priority: container.querySelector("#f_priority").value,
            assigneeId: container.querySelector("#f_assignee").value || null,
            dueDate: container.querySelector("#f_due").value || null,
            milestoneId: container.querySelector("#f_milestone").value || null,
            tags: container
              .querySelector("#f_tags")
              .value.split(/[,，]/)
              .map((x) => x.trim())
              .filter(Boolean),
          };
          if (isEdit) PM.store.updateTask(taskId, data);
          else PM.store.addTask(data);
          PM.ui.toast(isEdit ? "任务已更新" : "任务已创建", "ok");
          close();
        };
        container.querySelector("#f_title").addEventListener("keydown", (e) => {
          if (e.key === "Enter") save();
        });
        // 保存按钮
        const foot = document.querySelector(".modal-foot");
        if (foot) {
          foot.innerHTML = "";
          foot.appendChild(mkBtn("取消", "btn", close));
          if (isEdit) {
            foot.appendChild(
              mkBtn("删除", "btn btn-danger", () => {
                close();
                PM.ui.confirm("确定删除该任务？此操作不可撤销。", () => {
                  PM.store.deleteTask(taskId);
                  PM.ui.toast("任务已删除", "ok");
                });
              })
            );
          }
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
