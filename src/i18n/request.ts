import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "./routing";
import { loadMessages } from "./messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
