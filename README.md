# AI Effects Studio

AI 效果工坊是面向小生意人的 AI 视觉内容工厂：上传图片或视频，选择模板，一键生成图片、视频、多平台尺寸和营销文案。

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:3000/zh-CN
```

## 常用命令

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

上线到 Vercel 时，需要在 Vercel Project Settings 的 Environment Variables 中按 `.env.example` 逐项配置。

## 部署

完整部署流程见 [docs/deployment.md](docs/deployment.md)。
