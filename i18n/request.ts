import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  /* eslint-disable @typescript-eslint/no-explicit-any*/
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  // Load multiple translation files
  const mainMessages = (await import(`@/messages/${locale}/en-US.json`)).default;
  const errorMessages = (await import(`@/messages/${locale}/errors.json`)).default;

  // Merge all message objects
  const messages = {
    ...mainMessages,
    errors: errorMessages,
  };
  return {
    locale,
    messages
  };
});