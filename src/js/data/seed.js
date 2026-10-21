/* ============================================================
   seed — 默认演示数据（多项目结构）
   ============================================================ */
window.PM = window.PM || {};

PM.seed = function () {
  const U = PM.utils;

  function daysAgoISO(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return U.fmtDate(d);
  }
  function daysAheadISO(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return U.fmtDate(d);
  }
  function isoDateTime(dateISO) {
    return dateISO + "T10:00:00.000Z";
  }
  // 为一组任务按状态分配 order
  function orderByStatus(tasks) {
    const counters = {};
    tasks.forEach((t) => {
      counters[t.status] = (counters[t.status] || 0);
      t.order = counters[t.status]++;
    });
    return tasks;
  }

  /* ---------------- 项目一：星辰研发项目 ---------------- */
  const membersA = [
    { id: "mem_amy", name: "陈晓雅", role: "产品经理", email: "amy@studio.dev", color: "#4f7cff" },
    { id: "mem_bob", name: "李伟", role: "前端工程师", email: "bob@studio.dev", color: "#10b981" },
    { id: "mem_cindy", name: "王诗涵", role: "UI 设计师", email: "cindy@studio.dev", color: "#f59e0b" },
    { id: "mem_dan", name: "张涛", role: "后端工程师", email: "dan@studio.dev", color: "#8b5cf6" },
    { id: "mem_eve", name: "刘洋", role: "测试工程师", email: "eve@studio.dev", color: "#ec4899" },
  ];

  const tasksA = orderByStatus([
    { id: "t1", title: "竞品功能调研报告", desc: "整理 3 款同类产品的核心功能对比", status: "backlog", priority: "low", assigneeId: "mem_amy", tags: ["调研"], dueDate: daysAheadISO(12), createdAt: isoDateTime(daysAgoISO(8)), completedAt: null },
    { id: "t2", title: "用户增长方案构思", desc: "", status: "backlog", priority: "medium", assigneeId: null, tags: ["增长"], dueDate: null, createdAt: isoDateTime(daysAgoISO(6)), completedAt: null },
    { id: "t3", title: "国际化（i18n）预研", desc: "评估多语言框架接入成本", status: "backlog", priority: "low", assigneeId: "mem_dan", tags: ["技术"], dueDate: daysAheadISO(20), createdAt: isoDateTime(daysAgoISO(5)), completedAt: null },

    { id: "t4", title: "看板拖拽交互开发", desc: "支持跨列拖拽与列内排序", status: "todo", priority: "high", assigneeId: "mem_bob", tags: ["前端", "核心"], dueDate: daysAheadISO(3), createdAt: isoDateTime(daysAgoISO(4)), completedAt: null },
    { id: "t5", title: "仪表盘图表组件", desc: "状态分布 / 优先级 / 成员负载", status: "todo", priority: "medium", assigneeId: "mem_cindy", tags: ["前端", "可视化"], dueDate: daysAheadISO(5), createdAt: isoDateTime(daysAgoISO(4)), completedAt: null },
    { id: "t6", title: "数据导入导出接口", desc: "JSON 备份与恢复", status: "todo", priority: "medium", assigneeId: "mem_dan", tags: ["后端"], dueDate: daysAheadISO(6), createdAt: isoDateTime(daysAgoISO(3)), completedAt: null },

    { id: "t7", title: "团队成员管理页", desc: "增删改与负载统计", status: "doing", priority: "high", assigneeId: "mem_bob", tags: ["前端"], dueDate: daysAheadISO(2), createdAt: isoDateTime(daysAgoISO(3)), completedAt: null },
    { id: "t8", title: "项目设置页布局", desc: "主题色 / 列名 / 危险区", status: "doing", priority: "urgent", assigneeId: "mem_cindy", tags: ["前端", "设计"], dueDate: daysAheadISO(1), createdAt: isoDateTime(daysAgoISO(2)), completedAt: null },
    { id: "t9", title: "本地存储状态层", desc: "订阅式 store", status: "doing", priority: "high", assigneeId: "mem_dan", tags: ["核心"], dueDate: daysAheadISO(1), createdAt: isoDateTime(daysAgoISO(2)), completedAt: null },

    { id: "t10", title: "需求评审会", desc: "", status: "done", priority: "medium", assigneeId: "mem_amy", tags: ["会议"], dueDate: daysAgoISO(2), createdAt: isoDateTime(daysAgoISO(7)), completedAt: isoDateTime(daysAgoISO(6)) },
    { id: "t11", title: "项目原型设计", desc: "低保真线框", status: "done", priority: "high", assigneeId: "mem_cindy", tags: ["设计"], dueDate: daysAgoISO(3), createdAt: isoDateTime(daysAgoISO(7)), completedAt: isoDateTime(daysAgoISO(5)) },
    { id: "t12", title: "技术选型确认", desc: "零依赖 SPA + localStorage", status: "done", priority: "urgent", assigneeId: "mem_dan", tags: ["技术"], dueDate: daysAgoISO(4), createdAt: isoDateTime(daysAgoISO(7)), completedAt: isoDateTime(daysAgoISO(4)) },
    { id: "t13", title: "搭建项目骨架", desc: "目录与路由", status: "done", priority: "medium", assigneeId: "mem_bob", tags: ["核心"], dueDate: daysAgoISO(3), createdAt: isoDateTime(daysAgoISO(6)), completedAt: isoDateTime(daysAgoISO(3)) },
    { id: "t14", title: "页面风格规范", desc: "蓝灰主题令牌", status: "done", priority: "low", assigneeId: "mem_cindy", tags: ["设计"], dueDate: daysAgoISO(5), createdAt: isoDateTime(daysAgoISO(8)), completedAt: isoDateTime(daysAgoISO(2)) },
  ]);

  // 关联里程碑
  ["t10", "t11", "t12"].forEach((id) => { tasksA.find((t) => t.id === id).milestoneId = "ms_a1"; });
  ["t4", "t5", "t6", "t7", "t8", "t9"].forEach((id) => { tasksA.find((t) => t.id === id).milestoneId = "ms_a2"; });
  ["t1", "t2", "t3"].forEach((id) => { tasksA.find((t) => t.id === id).milestoneId = "ms_a3"; });

  const milestonesA = [
    { id: "ms_a1", name: "需求与设计", desc: "明确范围并完成原型", dueDate: daysAgoISO(1), color: "#10b981" },
    { id: "ms_a2", name: "核心开发", desc: "看板 / 仪表盘 / 设置", dueDate: daysAheadISO(5), color: "#4f7cff" },
    { id: "ms_a3", name: "公测上线", desc: "面向内测用户开放", dueDate: daysAheadISO(15), color: "#f59e0b" },
  ];

  /* ---------------- 项目二：移动端 App 改版 ---------------- */
  const membersB = [
    { id: "mb1", name: "赵敏", role: "产品经理", email: "zhao@studio.dev", color: "#ec4899" },
    { id: "mb2", name: "孙磊", role: "客户端工程师", email: "sun@studio.dev", color: "#06b6d4" },
    { id: "mb3", name: "周婷", role: "视觉设计师", email: "zhou@studio.dev", color: "#8b5cf6" },
  ];

  const tasksB = orderByStatus([
    { id: "b1", title: "信息架构梳理", desc: "重排底部导航与信息流", status: "doing", priority: "high", assigneeId: "mb1", tags: ["产品"], dueDate: daysAheadISO(4), createdAt: isoDateTime(daysAgoISO(3)), completedAt: null },
    { id: "b2", title: "导航栏组件开发", desc: "支持手势切换", status: "todo", priority: "medium", assigneeId: "mb2", tags: ["前端"], dueDate: daysAheadISO(6), createdAt: isoDateTime(daysAgoISO(2)), completedAt: null },
    { id: "b3", title: "首页视觉稿", desc: "高保真设计", status: "done", priority: "high", assigneeId: "mb3", tags: ["设计"], dueDate: daysAgoISO(3), createdAt: isoDateTime(daysAgoISO(6)), completedAt: isoDateTime(daysAgoISO(3)) },
    { id: "b4", title: "登录流程重构", desc: "一键登录 + 生物识别", status: "todo", priority: "urgent", assigneeId: "mb2", tags: ["前端", "核心"], dueDate: daysAheadISO(2), createdAt: isoDateTime(daysAgoISO(1)), completedAt: null },
    { id: "b5", title: "埋点方案设计", desc: "关键路径数据采集", status: "backlog", priority: "low", assigneeId: "mb1", tags: ["数据"], dueDate: daysAheadISO(10), createdAt: isoDateTime(daysAgoISO(2)), completedAt: null },
    { id: "b6", title: "首屏性能优化", desc: "冷启动 < 1.5s", status: "doing", priority: "medium", assigneeId: "mb2", tags: ["性能"], dueDate: daysAheadISO(8), createdAt: isoDateTime(daysAgoISO(1)), completedAt: null },
  ]);

  ["b2", "b3"].forEach((id) => { tasksB.find((t) => t.id === id).milestoneId = "ms_b1"; });
  ["b1", "b4", "b6"].forEach((id) => { tasksB.find((t) => t.id === id).milestoneId = "ms_b2"; });

  const milestonesB = [
    { id: "ms_b1", name: "设计交付", desc: "视觉与组件规范定稿", dueDate: daysAheadISO(5), color: "#ec4899" },
    { id: "ms_b2", name: "核心功能", desc: "导航 / 登录 / 性能", dueDate: daysAheadISO(12), color: "#06b6d4" },
  ];

  const projA = {
    id: "proj_xingchen",
    name: "星辰研发项目",
    description: "面向中小型团队的轻量项目管理工具，零依赖、纯本地存储。",
    accent: "#4f7cff",
    statusLabels: {},
    members: membersA,
    tasks: tasksA,
    milestones: milestonesA,
  };
  const projB = {
    id: "proj_mobile",
    name: "移动端 App 改版",
    description: "重做客户端信息架构与视觉，目标冷启动更快、操作更顺手。",
    accent: "#ec4899",
    statusLabels: {},
    members: membersB,
    tasks: tasksB,
    milestones: milestonesB,
  };

  return {
    version: 2,
    currentProjectId: "proj_xingchen",
    projects: { proj_xingchen: projA, proj_mobile: projB },
  };
};
