'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthContext } from '@/context/AuthContext';
import { useCsrf } from '@/context/CsrfContext';

import { faGlobe, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './header.module.scss';
import LanguageSelector from '../LanguageSelector';

function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useAuthContext();
    const [newLocale, setNewLocale] = useState<string | null>(null);
    const router = useRouter();
    const { csrfToken } = useCsrf();
    const pathname = usePathname();
    const currentLocale = useLocale();
    const t = useTranslations('Header');

    const locales = [
        {
            id: 'en-US',
            name: t('subMenuEnglish')
        },
        {
            id: 'pt-BR',
            name: t('subMenuPortuguese')
        }
    ];


    useEffect(() => {
        //this is just to trigger a refresh on authentication change
    }, [isAuthenticated]);


    const updateLanguages = async (locale: string) => {
        setNewLocale(locale);
    }


    const handleLogout = async (e: MouseEvent<HTMLAnchorElement>) => {
        console.log("handleLogout called")

        e.preventDefault();


        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            })

            if (response.ok) {
                setIsAuthenticated(false);
                router.push('/login')
            } else {
                console.error('Failed to logout');
            }
        } catch (err) {
            console.error('An error occurred during logout:', err);
        }

    }

    function handleClick() {
        setShowMobileMenu(true);
    }

    function hideMenu() {
        setShowMobileMenu(false)
    }

    return (
        <header className={styles.headerStyle}>
            <div className={`${styles['dmpui-frontend-container']} ${styles['dmpui-frontend']} ${styles['dmpui-frontend-header']}`}>
                <div className={styles['header-logo dmpui-grow']}>
                    <Link href="/">
                        <img src="/images/DMP-logo.svg" alt="DMP Tool" />
                    </Link>
                </div>

                <div className={styles['dmpui-desktop']}>
                    <ul role="menu">
                        {/*If user is signed in */}
                        <li role="menuitem"><Link role="none" href="">{t('menuDashboard')}</Link></li>
                        <li role="menuitem"><Link role="none" href="">{t('menuUpload')}</Link></li>
                        <li role="menuitem"><Link role="none" href="">{t('menuCreatePlan')}</Link></li>
                        {/*end user is signed in */}

                        <li role="menuitem"><Link role="none" href="">{t('menuPublicPlans')}</Link></li>
                        <li role="menuitem"><Link role="none" href="">{t('menuFunderRequirements')}</Link></li>

                        <li role="menuitem">
                            <div className={styles['dmpui-dropdown']} role="menu">
                                <span><Link role="none" href="#">{t('menuAbout')}</Link></span>
                                <div className={styles['dmpui-dropdown-content']} role="menu">
                                    <p className={styles.paragraph} role="menuitem"><Link href="" role="none">{t('subMenuLearnMore')}</Link></p>
                                    <p className={styles.paragraph} role="menuitem"><Link href="" role="none">{t('subMenuMembership')}</Link></p>
                                    <p className={styles.paragraph} role="menuitem" ><Link href="" role="none">{t('subMenuFAQs')}</Link></p>
                                    <p className={styles.paragraph} role="menuitem"><Link href="" role="none">{t('subMenuEditorial')}</Link></p>
                                    <p className={styles.paragraph} role="menuitem"><Link href="" role="none">{t('subMenuLogos')}</Link></p>
                                </div>
                            </div>
                        </li>
                        {/*If user is signed in and is org admin */}
                        <li role="menuitem">
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuAdmin')}</Link></span>
                                <div className={styles['dmpui-dropdown-content']}>
                                    {/*If user is super admin */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuOrganisations')}</Link></p>
                                    {/*If user can modify org details */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuOrgDetails')}</Link></p>
                                    {/*end user can modify org details */}

                                    {/*if user can grant permissions */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuUsers')}</Link></p>
                                    {/*end user can grant permissions */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuPlans')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuUsage')}</Link></p>
                                    {/*if current user can modify templates */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuTemplates')}</Link></p>
                                    {/*end current user can modify templates */}
                                    {/*if user can modify guidance */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuGuidance')}</Link></p>
                                    {/*end user can modify guidance */}

                                    {/*if current user is super admin */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuThemes')}</Link></p>
                                    {/*end current user is super admin */}

                                    {/*if current user is super admin */}
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuApiClients')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuApiLogs')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuNotifications')}</Link></p>
                                    {/*end current user is super admin */}
                                </div>
                            </div>
                        </li>

                        {/*if user is signed in */}
                        <li role="menuitem">
                            <div className={styles['dmpui-dropdown']}>
                                <FontAwesomeIcon icon={faUser} fixedWidth />
                                <div className={styles['dmpui-dropdown-content']}>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuEditProfile')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenu3rdParty')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuDevTools')}</Link></p>
                                </div>
                            </div>
                        </li>
                        {/*end user is signed in */}

                        {isAuthenticated && (
                            <li role="menuitem">
                                <div className={styles['dmpui-dropdown']}>
                                    <a href="#"><FontAwesomeIcon icon={faGlobe} aria-label="Language" /></a>
                                    <div className={styles['dmpui-dropdown-content']}>

                                        <LanguageSelector locales={locales} />

                                    </div>
                                </div>
                            </li>
                        )}

                        {isAuthenticated ? (
                            <li role="menuitem"><Link href="/" role="menuitem" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`} rel="nofollow" data-method="delete" onClick={handleLogout}>{t('btnLogout')}</Link></li>
                        ) : (
                            <>
                                <li role="menuitem"><Link href="/login" role="menuitem" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`}>{t('btnLogin')}</Link></li>
                                <li role="menuitem"><Link href="/signup" role="menuitem" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`}>{t('btnSignup')}</Link></li>
                            </>
                        )}
                    </ul>
                </div>


                {/*Mobile */}
                <button className={`${styles['dmpui-mobile']} ${styles['mobile-icon']}`} id="mobile-menu-open" onClick={handleClick}>
                    <img src="/images/mobile-menu.svg" alt="Mobile Menu" />
                </button>
                <div id={styles['mobile-navigation']} className={`${styles['dmpui-mobile']} ${styles['mobile-menu']} " + ${(showMobileMenu ? styles['show-menu'] : '')}`}>
                    <button id={styles['mobile-menu-close']} onClick={hideMenu}>
                        <img className={styles['close-mobile-icon']} src="/images/blue-arrow.svg" alt="Close Mobile Menu" />
                    </button>
                    <ul role="menubar">
                        <li role="menuitem"><Link href="/plans">{t('menuDashboard')}</Link></li>
                        <li role="menuitem"><Link href="/dashboard">{t('menuUpload')}</Link></li>
                        <li role="menuitem"><Link href="/plans/new">{t('menuCreatePlan')}</Link></li>

                        <li role="menuitem"><Link role="none" href="/public_plans">{t('menuPublicPlans')}</Link></li>
                        <li role="menuitem"><Link role="none" href="/public_templates">{t('menuFunderRequirements')}</Link></li>

                        <li role="menuitem">
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuAbout')}</Link></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li role="menuitem"><Link role="none" href="/about_us">{t('subMenuLearnMore')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/join_us">{t('subMenuMembership')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/faq">{t('subMenuFAQs')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/editorial_board">{t('subMenuEditorial')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/promote">{t('subMenuLogos')}</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li role="menuitem">
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuAdmin')}</Link></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li role="menuitem"><Link role="none" href="/super_admin/orgs">{t('subMenuOrganisations')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/org/admin/users/admin_index">{t('subMenuUsers')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/org_admin/plans">{t('subMenuPlans')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/usage">{t('subMenuUsage')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/org_admin/templates">{t('subMenuTemplates')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/org/admin/guidance/15/admin_index">{t('subMenuGuidance')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/super_admin/themes">{t('subMenuThemes')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/super_admin/api_clients">{t('subMenuApiClients')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/super_admin/api_logs">{t('subMenuApiLogs')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/super_admin/notifications">{t('subMenuNotifications')}</Link></li>
                                </ul>
                            </div>
                        </li>


                        <li role="menuitem">
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuUser')}</Link></span>
                                <ul className={styles['mobile-menu-submenu']} role="menu">
                                    <li role="menuitem"><Link role="none" href="/users/edit">{t('subMenuEditProfile')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/users/third_party_apps">{t('subMenu3rdParty')}</Link></li>
                                    <li role="menuitem"><Link role="none" href="/users/developer_tools">{t('subMenuDevTools')}</Link></li>
                                </ul>
                            </div>
                        </li>

                        {isAuthenticated && (
                            <li role="menuitem">
                                <div className={styles['dmpui-dropdown']}>
                                    <span><Link href="#">{t('menuLanguage')}</Link></span>
                                    <ul className={styles['mobile-menu-submenu']} role="menu">
                                        <li role="menuitem"><Link role="none" rel="nofollow" data-method="patch" href="/locale/en-US">{t('subMenuEnglish')}</Link></li>
                                        <li role="menuitem"><Link role="none" rel="nofollow" data-method="patch" href="/locale/pt-BR">{t('subMenuPortuguese')}</Link></li>
                                    </ul>
                                </div>
                            </li>
                        )}

                        <li role="menuitem"><Link className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`} rel="nofollow" data-method="delete" href="/users/sign_out" onClick={handleLogout}>{t('btnLogout')}</Link>
                        </li></ul>
                </div>
            </div>
        </header>
    )
}

export default Header;

