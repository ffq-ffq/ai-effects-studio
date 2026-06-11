import Link from "next/link";
import type { Locale } from "@/i18n/routing";

const items = [
  { href: "dashboard", label: "概览" },
  { href: "dashboard/projects", label: "项目" },
  { href: "dashboard/billing", label: "账单" },
  { href: "dashboard/settings", label: "设置" },
] as const;

export function Sidebar({ locale }: { locale: Locale }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border p-4 lg:block">
      <nav className="grid gap-1">
        {items.map((item) => (
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            href={`/${locale}/${item.href}`}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
