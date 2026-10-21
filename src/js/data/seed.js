/* ============================================================
   seed — 默认演示数据
   ============================================================ */
window.PM = window.PM || {};

PM.seed = function () {
  const U = PM.utils;

  // 计算 N 天前 的 ISO 日期（用于已完成任务的完成时间）
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

  const members = [
    { id: "mem_amy", name: "陈晓雅", role: "产品经理", email: "amy@studio.dev", color: "#4f7cff" },
    { id: "mem_bob", name: "李伟", role: "前端工程师", email: "bob@studio.dev", color: "#10b981" },
    { id: "mem_cindy", name: "王诗涵", role: "UI 设计师", email: "cindy@studio.dev", color: "#f59e0b" },
    { id: "mem_dan", name: "张涛", role: "后端工程师", email: "dan@studio.dev", color: "#8b5cf6" },
    { id: "mem_eve", name: "刘洋", role: "测试工程师", email: "eve@studio.dev", color: "#ec4899" },
  ];

  const tasks = [
    // 需求池
    { id: "t1", title: "竞品功能调研报告", desc: "整理 3 款同类产品的核心功能对比", status: "backlog", priority: "low", assigneeId: "mem_amy", tags: ["调研"], dueDate: daysAheadISO(12), createdAt: isoDateTime(daysAgoISO(8)), completedAt: null, order: 0 },
    { id: "t2", title: "用户增长方案构思", desc: "", status: "backlog", priority: "medium", assigneeId: null, tags: ["增长"], dueDate: null, createdAt: isoDateTime(daysAgoISO(6)), completedAt: null, order: 1 },
    { id: "t3", title: "国际化（i18n）预研", desc: "评估多语言框架接入成本", status: "backlog", priority: "low", assigneeId: "mem_dan", tags: ["技术"], dueDate: daysAheadISO(20), createdAt: isoDateTime(daysAgoISO(5)), completedAt: null, order: 2 },

    // 待办
    { id: "t4", title: "看板拖拽交互开发", desc: "支持跨列拖拽与列内排序", status: "todo", priority: "high", assigneeId: "mem_bob", tags: ["前端", "核心"], dueDate: daysAheadISO(3), createdAt: isoDateTime(daysAgoISO(4)), completedAt: null, order: 0 },
    { id: "t5", title: "仪表盘图表组件", desc: "状态分布 / 优先级 / 成员负载", status: "todo", priority: "medium", assigneeId: "mem_cindy", tags: ["前端", "可视化"], dueDate: daysAheadISO(5), createdAt: isoDateTime(daysAgoISO(4)), completedAt: null, order: 1 },
    { id: "t6", title: "数据导入导出接口", desc: "JSON 备份与恢复", status: "todo", priority: "medium", assigneeId: "mem_dan", tags: ["后端"], dueDate: daysAheadISO(6), createdAt: isoDateTime(daysAgoISO(3)), completedAt: null, order: 2 },

    // 进行中
    { id: "t7", title: "团队成员管理页", desc: "增删改与负载统计", status: "doing", priority: "high", assigneeId: "mem_bob", tags: ["前端"], dueDate: daysAheadISO(2), createdAt: isoDateTime(daysAgoISO(3)), completedAt: null, order: 0 },
    { id: "t8", title: "项目设置页布局", desc: "主题色 / 列名 / 危险区", status: "doing", priority: "urgent", assigneeId: "mem_cindy", tags: ["前端", "设计"], dueDate: daysAheadISO(1), createdAt: isoDateTime(daysAgoISO(2)), completedAt: null, order: 1 },
    { id: "t9", title: "本地存储状态层", desc: "订阅式 store", status: "doing", priority: "high", assigneeId: "mem_dan", tags: ["核心"], dueDate: daysAheadISO(1), createdAt: isoDateTime(daysAgoISO(2)), completedAt: null, order: 2 },

    // 已完成
    { id: "t10", title: "需求评审会", desc: "", status: "done", priority: "medium", assigneeId: "mem_amy", tags: ["会议"], dueDate: daysAgoISO(2), createdAt: isoDateTime(daysAgoISO(7)), completedAt: isoDateTime(daysAgoISO(6)), order: 0 },
    { id: "t11", title: "项目原型设计", desc: "低保真线框", status: "done", priority: "high", assigneeId: "mem_cindy", tags: ["设计"], dueDate: daysAgoISO(3), createdAt: isoDateTime(daysAgoISO(7)), completedAt: isoDateTime(daysAgoISO(5)), order: 1 },
    { id: "t12", title: "技术选型确认", desc: "零依赖 SPA + localStorage", status: "done", priority: "urgent", assigneeId: "mem_dan", tags: ["技术"], dueDate: daysAgoISO(4), createdAt: isoDateTime(daysAgoISO(7)), completedAt: isoDateTime(daysAgoISO(4)), order: 2 },
    { id: "t13", title: "搭建项目骨架", desc: "目录与路由", status: "done", priority: "medium", assigneeId: "mem_bob", tags: ["核心"], dueDate: daysAgoISO(3), createdAt: isoDateTime(daysAgoISO(6)), completedAt: isoDateTime(daysAgoISO(3)), order: 3 },
    { id: "t14", title: "页面风格规范", desc: "蓝灰主题令牌", status: "done", priority: "low", assigneeId: "mem_cindy", tags: ["设计"], dueDate: daysAgoISO(5), createdAt: isoDateTime(daysAgoISO(8)), completedAt: isoDateTime(daysAgoISO(2)), order: 4 },
  ];

  return {
    project: {
      name: "星辰研发项目",
      description: "面向中小型团队的轻量项目管理工具，零依赖、纯本地存储。",
      accent: "#4f7cff",
      statusLabels: {},
    },
    members,
    tasks,
  };
};
