import Link from "next/link";
import type { Locale } from "@/i18n/routing";

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-[#171510]/10 bg-[#f8f4ea]/86 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2026 AI Effects Studio. 一次付费，永久使用。</p>
        <div className="flex flex-wrap gap-4">
          <Link className="transition hover:text-[#d7bd7a]" href={`/${locale}/pricing`}>
            定价
          </Link>
          <Link className="transition hover:text-[#d7bd7a]" href={`/${locale}/templates`}>
            模板
          </Link>
          <Link className="transition hover:text-[#d7bd7a]" href={`/${locale}/share/demo`}>
            分享示例
          </Link>
        </div>
      </div>
    </footer>
  );
}
