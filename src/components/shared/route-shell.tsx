import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RouteShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function RouteShell({
  title,
  description,
  eyebrow = "AI Effects Studio",
  children,
}: RouteShellProps) {
  return (
    <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="max-w-3xl rounded-lg border border-amber-900/10 bg-white/62 p-5 shadow-[0_24px_70px_rgba(120,53,15,0.12)] backdrop-blur-md dark:border-amber-100/10 dark:bg-white/[0.06] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-normal text-[#d97706]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-neon-gradient sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </section>
      {children ?? (
        <Card>
          <CardHeader>
            <CardTitle>模块已就绪</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            这里是页面骨架，后续可以接入真实业务数据。
          </CardContent>
        </Card>
      )}
    </main>
  );
}
