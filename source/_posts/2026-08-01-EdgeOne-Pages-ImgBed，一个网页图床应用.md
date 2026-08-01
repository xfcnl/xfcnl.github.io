---
layout: post
title: "EdgeOne-Pages-ImgBed，一个网页图床应用"
date: "2026-07-31"
categories: [tech]
tags: [图床, web]
---

EdgeOne-Pages-ImgBed，一个基于 edgeone pages（现makers）（前端）、edgeone pages edge function（后端）、supabase sql（存储）和 supabase auth（多用户认证）的网页图床应用

[在 GitHub 上查看](https://github.com/xfcnl/EdgeOne-Pages-ImgBed)

## 部署

[在 GitHub 上查看](https://github.com/xfcnl/EdgeOne-Pages-ImgBed#%E5%8A%9F%E8%83%BD)

## 开发历程

### 为什么要做这个东西

为什么呢，毕竟有现成的方案（cf worker 方案）

毕竟注册一个 edgeone 和 suapbase 账户不用总觉得亏了

### 遇到了什么问题

太多了，就让雌小鬼deepseek总结了一下

#### 1. 环境变量冗余与缺失

**现象**：`.env` 里有 `SUPABASE_POSTGRESQL_URL` / `SUPABASE_POSTGRESQL_BUCKET_NAME` /
`SUPABASE_POSTGRESQL_URL_PASSWORD` 三个变量，但代码里没有任何引用；同时 Edge Function
需要的 `SUPABASE_SERVICE_ROLE_KEY` 完全缺失。

**原因**：拼错了变量体系。postgresql 连接串只给 SQL 管理工具用，代码走 supabase-js
HTTP API 根本不需要。

**解决**：删除三个摆设变量；补上 `SUPABASE_SERVICE_ROLE_KEY`（本地用 `supabase status`
拿 dev key，生产在 Dashboard → Settings → API 拿）。

#### 2. VITE_ADMIN_PASSWORD 泄露进前端 bundle

**现象**：管理员密码明文写进构建产物，任何人 F12 翻 JS 就能拿到并直接登录。

**原因**：`VITE_` 前缀是 Vite 约定，**构建时静态替换进 bundle**。把密码放进
`VITE_ADMIN_PASSWORD` 等于把钥匙挂门上。

**解决**：

- 删除 `src/lib/seedAdmin.js`（前端用明文密码造管理员账号的逻辑）
- 删除 `LoginForm.jsx` 的「管理员登录」一键填充按钮
- `.env` 移除 `VITE_ADMIN_PASSWORD`
- 管理员账号改为在 Supabase 控制台手动创建

**铁律**：`VITE_` 前缀的变量都会进前端，**只放公开数据**（URL、anon key、admin 邮箱）。
机密（service_role key、密码）永远走服务端变量。

#### 3. 管理员密码重置失败：Invalid login credentials

**现象**：部署后登录一直提示 `Invalid login credentials`。

**原因**：重置密码邮件链接点开后**自动登录建立了会话，但项目没有「设置新密码」界面**，
用户从头到尾没设置过密码，自然登录失败（鸡生蛋问题）。

**解决**（临时的）：

1. 用脚本绕过邮件限流直接改密码：

```powershell
$env:VITE_SUPABASE_URL="https://xxxx.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_xxx"
node scripts/set-password.mjs "admin@example.com" "新密码"
```

2. 或走邮件：重发重置邮件 → 点链接自动登录 → **Settings → 账户设置 → 修改密码**。

**遗留**：项目尚无 recovery 专用界面，建议后续补上（检测 `PASSWORD_RECOVERY` 事件后
弹出设置新密码表单）。

#### 4. 部署后 Invalid API key

**现象**：线上登录报 `Invalid API key`。

**原因**：本地构建时 `VITE_SUPABASE_URL` 还是 `http://localhost:54321`，云端 bundle
连的是 localhost；或 EdgeOne 构建环境变量没正确注入、anon key 复制错误。

**解决**：

- 确认 EdgeOne（GitHub 集成）的**构建环境变量**里配了 `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY`（GitHub 集成不读本地 `.env`，`.env` 被 gitignore）
- 本地构建则把生产值写进 `.env` 再 build
- anon key 必须是当前项目的 `sb_publishable_` key

**验证**：F12 → 主 JS → 搜 `supabase.co`，看是不是云端 URL。

#### 5. 登录报 Invalid login credentials 但账号存在

**现象**：账号存在、邮箱已确认，仍登录失败。

**原因**：`VITE_ADMIN_EMAIL` 生产值填成了大写 `G114514g@yeah.net`，实际账号邮箱是
小写 `g114514g@yeah.net`。JS 的 `===` 大小写敏感，比对永远 false，`set_admin_if_match`
不触发，role 卡在 user。

**解决**：EdgeOne 环境变量改为全小写 `g114514g@yeah.net`，重新部署。

#### 6. 邮箱验证相关

**现象**：注册后直接登录失败 / 未验证用户能登录。

**原因**：本地 `config.toml` 的 `enable_confirmations = false`。

**解决**：

- 本地：`supabase/config.toml` → `[auth.email]` → `enable_confirmations = true`
- 云端：Dashboard → Authentication → Providers → Email → **Confirm email** 打开
- 本地测试邮件在 inbucket：`http://localhost:54324`

#### 7. SQL 查询权限被拒：permission denied for table users

**现象**：SQL Editor 查 `auth.users` 报 42501。

**原因**：执行角色不是 postgres（可能是 authenticated）。**不要**按 HINT 执行
`GRANT SELECT ON auth.users TO authenticated`——那会把所有用户数据开放给任何登录用户。

**解决**：改用 Dashboard 的 Authentication → Users 面板查看，或用 postgres 角色执行。

#### 8. 重置密码链接指向 localhost

**现象**：重置邮件里的链接是 `http://localhost:3000/#access_token=...`。

**原因**：云端 Supabase 的 Site URL 还是本地配置。

**解决**：Dashboard → Authentication → **URL Configuration**：

- Site URL 填真实部署域名
- Redirect URLs 加 `https://你的域名/**`

改完**重新发送**重置邮件（旧链接沿用旧配置）。

#### 9. 打开重置链接报 requested path is invalid

**现象**：点击重置链接返回 `{"error":"requested path is invalid"}`。

**原因**：Redirect URLs allow-list 没配对（Site URL 带路径/尾斜杠、域名不一致等）。

**解决**：Site URL 用纯域名（无路径无尾斜杠），Redirect URLs 至少包含
`https://你的域名` 和 `https://你的域名/**`。

#### 10. 邮件速率限制超出

**现象**：连续发送重置/验证邮件后报「邮件速率限制超出」。

**原因**：Supabase 默认每小时最多 2 封（`email_sent = 2`）。

**解决**：等待一小时，或用 `scripts/set-password.mjs` 脚本绕过邮件直接改密码。

#### 11. 上传失败：Bucket not found

**现象**：上传图片报 `Bucket not found`。

**原因**：Supabase Storage 里没有 `edgeone-pages-imgbed` 这个桶（migration 的建桶语句
未在云端生效，或 Edge Function 的 `SUPABASE_STORAGE_BUCKET` 指向了别的名字）。

**解决**：

- Dashboard → Storage → New bucket：名字 `edgeone-pages-imgbed`，Public 打勾
- 或 SQL Editor 执行建桶 + RLS 策略（见 `supabase/migrations/20240101000000_create_tables.sql` 末尾）
- 确认 EdgeOne 的 `SUPABASE_STORAGE_BUCKET` 与桶名一致

#### 12. 数据库「不会部署」，纠结半天

**现象**：不知道数据库怎么部署，误以为要自己搭 PostgreSQL 服务器。

**原因**：这个项目数据库不是自建，而是 Supabase 托管的 PostgreSQL，前端直接用
`@supabase/supabase-js` 走 HTTP API 连，不需要你部署任何数据库服务。

**解决**：

- **本地开发**：`supabase start` 起本地 Docker 实例，`supabase migration up` 建表
- **生产**：去 [supabase.com](https://supabase.com) 新建项目，用 CLI 或 SQL Editor 把
  migration 跑上去，然后配 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 即可

#### 13. 以为 Supabase 能一键从 GitHub 导入建表

**现象**：问「能不能直接导入 GitHub 仓库来建表」。

**原因**：Supabase Dashboard **没有**「导入 GitHub 仓库建表」这种按钮。

**解决**（三选一）：

- **CLI 推迁移**：`supabase link --project-ref <ref>` + `supabase db push`，可写进
  GitHub Actions 自动部署
- **SQL Editor 手搓**：Dashboard → SQL Editor，把 SQL 粘贴运行
- **Branching**：Supabase 的 GitHub 集成，但它只做 PR 预览数据库，不是用来初始化建表的

#### 14. 搞不清根目录 migration.sql 和 migrations/ 目录的关系

**现象**：`supabase/migration.sql`（根目录）和 `supabase/migrations/*.sql` 内容
看起来一样，不知道该跑哪个。

**原因**：根目录的 `migration.sql` 只是 `create_tables` 的**副本**，CLI 只认
`migrations/` 目录。项目实际有 **两个**迁移文件，都必须执行：

```
supabase/migrations/
├── 20240101000000_create_tables.sql   ← images, albums, album_images + 存储桶
└── 20240201000000_admin_system.sql    ← profiles, settings, invite_codes, RPC
```

**解决**：

- CLI 跑 `supabase migration up` 会自动按文件名顺序执行全部迁移，两个都覆盖
- SQL Editor 手搓则**按顺序**依次粘贴运行，先 `create_tables` 再 `admin_system`
- 根目录 `migration.sql` 直接忽略

#### 15. RLS 无限递归：policy 查询自身表

**现象**：给 `profiles` 建 SELECT policy，条件里直接查 `profiles`（如 `role = 'admin'`），
操作时报 `infinite recursion detected in policy for relation "profiles"`。

**原因**：policy 求值时会再次触发自身 policy，无限循环。

**解决**：把判断抽成 `SECURITY DEFINER` 函数，policy 里只调用它：

```sql
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;
```

`SECURITY DEFINER` 以函数 owner（postgres）身份执行，绕过 RLS 递归。所有 admin 相关
policy 和 RPC 都用 `public.is_admin()`，不要再直查 `profiles`。

#### 16. 迁移顺序导致函数未定义

**现象**：某个迁移文件里 policy/RPC 用到了 `is_admin()`，但函数定义写在更后面，执行报
`function public.is_admin() does not exist`。

**原因**：CLI 按文件名时间戳顺序执行，函数必须在**引用它的对象之前**创建。

**解决**：把 `is_admin()` 等依赖函数挪到所有 policy/RPC 之前；新增迁移文件时注意命名
时间戳要递增，且一条迁移内部保持「先函数后 policy」。

#### 17. 本地 supabase start 后部分服务异常

**现象**：`supabase status` 显示 `Stopped services: [supabase_imgproxy_... supabase_analytics_...]`，
或 storage 容器不健康。

**原因**：本地 Docker 资源不足 / 可选服务（imgproxy、analytics、vector、pooler）启动失败，
不影响核心 API、DB、Studio、Auth。

**解决**：核心服务正常即可继续。要确保迁移生效就 `supabase db reset` 重建数据库，
它会完整重跑全部迁移；不用管这几个 optional 服务。

#### 18. Windows 下 npx supabase 报 No matching binary

**现象**：`npx supabase` 报 `No matching Supabase CLI binary package found for win32-x64`。

**原因**：`npx` 拉的是 npm 包，该包在 Windows 上没有对应原生二进制。

**解决**：直接用全局安装的 `supabase` 命令（`supabase status` / `supabase db query` / `supabase db diff`），
不要用 `npx supabase`。

#### 19. supabase db query 不支持一次多条语句

**现象**：一条命令里用分号写多条 SQL，报 `cannot insert multiple commands into a prepared statement`。

**解决**：一次只跑一条 SQL；要跑多条就分多次调用。

#### 20. 邀请码生成失败

**现象**：设置页点「生成邀请码」报错或没反应。

**原因**：`invite_codes` 的 `created_by` 列是 `NOT NULL`，但 insert 只传了
`{ code, expires_at }`，漏了创建者 ID，被 not-null 约束拒绝。

**解决**：insert 时补上创建者：

```js
const {
  data: { user },
} = await supabase.auth.getUser();
await supabase
  .from("invite_codes")
  .insert({ code, expires_at, created_by: user?.id });
```

#### 21. 老账号没有 admin 角色

**现象**：管理员邮箱登录后 role 还是 `user`，看不到管理面板。

**原因**：账号创建于 admin_system 迁移之前，`on_auth_user_created` trigger 只建了默认
`user` profile；旧方案只在注册时调 `set_admin_if_match`，不会补旧账号。

**解决**：

- 临时补救：SQL 手动升级
  `UPDATE profiles SET role='admin' WHERE id=(SELECT id FROM auth.users WHERE email='...')`
- 根治：登录后（`useAuth.js` 的 `ensureAdmin`）比对 `user.email === VITE_ADMIN_EMAIL`，
  每次登录自动调用 `set_admin_if_match` 补升

#### 22. PowerShell 里 curl 不是 curl

**现象**：`curl -X POST ...` 报
`Invoke-WebRequest : 无法绑定参数 Headers ... 无法将 ... String ... 转换为 ... IDictionary`。

**原因**：PowerShell 里 `curl` 是 `Invoke-WebRequest` 的别名，参数语法完全不同。

**解决**：用 `Invoke-RestMethod`，或调真正的 curl `curl.exe`。例如调 Supabase REST：

```powershell
Invoke-RestMethod -Uri "http://localhost:54321/rest/v1/rpc/set_admin_if_match" -Method Post `
  -ContentType "application/json" `
  -Headers @{"apikey"="sb_publishable_xxx"} `
  -Body '{"target_user_id":"<uuid>","admin_email":"a@b.c"}'
```

#### 23. 链接/相册选择器「覆盖」当前弹窗而不是「弹出」

**现象**：图片详情弹窗里点「复制链接」，链接格式面板把图片内容**完全盖住**（看起来像切了
页面而不是弹了新窗）；如果之前开过相册面板，选完格式关闭后相册面板还会莫名重新冒出来。

**原因**：两个选择器面板都写在同一个 `relative` 父容器里，用 `absolute inset-0` 定位，
等于把整个弹窗内容盖掉，而不是叠一层新弹窗。面板状态互相独立，同时打开时后渲染的盖住
先渲染的，关闭其中一个另一个还留在原处。

**解决**：把链接选择器和相册选择器从 `relative` 父容器移出，改为独立的
`fixed inset-0 z-[60]` 弹窗，层叠在图片详情（`z-50`）之上；点击遮罩关闭，点击内部
`stopPropagation`。这样打开链接面板时图片弹窗仍然可见，两个面板互不干扰。

#### 24. 构建报错：Adjacent JSX elements must be wrapped in an enclosing tag

**现象**：`vite build` 报 `[PARSE_ERROR] Adjacent JSX elements must be wrapped in an
enclosing tag`，指向 `ImageDetail.jsx:183`。

**原因**：上一条修复把两个选择器面板移出父容器时，原来关闭 `relative` 容器的 `</div>`
没有被覆盖掉，残留了一个多余闭合标签，JSX 标签配对数量错乱。

**解决**：删掉多余的 `</div>`，重新 `npm run build` 通过。

**教训**：重构嵌套 JSX 时，大段替换的 `oldString`/`newString` 要把**所有**闭合标签算清楚，
不然会多出/漏掉一层 `</div>`。

#### 25. 图片删除静默失败：filename 与 fileName 笔误

**现象**：`ImageDetail.jsx` 的 `handleDelete` 里删除 Storage 文件时用的变量拼写不一致：

```js
const filename = image.url.split("/").pop();
await supabase.storage.from("edgeone-pages-imgbed").remove([fileName]); // fileName 未定义
```

**原因**：笔误。JS 变量名大小写敏感，`fileName` 是 `undefined`，`remove([undefined])`
要么报错要么静默失败，数据库记录删了但存储文件成了孤儿。

**解决**：统一成 `remove([filename])`。

其实还有一部分的，但有两个对话“死了”不管你往里面输什么就返回error

以上问题全都是因为我从没搞过后端和数据库这方面开发导致的

但这个图床总算是跑起来了，也没什么问题

如果有你在使用中出现了什么问题，请在[Issues · xfcnl/EdgeOne-Pages-ImgBed](https://github.com/xfcnl/EdgeOne-Pages-ImgBed/issues)提出
