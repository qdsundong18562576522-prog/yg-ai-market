# 扬光AI商城 (yg-ai-market)

一站式 AI 应用管理平台 — 应用市场、安装管理、AI 对话。

---

## 快速启动

### 方式一：双击启动（推荐）

双击项目根目录的 `start.bat`，自动启动前后端。

### 方式二：手动启动

```bash
# 后端
cd backend
venv\Scripts\activate    # Windows
pip install -r requirements.txt
python run.py            # → http://localhost:12401

# 前端（新开终端）
cd frontend
npm install
npm run dev              # → http://localhost:12400
```

**默认账号**: `admin` / `admin123`（首次启动自动创建）

> 如果登录提示"登录失败"，检查后端是否在运行。

---

## 目录结构

```
yg-ai-market/
├── start.bat                    # 一键启动脚本
├── README.md                    # 本文档
│
├── frontend/                    # React + Vite
│   └── src/
│       ├── api/request.ts       # Axios 封装（拦截 401 跳转登录）
│       ├── components/          # 通用组件
│       │   ├── Layout.tsx       # 侧边栏 + 顶栏布局
│       │   ├── AppCard.tsx      # 应用卡片
│       │   ├── CarouselBanner.tsx # 轮播横幅
│       │   └── PrivateRoute.tsx # 路由守卫
│       ├── pages/               # 页面
│       │   ├── Login.tsx        # 登录
│       │   ├── Dashboard.tsx    # 首页
│       │   ├── AppMarket.tsx    # 应用市场
│       │   ├── MyApps.tsx       # 我的应用
│       │   ├── AppContainer.tsx # 应用容器（聊天/嵌入）
│       │   ├── ChatHistory.tsx  # 对话列表
│       │   ├── ChatDetail.tsx   # 对话详情
│       │   └── admin/           # 管理后台
│       │       ├── DashboardAdmin.tsx
│       │       ├── UserManage.tsx
│       │       └── AppManage.tsx
│       ├── contexts/AuthContext.tsx  # 登录态管理
│       ├── styles/design-tokens.css  # 设计令牌 CSS 变量
│       ├── theme/themeConfig.ts      # Ant Design 主题配置
│       └── utils/constants.ts        # 常量
│
├── backend/                     # FastAPI + SQLite
│   └── app/
│       ├── main.py              # 应用入口 + 路由注册
│       ├── config.py            # 配置（JWT密钥、数据库等）
│       ├── models.py            # 数据模型（User/App/ChatSession/ChatMessage）
│       ├── schemas.py           # Pydantic 请求/响应模型
│       ├── utils.py             # JWT 生成/验证 + 密码哈希
│       ├── database.py          # SQLAlchemy 异步数据库
│       ├── dependencies.py      # 依赖注入（获取当前用户）
│       └── routers/
│           ├── auth.py          # 登录/获取用户信息
│           ├── users.py         # 员工 CRUD
│           ├── apps.py          # 应用 CRUD
│           ├── user_apps.py     # 应用市场（安装/卸载）
│           ├── chat.py          # AI 对话（SSE 流式响应）
│           └── ai_gateway.py    # AI 模型网关
│
└── awesome-design-md-main/      # 设计风格参考库
```

---

## 设计系统 — Intercom 风格

### 色彩

| 令牌 | 色值 | 用途 |
|------|------|------|
| Canvas | `#f5f1ec` | 页面背景（暖白画布） |
| Surface-1 | `#ffffff` | 卡片背景 |
| Surface-2 | `#ebe7e1` | 次要背景 |
| Ink | `#111111` | 主文字/炭黑主色 |
| Ink Muted | `#626260` | 次要文字 |
| Ink Subtle | `#7b7b78` | 辅助文字 |
| Ink Tertiary | `#9c9fa5` | 禁用/占位文字 |
| Fin Orange | `#ff5600` | AI 强调色（评分/NEW标签） |
| Hairline | `#d3cec6` | 卡片边框（代替阴影） |

### 圆角

| 层级 | 值 | 用途 |
|------|-----|------|
| md | 8px | 按钮、输入框 |
| lg | 12px | 卡片、区块 |
| xl | 16px | 大卡片 |

### 核心原则

- **无阴影** — 卡片用 `1px solid #d3cec6` 边框代替阴影
- **白卡在暖底上分层** — 内容通过白色卡片在暖色画布上浮现
- **炭黑主色** — 按钮、标题、图标一律炭黑 `#111111`
- **Fin Orange 仅作强调** — 仅用于评分星星、NEW 标签等 AI 相关高亮

### 样式文件

- `frontend/src/styles/design-tokens.css` — CSS 变量（修改颜色/间距/圆角）
- `frontend/src/theme/themeConfig.ts` — Ant Design 主题（修改组件主题）
- CSS 工具类：`.page-container` `.section-card` `.app-grid`

### 更新样式

```css
/* 改颜色：修改 design-tokens.css 中的变量值 */
--canvas: #f5f1ec;     /* 页面背景 */
--ink: #111111;        /* 主文字 */
--hairline: #d3cec6;   /* 边框 */

/* 改圆角 */
--radius-md: 8px;      /* 按钮 */
--radius-lg: 12px;     /* 卡片 */
```

---

## API 路由

| 前缀 | 文件 | 说明 |
|------|------|------|
| `/api/v1/auth` | `routers/auth.py` | 登录、获取当前用户 |
| `/api/v1/users` | `routers/users.py` | 员工管理 CRUD |
| `/api/v1/apps` | `routers/apps.py` | 应用管理 CRUD |
| `/api/v1/market` | `routers/user_apps.py` | 应用市场（安装/卸载） |
| `/api/v1/ai` | `routers/chat.py` | AI 对话 SSE 流式接口 |
| `/api/v1/ai` | `routers/ai_gateway.py` | AI 模型网关 |

---

## 数据模型

| 模型 | 表名 | 说明 |
|------|------|------|
| User | `user` | 用户/员工 |
| App | `app` | AI 应用 |
| UserApp | `user_app` | 用户-应用安装关系 |
| ChatSession | `chat_session` | 对话会话 |
| ChatMessage | `chat_message` | 对话消息 |

接入模式：`api_call`（内置对话）/ `iframe`（嵌入）/ `external_link`（外链）

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| UI 库 | Ant Design 5 |
| HTTP | Axios |
| 后端框架 | Python 3.11+ / FastAPI |
| ORM | SQLAlchemy 2.0 (异步) |
| 数据库 | SQLite (aiosqlite) |
| 认证 | JWT (python-jose) + bcrypt |
| AI 网关 | 流式 SSE 响应 |
| 部署 | Nginx 反代 |

---

## 常见问题

**登录提示失败？**
→ 后端未启动。运行 `start.bat` 或手动启动后端。

**修改了样式不生效？**
→ CSS 变量改完刷新即可；`themeConfig.ts` 改完需 dev server 热更新。

**如何添加新页面？**
1. 在 `pages/` 下创建组件
2. 在 `App.tsx` 中添加路由
3. 如需受保护，用 `<PrivateRoute>` 包裹
4. 样式使用 `.section-card` 等预设 CSS 类

**如何修改侧边栏菜单？**
→ 编辑 `components/Layout.tsx` 中的 `menuItems` 数组。
