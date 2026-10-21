/* ============================================================
   store — 状态管理（localStorage 持久化 + 订阅 + 多项目）
   结构：
   state = {
     version: 2,
     currentProjectId: <id>,
     projects: { [id]: Project }
   }
   Project = { id, name, description, accent, statusLabels,
               members:[], tasks:[], milestones:[] }
   ============================================================ */
window.PM = window.PM || {};

(function () {
  const KEY = "pm_state_v2";
  const OLD_KEY = "pm_state_v1";
  const subscribers = [];
  const U = PM.utils;

  // 取某 state 下的当前项目
  function projOf(s) {
    return s.projects[s.currentProjectId];
  }

  const Store = {
    state: null,

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.projects && parsed.currentProjectId) {
            this.state = parsed;
            if (!this.state.projects[this.state.currentProjectId]) {
              this.state.currentProjectId = Object.keys(this.state.projects)[0];
            }
            return this.state;
          }
        } else {
          // 迁移旧版（单项目）数据
          const oldRaw = localStorage.getItem(OLD_KEY);
          if (oldRaw) {
            const old = JSON.parse(oldRaw);
            if (old && old.tasks && old.members && old.project) {
              this.state = this._wrapLegacy(old);
              try { localStorage.removeItem(OLD_KEY); } catch (e) {}
              this.save();
              return this.state;
            }
          }
        }
      } catch (e) {
        console.warn("store load failed", e);
      }
      this.state = PM.seed();
      this.save();
      return this.state;
    },

    _wrapLegacy(old) {
      const id = U.uid("proj");
      const proj = {
        id,
        name: (old.project && old.project.name) || "我的项目",
        description: (old.project && old.project.description) || "",
        accent: (old.project && old.project.accent) || "#4f7cff",
        statusLabels: (old.project && old.project.statusLabels) || {},
        members: (old.members || []).map((m) => Object.assign({}, m)),
        tasks: (old.tasks || []).map((t) => Object.assign({}, t, { milestoneId: null })),
        milestones: [],
      };
      return { version: 2, currentProjectId: id, projects: { [id]: proj } };
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

    // 当前项目对象
    current() {
      return projOf(this.state);
    },
    currentId() {
      return this.state.currentProjectId;
    },
    projectIds() {
      return Object.keys(this.state.projects);
    },

    setCurrentProject(id) {
      if (!this.state.projects[id]) return;
      this.state.currentProjectId = id;
      this.save();
      this.emit();
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
      const ov = this.current().statusLabels;
      if (ov && ov[key]) return ov[key];
      return PM.constants.statusLabel(key);
    },

    /* ---------- 任务（作用于当前项目） ---------- */
    tasksByStatus(status) {
      return this.current()
        .tasks.filter((t) => t.status === status)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    _maxOrder(tasks, status) {
      return tasks.filter((t) => t.status === status).reduce((m, t) => Math.max(m, t.order || 0), -1);
    },

    addTask(data) {
      const pj = this.current();
      const t = {
        id: U.uid("task"),
        title: data.title || "未命名任务",
        desc: data.desc || "",
        status: data.status || "backlog",
        priority: data.priority || "medium",
        assigneeId: data.assigneeId || null,
        milestoneId: data.milestoneId || null,
        tags: data.tags || [],
        dueDate: data.dueDate || null,
        createdAt: new Date().toISOString(),
        completedAt: null,
        order: 0,
      };
      this.update((s) => {
        const proj = projOf(s);
        t.order = this._maxOrder(proj.tasks, t.status) + 1;
        proj.tasks.push(t);
      });
      return t;
    },

    updateTask(id, patch) {
      this.update((s) => {
        const t = projOf(s).tasks.find((x) => x.id === id);
        if (!t) return;
        Object.assign(t, patch);
        if (t.status === "done" && !t.completedAt) t.completedAt = new Date().toISOString();
        if (t.status !== "done") t.completedAt = null;
      });
    },

    deleteTask(id) {
      this.update((s) => {
        const pj = projOf(s);
        pj.tasks = pj.tasks.filter((t) => t.id !== id);
      });
    },

    // 拖拽移动：改变状态并支持在 beforeId 之前插入
    moveTask(id, newStatus, beforeId) {
      this.update((s) => {
        const pj = projOf(s);
        const t = pj.tasks.find((x) => x.id === id);
        if (!t) return;
        t.status = newStatus;
        if (newStatus === "done" && !t.completedAt) t.completedAt = new Date().toISOString();
        if (newStatus !== "done") t.completedAt = null;

        const list = pj.tasks
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

    /* ---------- 成员（作用于当前项目） ---------- */
    member(id) {
      return this.current().members.find((m) => m.id === id) || null;
    },

    memberWorkload(id) {
      const tasks = this.current().tasks.filter((t) => t.assigneeId === id);
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
      this.update((s) => projOf(s).members.push(m));
      return m;
    },

    updateMember(id, patch) {
      this.update((s) => {
        const m = projOf(s).members.find((x) => x.id === id);
        if (m) Object.assign(m, patch);
      });
    },

    deleteMember(id) {
      this.update((s) => {
        const pj = projOf(s);
        pj.members = pj.members.filter((m) => m.id !== id);
        // 相关任务取消指派
        pj.tasks.forEach((t) => {
          if (t.assigneeId === id) t.assigneeId = null;
        });
      });
    },

    /* ---------- 项目设置（当前项目） ---------- */
    updateProject(patch) {
      this.update((s) => Object.assign(projOf(s), patch));
    },

    setStatusLabel(key, label) {
      this.update((s) => {
        const pj = projOf(s);
        pj.statusLabels = pj.statusLabels || {};
        pj.statusLabels[key] = label;
      });
    },

    /* ---------- 里程碑（当前项目） ---------- */
    milestone(id) {
      return this.current().milestones.find((m) => m.id === id) || null;
    },

    addMilestone(data) {
      const m = {
        id: U.uid("ms"),
        name: data.name || "新里程碑",
        desc: data.desc || "",
        dueDate: data.dueDate || null,
        color: data.color || "#4f7cff",
      };
      this.update((s) => projOf(s).milestones.push(m));
      return m;
    },

    updateMilestone(id, patch) {
      this.update((s) => {
        const m = projOf(s).milestones.find((x) => x.id === id);
        if (m) Object.assign(m, patch);
      });
    },

    deleteMilestone(id) {
      this.update((s) => {
        const pj = projOf(s);
        pj.milestones = pj.milestones.filter((m) => m.id !== id);
        pj.tasks.forEach((t) => {
          if (t.milestoneId === id) t.milestoneId = null;
        });
      });
    },

    milestoneProgress(id) {
      const pj = this.current();
      const ms = pj.milestones.find((m) => m.id === id);
      if (!ms) return { total: 0, done: 0, pct: 0, overdue: false };
      const linked = pj.tasks.filter((t) => t.milestoneId === id);
      const total = linked.length;
      const done = linked.filter((t) => t.status === "done").length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const overdue = !!(ms.dueDate && ms.dueDate < U.todayISO() && done < total);
      return { total, done, pct, overdue };
    },

    /* ---------- 项目 CRUD ---------- */
    addProject(data) {
      const id = U.uid("proj");
      const name = data.name || "新项目";
      const accent = data.accent || U.colorFromName(name);
      const proj = {
        id,
        name,
        description: data.description || "",
        accent,
        statusLabels: {},
        members: [],
        tasks: [],
        milestones: [],
      };
      this.update((s) => {
        s.projects[id] = proj;
        s.currentProjectId = id;
      });
      return proj;
    },

    updateProjectMeta(id, patch) {
      this.update((s) => {
        if (s.projects[id]) Object.assign(s.projects[id], patch);
      });
    },

    deleteProject(id) {
      this.update((s) => {
        delete s.projects[id];
        const ids = Object.keys(s.projects);
        if (!ids.length) {
          const nid = U.uid("proj");
          s.projects[nid] = {
            id: nid,
            name: "新项目",
            description: "",
            accent: "#4f7cff",
            statusLabels: {},
            members: [],
            tasks: [],
            milestones: [],
          };
          s.currentProjectId = nid;
        } else if (s.currentProjectId === id) {
          s.currentProjectId = ids[0];
        }
      });
    },

    /* ---------- 导入 / 导出 / 重置 ---------- */
    exportData() {
      return JSON.parse(JSON.stringify(this.state));
    },

    importData(obj) {
      // 新版多项目格式
      if (obj && obj.projects && obj.currentProjectId && obj.projects[obj.currentProjectId]) {
        this.update((s) => {
          s.version = 2;
          s.currentProjectId = obj.currentProjectId;
          s.projects = obj.projects;
        });
        return;
      }
      // 旧版单项目格式：包裹成单项目
      if (obj && obj.tasks && obj.members && obj.project) {
        this.update((s) => {
          Object.assign(s, this._wrapLegacy(obj));
        });
        return;
      }
      throw new Error("数据格式不正确");
    },

    reset() {
      this.state = PM.seed();
      this.save();
      this.emit();
    },
  };

  PM.store = Store;
})();
