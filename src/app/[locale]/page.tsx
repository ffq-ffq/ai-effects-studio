import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Clapperboard,
  HelpCircle,
  ImagePlus,
  Layers3,
  Megaphone,
  Play,
  Rocket,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  Utensils,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CompareSlider } from "@/components/studio/compare-slider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const beforeAfterCases = [
  {
    title: "服装",
    description: "平铺图生成模特上身、主图和小红书封面。",
    before: "/templates/fashion-outfit-model.png",
    after: "/templates/fashion-campaign-v2.png",
  },
  {
    title: "餐饮",
    description: "普通菜品照变成外卖头图和节日促销海报。",
    before: "/templates/restaurant-dish-set.png",
    after: "/templates/restaurant-campaign-v2.png",
  },
  {
    title: "房产",
    description: "门店照片生成房源封面、朋友圈图和咨询文案。",
    before: "/templates/local-store-promo.png",
    after: "/templates/local-store-campaign-v2.png",
  },
  {
    title: "零售",
    description: "商品图自动适配淘宝、拼多多、朋友圈尺寸。",
    before: "/templates/local-store-promo.png",
    after: "/templates/fashion-campaign-v2.png",
  },
  {
    title: "自媒体",
    description: "口播素材生成封面、短视频脚本和发布文案。",
    before: "/templates/talking-head-rewrite.png",
    after: "/templates/local-store-campaign-v2.png",
  },
  {
    title: "婚庆",
    description: "套餐照片生成案例封面、海报和获客话术。",
    before: "/templates/restaurant-dish-set.png",
    after: "/templates/restaurant-campaign-v2.png",
  },
] as const;

const featureCards = [
  {
    title: "AI 模特上身",
    subtitle: "服装卖家专属",
    description:
      "上传衣服平铺或挂拍照片，选择模特、身材、姿势和场景，生成可直接上架的模特穿着图。",
    icon: Shirt,
  },
  {
    title: "图文视频一站式",
    subtitle: "一次生成整套素材",
    description:
      "一个产品自动产出图片、短视频、封面和营销文案，减少反复换工具、换格式的时间。",
    icon: Clapperboard,
  },
  {
    title: "一键发到 9 个平台",
    subtitle: "自动裁好平台尺寸",
    description:
      "淘宝、拼多多、小红书、抖音、朋友圈、公众号等尺寸一次导出，按场景直接下载。",
    icon: Rocket,
  },
] as const;

const industryItems = [
  { name: "服装", icon: Shirt },
  { name: "餐饮", icon: Utensils },
  { name: "房产", icon: Building2 },
  { name: "培训", icon: Megaphone },
  { name: "零售", icon: Store },
  { name: "自媒体", icon: Play },
  { name: "外贸", icon: ShoppingBag },
  { name: "宠物", icon: Sparkles },
  { name: "美业", icon: Wand2 },
  { name: "婚庆", icon: BadgeCheck },
] as const;

const pricingPlans = [
  {
    name: "Lite",
    price: "¥283",
    monthly: "或 ¥9/月",
    credits: "200 credits",
    description: "适合刚开始做商品图和朋友圈素材的小店。",
    features: ["50+ 模板", "覆盖 5 个行业", "无水印导出", "永久使用"],
    recommended: false,
  },
  {
    name: "Standard",
    price: "¥645",
    monthly: "或 ¥29/月",
    credits: "600 credits",
    description: "适合稳定上新、短视频种草和多平台投放。",
    features: ["100+ 模板", "覆盖 8 个行业", "视频生成", "AI 模特上身", "AI 营销文案"],
    recommended: true,
  },
  {
    name: "Pro",
    price: "¥1,443",
    monthly: "或 ¥69/月",
    credits: "2000 credits",
    description: "适合批量生产、品牌资产管理和商业交付。",
    features: ["125 模板", "全部 10 行业", "批处理", "品牌资产", "数字人口播"],
    recommended: false,
  },
] as const;

const faqs = [
  {
    question: "不会写 Prompt 可以用吗？",
    answer: "可以。所有模板都已经预设好工作流，你只需要上传素材、选择模板，再点击生成。",
  },
  {
    question: "生成结果能直接发平台吗？",
    answer: "可以。系统会自动裁剪淘宝、拼多多、小红书、抖音、朋友圈、公众号等常用尺寸。",
  },
  {
    question: "产品颜色和形状会不会变？",
    answer: "核心商品会用轮廓和参考图约束，尽量保持颜色、纹理、Logo 和版型不漂移。",
  },
  {
    question: "买断后还要月费吗？",
    answer: "买断套餐无强制月费。初始 credits 用完后，可以按需购买额度包继续生成。",
  },
] as const;

const heroSlides = [
  {
    before: "/templates/fashion-outfit-model.png",
    after: "/templates/fashion-campaign-v2.png",
    label: "服装上新",
  },
  {
    before: "/templates/restaurant-dish-set.png",
    after: "/templates/restaurant-campaign-v2.png",
    label: "餐饮促销",
  },
  {
    before: "/templates/local-store-promo.png",
    after: "/templates/local-store-campaign-v2.png",
    label: "门店获客",
  },
] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#f6f0e4] text-[#171510]">
      <ParticleField />

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1720px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-12 xl:px-16">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-md border border-[#171510]/10 bg-white/64 px-3 py-2 text-xs font-semibold text-[#81662b] shadow-[0_10px_30px_rgba(23,21,16,0.06)] backdrop-blur">
            <Sparkles className="size-4" />
            AI Effects Studio
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.06] tracking-normal text-[#171510] sm:text-5xl lg:text-6xl xl:text-[4.9rem]">
            选模板，传照片，一键生成专业效果图
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#171510]/64 sm:text-lg">
            不需要学 AI，不需要学设计，你只需要会点一下
          </p>

          <div className="mt-10 grid gap-3 sm:max-w-xl sm:grid-cols-2">
            <Link
              className={cn(
                buttonVariants(),
                "h-12 justify-between rounded-md bg-[#171510] text-white shadow-[0_18px_42px_rgba(23,21,16,0.18)] hover:bg-[#2a251b]",
              )}
              href={`/${locale}/studio`}
            >
              免费试用
              <ArrowRight className="size-4" />
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 justify-between rounded-md border-[#171510]/12 bg-white/72 text-[#171510] shadow-[0_12px_32px_rgba(23,21,16,0.07)] hover:border-[#81662b]/38 hover:bg-white",
              )}
              href={`/${locale}/templates`}
            >
              查看模板
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["125", "精调模板"],
              ["10", "行业覆盖"],
              ["9", "平台尺寸"],
            ].map(([value, label]) => (
              <div
                className="rounded-md border border-[#171510]/10 bg-white/58 p-3 shadow-[0_12px_30px_rgba(23,21,16,0.05)] backdrop-blur"
                key={label}
              >
                <p className="font-mono text-2xl font-semibold text-[#81662b]">
                  {value}
                </p>
                <p className="mt-1 text-xs text-[#171510]/54">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <HeroCarousel />
      </section>

      <section className="mx-auto w-full max-w-[1720px] px-5 py-16 sm:px-8 lg:px-12 xl:px-16">
        <SectionHeader
          eyebrow="Before / After"
          title="6 个行业的效果展示墙"
          description="每张卡片都可以拖拽中间滑块，查看原素材到生成图的变化。"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {beforeAfterCases.map((item) => (
            <article
              className="rounded-lg border border-[#171510]/10 bg-white/74 p-3 shadow-[0_18px_50px_rgba(23,21,16,0.08)] backdrop-blur"
              key={item.title}
            >
              <CompareSlider
                afterImage={item.after}
                afterLabel="生成图"
                beforeImage={item.before}
                beforeLabel="原图"
                className="border-0 bg-transparent p-0 shadow-none"
                description={item.description}
                title={item.title}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1720px] px-5 py-16 sm:px-8 lg:px-12 xl:px-16">
        <SectionHeader
          eyebrow="Core Features"
          title="小生意人的视觉内容工厂"
          description="从商品素材到平台发布，一条链路完成图片、视频、文案和尺寸适配。"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              className="rounded-lg border border-[#171510]/10 bg-white/78 p-6 shadow-[0_22px_60px_rgba(23,21,16,0.09)] backdrop-blur"
              key={feature.title}
            >
              <div className="flex size-12 items-center justify-center rounded-md bg-[#171510] text-[#d7bd7a]">
                <feature.icon className="size-6" />
              </div>
              <p className="mt-6 text-xs font-semibold text-[#81662b]">
                {feature.subtitle}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#171510]">
                {feature.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#171510]/62">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden py-16">
        <div className="mx-auto w-full max-w-[1720px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <SectionHeader
            eyebrow="Industries"
            title="覆盖 10 个高频生意场景"
            description="服装、餐饮、房产、零售、自媒体、婚庆等行业模板持续上新。"
          />
        </div>
        <div className="mt-8 flex gap-4 overflow-hidden border-y border-[#171510]/10 bg-white/46 py-5 backdrop-blur">
          <div className="landing-marquee flex min-w-max gap-4">
            {[...industryItems, ...industryItems].map((industry, index) => (
              <div
                className="flex min-w-40 items-center gap-3 rounded-md border border-[#171510]/10 bg-[#f8f4ea] px-4 py-3 shadow-[0_12px_32px_rgba(23,21,16,0.06)]"
                key={`${industry.name}-${index}`}
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-white text-[#81662b]">
                  <industry.icon className="size-5" />
                </div>
                <span className="text-sm font-semibold text-[#171510]">
                  {industry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1720px] px-5 py-16 sm:px-8 lg:px-12 xl:px-16">
        <SectionHeader
          eyebrow="Pricing"
          title="买断套餐 + 按需额度包"
          description="无强制月费，Standard 已包含视频生成、AI 模特上身和营销文案。"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              className={cn(
                "relative rounded-lg border bg-white/76 p-6 shadow-[0_18px_52px_rgba(23,21,16,0.08)] backdrop-blur",
                plan.recommended
                  ? "border-[#81662b]/50 bg-[#efe1b9] shadow-[0_28px_80px_rgba(129,102,43,0.16)]"
                  : "border-[#171510]/10",
              )}
              key={plan.name}
            >
              {plan.recommended ? (
                <div className="absolute right-5 top-5 rounded-full bg-[#171510] px-3 py-1 text-xs font-semibold text-white">
                  推荐
                </div>
              ) : null}
              <h3 className="text-2xl font-semibold text-[#171510]">
                {plan.name}
              </h3>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-semibold text-[#171510]">
                  {plan.price}
                </span>
                <span className="pb-1 text-sm text-[#171510]/52">
                  {plan.monthly}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#81662b]">
                {plan.credits}
              </p>
              <p className="mt-4 min-h-12 text-sm leading-6 text-[#171510]/62">
                {plan.description}
              </p>
              <ul className="mt-6 grid gap-3 text-sm text-[#171510]/70">
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <BadgeCheck className="size-4 text-[#6aa891]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className={cn(
                  buttonVariants({
                    variant: plan.recommended ? "default" : "outline",
                  }),
                  "mt-7 h-11 w-full rounded-md",
                  plan.recommended
                    ? "bg-[#171510] text-white hover:bg-[#2a251b]"
                    : "border-[#171510]/12 bg-white/58 text-[#171510] hover:bg-white",
                )}
                href={`/${locale}/pricing`}
              >
                选择套餐
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1720px] gap-6 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 xl:px-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-[#81662b]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#171510] sm:text-4xl">
            常见问题
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#171510]/62">
            如果你只想快速做出能发平台的素材，这里是最常被问到的几个问题。
          </p>
        </div>
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details
              className="group rounded-lg border border-[#171510]/10 bg-white/72 p-5 shadow-[0_12px_36px_rgba(23,21,16,0.06)] backdrop-blur"
              key={faq.question}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[#171510]">
                <span className="flex items-center gap-3">
                  <HelpCircle className="size-5 text-[#81662b]" />
                  {faq.question}
                </span>
                <ChevronRight className="size-4 transition group-open:rotate-90" />
              </summary>
              <p className="mt-4 text-sm leading-7 text-[#171510]/62">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1720px] px-5 pb-20 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-6 rounded-xl border border-[#171510]/10 bg-[#171510] p-6 text-white shadow-[0_30px_90px_rgba(23,21,16,0.22)] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-[#d7bd7a]">
              Ready
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
              今天就把第一组商品效果图做出来
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
              选一个行业模板，上传一张产品图，先免费试一次完整生成流程。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className={cn(
                buttonVariants(),
                "h-11 rounded-md bg-[#d7bd7a] text-[#171510] hover:bg-[#ead69a]",
              )}
              href={`/${locale}/studio`}
            >
              <ImagePlus className="size-4" />
              免费试用
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-md border-white/16 bg-white/8 text-white hover:bg-white/14",
              )}
              href={`/${locale}/templates`}
            >
              <Layers3 className="size-4" />
              查看模板
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroCarousel() {
  return (
    <div className="relative min-h-[520px] min-w-0 rounded-xl border border-[#171510]/10 bg-white/82 p-4 shadow-[0_28px_80px_rgba(23,21,16,0.14)] backdrop-blur sm:p-5 xl:p-6">
      <div className="mb-4 flex h-9 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#d96b4f]" />
          <span className="size-2 rounded-full bg-[#d7bd7a]" />
          <span className="size-2 rounded-full bg-[#6aa891]" />
        </div>
        <div className="font-mono text-xs text-[#171510]/42">
          auto before / after
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#171510]/10 bg-[#ebe3d4] sm:aspect-[16/10]">
        {heroSlides.map((slide, index) => (
          <div
            className="landing-hero-slide absolute inset-0"
            key={slide.label}
            style={{ animationDelay: `${index * 4}s` }}
          >
            <Image
              alt={`${slide.label} before`}
              className="absolute inset-0 size-full object-cover"
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 900px, 100vw"
              src={slide.before}
            />
            <Image
              alt={`${slide.label} after`}
              className="absolute inset-0 size-full object-cover"
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 900px, 100vw"
              src={slide.after}
              style={{ clipPath: "inset(0 0 0 50%)" }}
            />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.18)]" />
            <div className="absolute left-4 top-4 rounded-md bg-[#171510]/84 px-3 py-1.5 text-xs font-medium text-white">
              {slide.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {["上传素材", "选择模板", "生成套图"].map((item, index) => (
          <div
            className="rounded-md border border-[#171510]/10 bg-[#f7f1e6] p-4"
            key={item}
          >
            <span className="font-mono text-xs text-[#171510]/34">
              0{index + 1}
            </span>
            <p className="mt-2 text-sm font-semibold text-[#171510]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParticleField() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(215,189,122,0.24),transparent_28%),radial-gradient(circle_at_84%_10%,rgba(106,168,145,0.18),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(23,21,16,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(23,21,16,0.18)_1px,transparent_1px)] [background-size:72px_72px]" />
      {Array.from({ length: 22 }).map((_, index) => (
        <span
          className="landing-particle absolute size-1.5 rounded-full bg-[#81662b]/40"
          key={index}
          style={{
            animationDelay: `${(index % 11) * 0.7}s`,
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
          }}
        />
      ))}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-normal text-[#81662b]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#171510] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#171510]/62">
        {description}
      </p>
    </div>
  );
}
