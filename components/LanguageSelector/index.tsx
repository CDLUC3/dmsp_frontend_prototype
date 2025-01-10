import {useState} from 'react';
import {useSwitchLanguage} from '@/hooks/switchLanguage';
import {useLocale} from 'next-intl';
import {useRouter} from 'next/navigation';
import {usePathname} from '@/i18n/routing';
import styles from './languageSelector.module.scss';

// Define the interface for the locales
interface LangInterface {
  id: string;
  name: string;
}

// Define the interface for the props
interface LanguageSelectorProps {
  locales: LangInterface[];
}

function LanguageSelector({ locales }: LanguageSelectorProps) {
  const [newLocale, setNewLocale] = useState<string | null>(null);
  const pathname = usePathname();
  const currentLocale = useLocale();
  const router = useRouter();

  // This is triggered every time the "newLocale" state changes
  useSwitchLanguage(newLocale, currentLocale, pathname, router);

  const updateLanguages = async (locale: string) => {
    setNewLocale(locale);
  }

  return (
    <>
      {locales.map((locale) => (
        <button
          key={locale.id}
          className={`${styles.paragraph} ${styles.btnLanguageSelector}}`}
          onClick={() => updateLanguages(locale.id)}
          role="menuitem"
          aria-label={`Switch to ${locale} language`}
        >
          {locale.name}
        </button>
      ))}
    </>
  )

}

export default LanguageSelector;
