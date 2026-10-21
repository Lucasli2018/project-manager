# 项目管理 WebApp（Project Manager）

一个**零依赖、纯前端**的多项目任务管理与团队协作工具。无需后端、无需构建，双击即用，数据保存在浏览器 `localStorage`。

![tech](https://img.shields.io/badge/tech-HTML%2FCSS%2FJS-orange) ![license](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ 功能特性

- **多项目支持**：顶栏一键切换 / 新建 / 管理项目，每个项目拥有独立的任务、成员与里程碑，强调色可单独配置。
- **仪表盘总览**：统计卡片（任务数 / 成员数 / 完成率 / 逾期数）+ 纯手写 SVG 图表（状态分布环形图、优先级条形图、成员负载、近 7 天完成趋势、即将到期、里程碑进度）。
- **任务看板**：4 列（需求池 / 待办 / 进行中 / 已完成），HTML5 拖拽跨列与排序；顶部搜索框 + 负责人 / 优先级 / 标签 / 里程碑多重筛选；新建 / 编辑 / 删除任务模态框。
- **团队成员管理**：成员卡片增删改、头像色块、负载统计。
- **项目设置**：项目名 / 描述 / 强调色 / 状态列名编辑、里程碑管理、JSON 导入导出（备份迁移）、一键重置数据。
- **里程碑（Milestone）**：按项目维护，可设截止日期与颜色；删除里程碑自动解绑关联任务；仪表盘与看板均支持里程碑维度展示与筛选。
- **数据本地持久化**：全部数据存于 `localStorage`，离线可用，无隐私外泄。

---

## 🛠 技术栈

| 维度 | 方案 |
| --- | --- |
| 语言 | 原生 HTML / CSS / JavaScript（ES5+） |
| 依赖 | **零第三方库、零构建步骤** |
| 架构 | 模块化 classic script，共享全局 `PM` 命名空间 |
| 存储 | 浏览器 `localStorage` |
| 图表 | 纯手写 SVG（无图表库） |
| 主题 | 现代中性蓝灰 + 可切换强调色 |

---

## 📁 目录结构

```
project-manager/
├─ index.html                 # 入口：侧边栏 + 顶栏（项目切换器）+ 路由容器
├─ README.md
└─ src/
   ├─ css/
   │  ├─ 01-tokens.css        # 设计变量（颜色 / 间距 / 圆角）
   │  ├─ 02-base.css          # 基础重置与排版
   │  ├─ 03-components.css    # 卡片 / 按钮 / 模态框 / 进度条等组件
   │  └─ 04-layout.css        # 侧边栏 / 顶栏 / 主区布局
   └─ js/
      ├─ core/
      │  ├─ utils.js          # 通用工具（uid / 日期 / DOM 助手）
      │  ├─ constants.js      # 状态列 / 优先级配置
      │  ├─ store.js          # 多项目状态管理 + localStorage 持久化 + 迁移
      │  ├─ router.js         # hash 路由
      │  └─ ui.js             # 模态框 / Toast / 确认框 / 头像助手
      ├─ data/
      │  └─ seed.js           # 演示数据（2 个项目 + 成员 / 任务 / 里程碑）
      ├─ features/
      │  ├─ charts.js         # SVG 图表（环形 / 条形 / 柱状）
      │  ├─ dnd.js            # 看板拖拽逻辑
      │  └─ importexport.js   # JSON 导入导出
      ├─ pages/
      │  ├─ dashboard.js      # 仪表盘总览
      │  ├─ kanban.js         # 任务看板
      │  ├─ team.js           # 团队成员管理
      │  └─ settings.js       # 项目设置 + 里程碑管理
      └─ boot.js              # 串联路由 / 侧边栏 / 顶栏 / 强调色
```

---

## 🚀 快速开始

### 方式一：直接打开
双击 `index.html` 即可使用（首次加载自动灌入演示数据）。

> 建议通过本地静态服务器打开，以避免个别浏览器对 `file://` 下 `localStorage` 的限制：

```bash
# 任选其一
python -m http.server 8080
# 或
npx serve .
```

然后访问 `http://localhost:8080`。

### 方式二：部署后访问
见下方「部署」章节。

---

## ☁️ 部署（Cloudflare Pages）

纯静态站点，可直接托管到 Cloudflare Pages / Gitee Pages / 任意静态服务器：

1. 将本仓库连接到 Cloudflare Pages（或 Gitee Pages）。
2. 构建设置：
   - **构建命令**：留空（无需构建）
   - **输出目录**：仓库根目录（即 `index.html` 所在目录）
3. 部署完成后即可通过分配的域名访问。

---

## 💾 数据存储与迁移

- 所有数据保存在浏览器 `localStorage`，键名为 `pm_state_v2`。
- 旧版 `pm_state_v1`（单项目结构）会在首次加载时**自动迁移**为当前多项目结构，无需手动操作。
- 通过「项目设置 → 数据 → 导出」可下载完整 JSON 备份；「导入」可还原或迁移数据。

---

## 🧭 使用提示

- 顶栏左侧胶囊为**项目切换器**：点击切换项目，或新建 / 管理项目。
- 看板列名、强调色、状态顺序均可在「项目设置」中自定义。
- 删除成员会将其名下任务自动置为「未分配」；删除里程碑会解绑关联任务。

---

## 📄 许可

MIT License © 2026
