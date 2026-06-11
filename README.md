# AI Effects Studio

AI 效果工坊是面向小生意人的 AI 视觉内容工厂：上传图片或视频，选择模板，一键生成图片、视频、多平台尺寸和营销文案。

## 功能范围

- 125 个 AI 模板，覆盖服装、餐饮、房产、培训、零售、自媒体、外贸、宠物、美业、婚庆 10 个行业
- AI 模特上身：5 个虚拟试穿模板，按模特、身材、姿势、场景生成
- 数字人口播：5 个 Wav2Lip + Edge TTS 口型同步模板
- Stripe Checkout 买断套餐、订阅和额度包支付
- Supabase Auth、PostgreSQL、Storage、Realtime
- 9 种平台尺寸导出、AI 营销文案、批量处理、品牌资产、节日营销模板
- 移动端响应式、PWA、暗色/亮色模式、SEO、sitemap、robots

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000/zh-CN
```

常用命令：

```bash
npm run lint
npm run build
npm run start
```

## 环境变量

复制 `.env.example` 到 `.env.local`，填入 Supabase、Stripe、Modal 和应用域名配置。

```bash
cp .env.example .env.local
```

需要配置：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MODAL_API_KEY=
MODAL_WORKSPACE=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## GitHub 部署准备

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create ai-effects-studio --public --push
```

如果仓库已存在：

```bash
git remote add origin https://github.com/你的用户名/ai-effects-studio.git
git branch -M main
git push -u origin main
```

## Vercel 部署

Dashboard 方式：

1. 打开 `https://vercel.com/new`
2. 导入 GitHub 仓库 `ai-effects-studio`
3. Framework Preset 选择 `Next.js`
4. Install Command 使用 `npm install`
5. Build Command 使用 `npm run build`
6. 按 `.env.example` 配置环境变量
7. Deploy

CLI 方式：

```bash
npm install -g vercel
vercel login
vercel --yes --prod
```

部署成功后，把 `NEXT_PUBLIC_APP_URL` 设置为线上域名。

## Supabase 配置

1. 在 `https://supabase.com/dashboard` 创建项目
2. SQL Editor 执行 `supabase/schema.sql`
3. Storage 创建 bucket：`user-uploads`
4. Storage 创建 bucket：`generations`
5. Auth 开启 Email 登录，需要 Google 登录时再配置 Google OAuth
6. 将 Project URL、anon key、service role key 填入 Vercel 环境变量

## Stripe 配置

1. 在 `https://dashboard.stripe.com` 创建产品：
   - Lite：买断 ¥283，订阅 ¥9/月，200 credits
   - Standard：买断 ¥645，订阅 ¥29/月，600 credits
   - Pro：买断 ¥1443，订阅 ¥69/月，2000 credits
   - 额度包：100/300/1000/5000 credits
2. 配置 webhook：

```text
https://你的线上域名/api/webhook/stripe
```

监听事件：

```text
checkout.session.completed
```

3. 将 publishable key、secret key、webhook secret 填入 Vercel 环境变量

## Modal 配置

1. 在 `https://modal.com` 创建 Workspace
2. 获取 API Key
3. 部署以下接口：
   - `/comfyui/flux-controlnet`
   - `/wan2.1/generate`
   - `/outfit-anyone/generate`
   - `/edge-tts`
   - `/wav2lip/sync`
4. 将 `MODAL_API_KEY` 和 `MODAL_WORKSPACE` 填入 Vercel 环境变量

## 上线后验证

页面：

```text
/zh-CN
/zh-CN/studio
/zh-CN/templates
/zh-CN/pricing
/zh-CN/gallery
```

系统文件：

```text
/manifest.webmanifest
/sitemap.xml
/robots.txt
```

API：

```text
/api/health
/api/templates
/api/generate
/api/generate/batch
/api/generate/status
/api/upload
/api/checkout
/api/webhook/stripe
```

更详细的部署说明见 [docs/deployment.md](docs/deployment.md)。
