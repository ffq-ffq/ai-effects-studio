import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AppProviders } from "@/app/providers";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FestivalLoginReminder } from "@/components/templates/festival-login-reminder";
import { isLocale, locales, type Locale } from "@/i18n/routing";
import { loadMessages } from "@/i18n/messages";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await loadMessages(locale);

  return (
    <AppProviders locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header locale={locale as Locale} />
        <div className="flex flex-1 flex-col pb-24 lg:pb-0">{children}</div>
        <FestivalLoginReminder />
        <BottomTabs locale={locale as Locale} />
        <Footer locale={locale as Locale} />
      </div>
    </AppProviders>
  );
}
