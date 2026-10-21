/* ============================================================
   store — 状态管理（localStorage 持久化 + 订阅）
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const KEY = "pm_state_v1";
  const subscribers = [];
  const U = PM.utils;

  const Store = {
    state: null,

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.tasks && parsed.members) {
            this.state = parsed;
            return this.state;
          }
        }
      } catch (e) {
        console.warn("store load failed", e);
      }
      this.state = PM.seed();
      this.save();
      return this.state;
    },

    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn("store save failed", e);
      }
    },

    get() {
      return this.state;
    },

    // fn(state) 直接修改；opts.silent 时不触发刷新
    update(fn, opts) {
      fn(this.state);
      this.save();
      if (!opts || !opts.silent) this.emit();
    },

    set(patch, opts) {
      Object.assign(this.state, patch);
      this.save();
      if (!opts || !opts.silent) this.emit();
    },

    subscribe(fn) {
      subscribers.push(fn);
    },

    emit() {
      subscribers.forEach((fn) => {
        try {
          fn(this.state);
        } catch (e) {
          console.error(e);
        }
      });
    },

    /* ---------- 标签覆盖（项目设置可重命名列） ---------- */
    statusLabel(key) {
      const ov = this.state.project.statusLabels;
      if (ov && ov[key]) return ov[key];
      return PM.constants.statusLabel(key);
    },

    /* ---------- 任务 ---------- */
    tasksByStatus(status) {
      return this.state.tasks
        .filter((t) => t.status === status)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    maxOrder(status) {
      const list = this.state.tasks.filter((t) => t.status === status);
      return list.reduce((m, t) => Math.max(m, t.order || 0), -1);
    },

    addTask(data) {
      const t = {
        id: U.uid("task"),
        title: data.title || "未命名任务",
        desc: data.desc || "",
        status: data.status || "backlog",
        priority: data.priority || "medium",
        assigneeId: data.assigneeId || null,
        tags: data.tags || [],
        dueDate: data.dueDate || null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        order: 0,
      };
      this.update((s) => {
        t.order = this.maxOrder(t.status) + 1;
        s.tasks.push(t);
      });
      return t;
    },

    updateTask(id, patch) {
      this.update((s) => {
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return;
        Object.assign(t, patch);
        if (t.status === "done" && !t.completedAt) t.completedAt = new Date().toISOString();
        if (t.status !== "done") t.completedAt = null;
      });
    },

    deleteTask(id) {
      this.update((s) => {
        s.tasks = s.tasks.filter((t) => t.id !== id);
      });
    },

    // 拖拽移动：改变状态并支持在 beforeId 之前插入
    moveTask(id, newStatus, beforeId) {
      this.update((s) => {
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return;
        t.status = newStatus;
        if (newStatus === "done" && !t.completedAt) t.completedAt = new Date().toISOString();
        if (newStatus !== "done") t.completedAt = null;

        const list = s.tasks
          .filter((x) => x.status === newStatus && x.id !== id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        let idx = list.length;
        if (beforeId) {
          const bi = list.findIndex((x) => x.id === beforeId);
          if (bi >= 0) idx = bi;
        }
        list.splice(idx, 0, t);
        list.forEach((x, i) => (x.order = i));
      });
    },

    /* ---------- 成员 ---------- */
    member(id) {
      return this.state.members.find((m) => m.id === id) || null;
    },

    memberWorkload(id) {
      const tasks = this.state.tasks.filter((t) => t.assigneeId === id);
      return {
        total: tasks.length,
        done: tasks.filter((t) => t.status === "done").length,
        active: tasks.filter((t) => t.status !== "done").length,
      };
    },

    addMember(data) {
      const m = {
        id: U.uid("mem"),
        name: data.name || "新成员",
        role: data.role || "",
        email: data.email || "",
        color: data.color || U.colorFromName(data.name),
      };
      this.update((s) => s.members.push(m));
      return m;
    },

    updateMember(id, patch) {
      this.update((s) => {
        const m = s.members.find((x) => x.id === id);
        if (m) Object.assign(m, patch);
      });
    },

    deleteMember(id) {
      this.update((s) => {
        s.members = s.members.filter((m) => m.id !== id);
        // 相关任务取消指派
        s.tasks.forEach((t) => {
          if (t.assigneeId === id) t.assigneeId = null;
        });
      });
    },

    /* ---------- 项目设置 ---------- */
    updateProject(patch) {
      this.update((s) => Object.assign(s.project, patch));
    },

    setStatusLabel(key, label) {
      this.update((s) => {
        s.project.statusLabels = s.project.statusLabels || {};
        s.project.statusLabels[key] = label;
      });
    },

    /* ---------- 导入 / 导出 / 重置 ---------- */
    exportData() {
      return JSON.parse(JSON.stringify(this.state));
    },

    importData(obj) {
      if (!obj || !Array.isArray(obj.tasks) || !Array.isArray(obj.members) || !obj.project) {
        throw new Error("数据格式不正确");
      }
      this.update((s) => {
        s.project = obj.project;
        s.members = obj.members;
        s.tasks = obj.tasks;
      });
    },

    reset() {
      this.update(() => {
        this.state = PM.seed();
      });
    },
  };

  PM.store = Store;
})();
