/* ============================================================
   page: 仪表盘总览
   ============================================================ */
window.PM = window.PM || {};
PM.pages = PM.pages || {};

(function () {
  const U = PM.utils;
  const C = PM.constants;
  const Charts = PM.charts;

  function statCard(label, value, foot, color) {
    return (
      '<div class="stat"><span class="stat-bar" style="background:' + (color || "var(--accent)") + '"></span>' +
      '<div class="stat-label">' + label + "</div>" +
      '<div class="stat-value">' + value + "</div>" +
      (foot ? '<div class="stat-foot">' + foot + "</div>" : "") +
      "</div>"
    );
  }

  PM.pages.dashboard = {
    title: "仪表盘总览",
    actionLabel: "导出数据",
    action() {
      PM.io.exportJSON();
    },

    render(c) {
      const s = PM.store.get();
      const tasks = s.tasks;
      const total = tasks.length;
      const done = tasks.filter((t) => t.status === "done").length;
      const doing = tasks.filter((t) => t.status === "doing").length;
      const todo = tasks.filter((t) => t.status === "todo").length;
      const backlog = tasks.filter((t) => t.status === "backlog").length;
      const overdue = tasks.filter((t) => t.status !== "done" && t.dueDate && U.isOverdue(t.dueDate, t.status)).length;
      const rate = total ? Math.round((done / total) * 100) : 0;

      /* ---- 状态分布 ---- */
      const statusItems = C.STATUSES.map((st) => ({
        label: PM.store.statusLabel(st.key),
        value: tasks.filter((t) => t.status === st.key).length,
        color: st.color,
      }));
      const statusLegend =
        '<div class="legend">' +
        statusItems
          .map(
            (it) =>
              '<span class="legend-item"><span class="swatch" style="background:' +
              it.color +
              '"></span>' +
              it.label +
              " " +
              it.value +
              "</span>"
          )
          .join("") +
        "</div>";

      /* ---- 优先级分布 ---- */
      const prioItems = C.PRIORITIES.map((p) => ({
        label: p.label,
        value: tasks.filter((t) => t.priority === p.key).length,
        color: p.color,
      }));

      /* ---- 成员负载 ---- */
      const memberItems = s.members
        .map((m) => {
          const w = PM.store.memberWorkload(m.id);
          return { label: m.name, value: w.total, color: m.color };
        })
        .sort((a, b) => b.value - a.value);

      /* ---- 近 7 天完成趋势 ---- */
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = U.fmtDate(d);
        const label = d.getMonth() + 1 + "/" + d.getDate();
        const value = tasks.filter(
          (t) => t.status === "done" && t.completedAt && t.completedAt.slice(0, 10) === iso
        ).length;
        trend.push({ label, value, color: "#10b981" });
      }

      /* ---- 即将到期 ---- */
      const upcoming = tasks
        .filter((t) => t.status !== "done" && t.dueDate)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 6);

      c.innerHTML =
        // 统计卡片
        '<div class="grid stats-grid" style="margin-bottom:18px">' +
        statCard("总任务", total, "需求池 " + backlog + " · 待办 " + todo, "#4f7cff") +
        statCard("进行中", doing, "占总量 " + (total ? Math.round((doing / total) * 100) : 0) + "%", "#f59e0b") +
        statCard("已完成", done, "占总量 " + rate + "%", "#10b981") +
        statCard("逾期任务", overdue, overdue ? "需尽快处理" : "无逾期，状态良好", overdue ? "#ef4444" : "#10b981") +
        statCard("团队成员", s.members.length, "共 " + s.members.length + " 人协作", "#8b5cf6") +
        statCard("完成率", rate + "%", "已交付 " + done + " / " + total, "#4f7cff") +
        "</div>" +

        // 状态分布 + 成员负载
        '<div class="grid dash-grid" style="margin-bottom:18px">' +
        '<div class="card card-pad">' +
        '<div class="card-title">任务状态分布</div>' +
        '<div class="chart-wrap">' + Charts.donut(statusItems) + "</div>" +
        statusLegend +
        "</div>" +
        '<div class="card card-pad">' +
        '<div class="card-title">成员负载 <span class="sub">（负责任务数）</span></div>' +
        (memberItems.length ? Charts.barH(memberItems) : emptyHtml("暂无成员")) +
        "</div>" +
        "</div>" +

        // 趋势 + 即将到期
        '<div class="grid cols-2">' +
        '<div class="card card-pad">' +
        '<div class="card-title">近 7 天完成趋势</div>' +
        '<div class="chart-wrap">' + Charts.barV(trend, { w: 360, h: 180 }) + "</div>" +
        "</div>" +
        '<div class="card card-pad">' +
        '<div class="card-title">即将到期 <span class="sub">（按截止日）</span></div>' +
        (upcoming.length ? upcomingList(upcoming) : emptyHtml("未来没有待办截止任务 🎉")) +
        "</div>" +
        "</div>";

      // 子标题
      const sub = document.getElementById("pageSub");
      if (sub) sub.textContent = s.project.name;
    },
  };

  function upcomingList(list) {
    const rows = list
      .map((t) => {
        const m = PM.store.member(t.assigneeId);
        const overdue = U.isOverdue(t.dueDate, t.status);
        return (
          '<div class="mini-item">' +
          PM.ui.priorityBadge(t.priority) +
          '<div class="mi-main">' +
          '<div class="mi-title">' + U.escapeHtml(t.title) + "</div>" +
          '<div class="mi-sub">' + (m ? U.escapeHtml(m.name) : "未指派") + "</div>" +
          "</div>" +
          '<div class="kc-due' + (overdue ? " overdue" : "") + '">' +
          (overdue ? "⚠ " : "") + U.friendlyDate(t.dueDate) +
          "</div>" +
          "</div>"
        );
      })
      .join("");
    return '<div class="mini-list">' + rows + "</div>";
  }

  function emptyHtml(text) {
    return '<div class="empty"><div class="eicon">✓</div><div>' + U.escapeHtml(text) + "</div></div>";
  }
})();
