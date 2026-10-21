/* ============================================================
   constants — 状态列 / 优先级 配置
   ============================================================ */
window.PM = window.PM || {};

PM.constants = {
  // 看板列（顺序即展示顺序）
  STATUSES: [
    { key: "backlog", label: "需求池", color: "#64748b" },
    { key: "todo", label: "待办", color: "#3b82f6" },
    { key: "doing", label: "进行中", color: "#f59e0b" },
    { key: "done", label: "已完成", color: "#10b981" },
  ],
  PRIORITIES: [
    { key: "low", label: "低", color: "#94a3b8" },
    { key: "medium", label: "中", color: "#3b82f6" },
    { key: "high", label: "高", color: "#f59e0b" },
    { key: "urgent", label: "紧急", color: "#ef4444" },
  ],

  statusLabel(key) {
    const s = this.STATUSES.find((x) => x.key === key);
    return s ? s.label : key;
  },
  statusColor(key) {
    const s = this.STATUSES.find((x) => x.key === key);
    return s ? s.color : "#64748b";
  },
  priorityLabel(key) {
    const p = this.PRIORITIES.find((x) => x.key === key);
    return p ? p.label : key;
  },
  priorityColor(key) {
    const p = this.PRIORITIES.find((x) => x.key === key);
    return p ? p.color : "#94a3b8";
  },

  // 看板列顺序
  statusKeys() {
    return this.STATUSES.map((s) => s.key);
  },
};
