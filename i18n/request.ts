import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  /* eslint-disable @typescript-eslint/no-explicit-any*/
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  console.log("LOCALE", locale);
  console.log("***LOCALE URL", `@/messages/${locale}/${locale}.json`);
  return {
    locale,
    messages: (await import(`@/messages/${locale}/${locale}.json`)).default
  };
});