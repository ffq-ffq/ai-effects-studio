"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Locale } from "@/i18n/routing";

const navItems = [
  { href: "", label: "首页" },
  { href: "templates", label: "模板" },
  { href: "studio", label: "创作台" },
  { href: "pricing", label: "定价" },
  { href: "dashboard", label: "仪表盘" },
] as const;

export function MobileNav({ locale }: { locale: Locale }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="打开导航"
            className="md:hidden"
            size="icon"
            variant="outline"
          />
        }
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent
        className="border-[#171510]/10 bg-[#f8f4ea]/96 backdrop-blur-md"
        side="right"
      >
        <SheetHeader>
          <SheetTitle className="text-[#171510]">AI 效果工坊</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 grid gap-2">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-[#171510]/62 transition hover:bg-[#171510]/6 hover:text-[#171510]"
              href={`/${locale}/${item.href}`}
              key={item.href || "home"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
