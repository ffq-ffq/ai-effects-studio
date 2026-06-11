import type { AbstractIntlMessages } from "next-intl";
import { defaultLocale, isLocale, type Locale } from "./routing";

const messageLoaders: Record<Locale, () => Promise<AbstractIntlMessages>> = {
  "zh-CN": async () => (await import("../../messages/zh-CN.json")).default,
  "en-US": async () => (await import("../../messages/en-US.json")).default,
};

export async function loadMessages(locale: string) {
  const safeLocale = isLocale(locale) ? locale : defaultLocale;

  return messageLoaders[safeLocale]();
}
