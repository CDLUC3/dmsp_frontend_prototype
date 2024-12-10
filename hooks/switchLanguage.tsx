'use client'

import { useEffect } from 'react';
import { useMeQuery, useUpdateUserProfileMutation } from '@/generated/graphql';
import { refreshAuthTokens } from '@/utils/authHelper';

interface CustomRouter {
  push: (url: string) => void;
}

export const useSwitchLanguage = (
  newLocale: string | null,
  currentLocale: string,
  pathname: string,
  router: CustomRouter
) => {
  const [updateUserProfileMutation] = useUpdateUserProfileMutation();
  const { data } = useMeQuery();

  useEffect(() => {
    if (!newLocale || newLocale === currentLocale) return;

    const switchLanguage = async () => {
      try {
        if (data?.me) {
          await updateUserProfileMutation({
            variables: {
              input: {
                givenName: data.me.givenName || '',
                surName: data.me.surName || '',
                affiliationId: data.me?.affiliation?.uri,
                languageId: newLocale,
              },
            },
          });
          // Refresh token to include preferred language in token
          await refreshAuthTokens();

          // Navigate to the new locale
          const newPath = `/${newLocale}${pathname}`;
          router.push(newPath);
        }
      } catch (error) {
        console.error('Error updating the language:', error);
      }
    };
    switchLanguage();
  }, [data, newLocale, currentLocale, pathname, router, updateUserProfileMutation]);
};