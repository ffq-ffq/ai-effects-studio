# AI Effects Studio 部署上线手册

本文档对应第 27 步部署上线，覆盖 GitHub、Vercel、Supabase、Stripe、Modal 和域名绑定。

## 1. 部署前检查

在项目目录执行：

```bash
npm install
npm run lint
npm run build
```

确认 `.env.local` 不会提交到 Git：

```bash
git status --short
git check-ignore .env.local
```

## 2. 推送到 GitHub

如果已安装并登录 GitHub CLI：

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create ai-effects-studio --public --push
```

如果本地已经有提交，只需要创建远程仓库并推送：

```bash
gh repo create ai-effects-studio --public --source . --remote origin --push
```

如果没有 `gh`，可在 GitHub 网页创建空仓库，然后执行：

```bash
git remote add origin https://github.com/<your-name>/ai-effects-studio.git
git branch -M main
git push -u origin main
```

## 3. Vercel 部署

推荐方式：Vercel Dashboard 导入 GitHub 仓库。

1. 打开 `https://vercel.com/new`
2. Import `ai-effects-studio`
3. Framework Preset 选择 `Next.js`
4. Build Command 使用 `npm run build`
5. Install Command 使用 `npm install`
6. 按 `.env.example` 配置环境变量
7. Deploy

CLI 方式：

```bash
npm install -g vercel
vercel login
vercel --yes
```

生产部署：

```bash
vercel --yes --prod
```

部署后把正式域名写入：

```text
NEXT_PUBLIC_APP_URL=https://你的域名
```

## 4. Vercel 环境变量

需要配置：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
MODAL_API_KEY
MODAL_WORKSPACE
NEXT_PUBLIC_APP_URL
```

注意：不要把 `.env.local` 提交到 GitHub。

## 5. Supabase 配置

1. 创建 Supabase Project
2. SQL Editor 执行 `supabase/schema.sql`
3. Storage 创建 buckets：
   - `user-uploads`
   - `generations`
4. Auth 启用：
   - Email
   - Google OAuth
5. 在 Supabase Dashboard 复制：
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key -> `SUPABASE_SERVICE_ROLE_KEY`

## 6. Stripe 配置

创建 3 个买断套餐：

| 产品 | 价格 | 额度 |
| --- | ---: | ---: |
| Lite | ¥283 | 200 credits |
| Standard | ¥645 | 600 credits |
| Pro | ¥1,443 | 2000 credits |

创建 4 个额度包：

| 产品 | 价格 | 额度 |
| --- | ---: | ---: |
| 100 credits | ¥7 | 100 |
| 300 credits | ¥17 | 300 |
| 1000 credits | ¥45 | 1000 |
| 5000 credits | ¥149 | 5000 |

Webhook endpoint：

```text
https://你的域名/api/webhook/stripe
```

监听事件：

```text
checkout.session.completed
```

复制配置到 Vercel：

```text
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

## 7. Modal 配置

1. 打开 `https://modal.com`
2. 创建 Workspace
3. 获取 API Key
4. 部署 AI 工作流：
   - ComfyUI Flux + ControlNet
   - Outfit Anyone / IDM-VTON
   - Wan2.1
   - Wav2Lip + Edge TTS
   - CodeFormer
   - Real-ESRGAN
5. 配置：

```text
MODAL_API_KEY
MODAL_WORKSPACE
```

## 8. 域名绑定

在 Vercel：

1. Project Settings -> Domains
2. 添加自定义域名
3. DNS 添加：

```text
CNAME cname.vercel-dns.com
```

绑定完成后更新：

```text
NEXT_PUBLIC_APP_URL=https://你的自定义域名
```

## 9. 上线后验证

验证页面：

```text
/zh-CN
/zh-CN/templates
/zh-CN/studio
/zh-CN/pricing
```

验证接口：

```text
/api/templates
/api/generate/status
/api/webhook/stripe
```

验证业务流程：

1. 注册/登录
2. 上传图片
3. 选择模板
4. 发起生成
5. Realtime 进度更新
6. 下载多平台尺寸
7. Stripe 支付后 credits 增加
