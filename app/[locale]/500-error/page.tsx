// pages/500.js
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Custom500: React.FC = () => {
    const t = useTranslations('errors.500');
    return (
        <div>
            <h1>{t('title')}</h1>
            <p>Something went wrong on our end. Please try again later.</p>
            <Link href="/">
                Go back home
            </Link>
        </div>
    );
}

export default Custom500;