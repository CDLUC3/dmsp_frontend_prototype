'use client';

import {MouseEvent, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Link, usePathname} from '@/i18n/routing';
import {useLocale, useTranslations} from 'next-intl';
import {useAuthContext} from '@/context/AuthContext';
import {useCsrf} from '@/context/CsrfContext';

import {faGlobe, faUser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
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
                    <ul>
                        {/*If user is signed in */}
                        <li><Link href="">{t('menuDashboard')}</Link></li>
                        <li><Link role="menuitem" href="">{t('menuUpload')}</Link></li>
                        <li><Link href="">{t('menuCreatePlan')}</Link></li>
                        {/*end user is signed in */}

                        <li><Link href="">{t('menuPublicPlans')}</Link></li>
                        <li><Link href="">{t('menuFunderRequirements')}</Link></li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuAbout')}</Link></span>
                                <div className={styles['dmpui-dropdown-content']}>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuLearnMore')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuMembership')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuFAQs')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuEditorial')}</Link></p>
                                    <p className={styles.paragraph}><Link href="" role="menuitem">{t('subMenuLogos')}</Link></p>
                                </div>
                            </div>
                        </li>
                        {/*If user is signed in and is org admin */}
                        <li>
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
                        <li>
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
                            <li>
                                <div className={styles['dmpui-dropdown']}>
                                    <a href="#"><FontAwesomeIcon icon={faGlobe} aria-label="Language" /></a>
                                    <div className={styles['dmpui-dropdown-content']}>

                                        <LanguageSelector locales={locales} />

                                    </div>
                                </div>
                            </li>
                        )}

                        {isAuthenticated ? (
                            <li><Link href="/" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`} rel="nofollow" data-method="delete" onClick={handleLogout}>{t('btnLogout')}</Link></li>
                        ) : (
                            <>
                                <li><Link href="/login" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`}>{t('btnLogin')}</Link></li>
                                <li><Link href="/signup" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`}>{t('btnSignup')}</Link></li>
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
                    <ul>
                        <li><Link href="/plans">{t('menuDashboard')}</Link></li>
                        <li><Link role="menuitem" href="/dashboard">{t('menuUpload')}</Link></li>
                        <li><Link href="/plans/new">{t('menuCreatePlan')}</Link></li>

                        <li><Link href="/public_plans">{t('menuPublicPlans')}</Link></li>
                        <li><Link href="/public_templates">{t('menuFunderRequirements')}</Link></li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuAbout')}</Link></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><Link role="menuitem" href="/about_us">{t('subMenuLearnMore')}</Link></li>
                                    <li><Link role="menuitem" href="/join_us">{t('subMenuMembership')}</Link></li>
                                    <li><Link role="menuitem" href="/faq">{t('subMenuFAQs')}</Link></li>
                                    <li><Link role="menuitem" href="/editorial_board">{t('subMenuEditorial')}</Link></li>
                                    <li><Link role="menuitem" href="/promote">{t('subMenuLogos')}</Link></li>
                                </ul>
                            </div>
                        </li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuAdmin')}</Link></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><Link role="menuitem" href="/super_admin/orgs">{t('subMenuOrganisations')}</Link></li>
                                    <li><Link role="menuitem" href="/org/admin/users/admin_index">{t('subMenuUsers')}</Link></li>
                                    <li><Link role="menuitem" href="/org_admin/plans">{t('subMenuPlans')}</Link></li>
                                    <li><Link role="menuitem" href="/usage">{t('subMenuUsage')}</Link></li>
                                    <li><Link role="menuitem" href="/org_admin/templates">{t('subMenuTemplates')}</Link></li>
                                    <li><Link role="menuitem" href="/org/admin/guidance/15/admin_index">{t('subMenuGuidance')}</Link></li>
                                    <li><Link role="menuitem" href="/super_admin/themes">{t('subMenuThemes')}</Link></li>
                                    <li><Link role="menuitem" href="/super_admin/api_clients">{t('subMenuApiClients')}</Link></li>
                                    <li><Link role="menuitem" href="/super_admin/api_logs">{t('subMenuApiLogs')}</Link></li>
                                    <li><Link role="menuitem" href="/super_admin/notifications">{t('subMenuNotifications')}</Link></li>
                                </ul>
                            </div>
                        </li>


                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><Link href="#">{t('menuUser')}</Link></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><Link role="menuitem" href="/users/edit">{t('subMenuEditProfile')}</Link></li>
                                    <li><Link role="menuitem" href="/users/third_party_apps">{t('subMenu3rdParty')}</Link></li>
                                    <li><Link role="menuitem" href="/users/developer_tools">{t('subMenuDevTools')}</Link></li>
                                </ul>
                            </div>
                        </li>

                        {isAuthenticated && (
                            <li>
                                <div className={styles['dmpui-dropdown']}>
                                    <span><Link href="#">{t('menuLanguage')}</Link></span>
                                    <ul className={styles['mobile-menu-submenu']}>
                                        <li><Link role="menuitem" rel="nofollow" data-method="patch" href="/locale/en-US">{t('subMenuEnglish')}</Link></li>
                                        <li><Link role="menuitem" rel="nofollow" data-method="patch" href="/locale/pt-BR">{t('subMenuPortuguese')}</Link></li>
                                    </ul>
                                </div>
                            </li>
                        )}

                        <li><Link className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`} rel="nofollow" data-method="delete" href="/users/sign_out" onClick={handleLogout}>{t('btnLogout')}</Link>
                        </li></ul>
                </div>
            </div>
        </header>
    )
}

export default Header;

