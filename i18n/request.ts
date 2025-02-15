import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  /* eslint-disable @typescript-eslint/no-explicit-any*/
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  // Load multiple translation files
  const mainMessages = (await import(`@/messages/${locale}/global.json`)).default;
  const templateMessages = (await import(`@/messages/${locale}/templateBuilder.json`)).default;
  const planBuilderProjectOverviewMessages = (await import(`@/messages/${locale}/planBuilderProjectOverview.json`)).default;
  const errorMessages = (await import(`@/messages/${locale}/errors.json`)).default;
  const messaging = (await import(`@/messages/${locale}/messaging.json`)).default;

  // Merge all message objects
  const messages = {
    ...mainMessages,
    ...templateMessages,
    ...messaging,
    ...planBuilderProjectOverviewMessages,
    errors: errorMessages,
  };
  return {
    locale,
    messages
  };
});
