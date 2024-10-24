import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Read the locale from the cookie
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value || 'en-US'; // Default to 'en' if no locale is found

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default
  };
});