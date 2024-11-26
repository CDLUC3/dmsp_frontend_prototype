'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useCsrf } from '@/context/CsrfContext';
import Link from 'next/link';
import { faGlobe, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './header.module.scss';

function Header() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { isAuthenticated, setIsAuthenticated } = useAuthContext();
    const router = useRouter();
    const { csrfToken } = useCsrf();

    useEffect(() => {
        //this is just to trigger a refresh on authentication change
    }, [isAuthenticated]);


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
                    <a href="/">
                        <img src="/images/DMP-logo.svg" alt="DMP Tool" />
                    </a>
                </div>

                <div className={styles['dmpui-desktop']}>
                    <ul>
                        {/*If user is signed in */}
                        <li><a href="">Dashboard</a></li>
                        <li><a role="menuitem" href="">Upload Plan</a></li>
                        <li><a href="">Create Plan</a></li>
                        {/*end user is signed in */}


                        <li><a href="">Public Plans</a></li>
                        <li><a href="">Funder Requirements</a></li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><a href="#">About</a></span>
                                <div className={styles['dmpui-dropdown-content']}>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Learn more</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Institutional membership</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">FAQs</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Editorial Board</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">DMP Tool Logos</a></p>
                                </div>
                            </div>
                        </li>
                        {/*If user is signed in and is org admin */}
                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><a href="#">Admin</a></span>
                                <div className={styles['dmpui-dropdown-content']}>
                                    {/*If user is super admin */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Organisations</a></p>
                                    {/*If user can modify org details */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Organisation details</a></p>
                                    {/*end user can modify org details */}

                                    {/*if user can grant permissions */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Users</a></p>
                                    {/*end user can grant permissions */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Plans</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Usage</a></p>
                                    {/*if current user can modify templates */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Templates</a></p>
                                    {/*end current user can modify templates */}
                                    {/*if user can modify guidance */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Guidance</a></p>
                                    {/*end user can modify guidance */}

                                    {/*if current user is super admin */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Themes</a></p>
                                    {/*end current user is super admin */}

                                    {/*if current user is super admin */}
                                    <p className={styles.paragraph}><a href="" role="menuitem">Api Clients</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Api Logs</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Notifications</a></p>
                                    {/*end current user is super admin */}
                                </div>
                            </div>
                        </li>

                        {/*if user is signed in */}
                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <FontAwesomeIcon icon={faUser} fixedWidth />
                                <div className={styles['dmpui-dropdown-content']}>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Edit profile</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">3rd party apps</a></p>
                                    <p className={styles.paragraph}><a href="" role="menuitem">Developer tools</a></p>
                                </div>
                            </div>
                        </li>
                        {/*end user is signed in */}

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <a href="#"><FontAwesomeIcon icon={faGlobe} aria-label="Language" /></a>
                                <div className={styles['dmpui-dropdown-content']}>
                                    {/*Need list of languages from backend */}
                                    <p className={styles.paragraph}><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/en-US">English (US)</a></p>
                                    <p className={styles.paragraph}><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/pt-BR">Português (Brasil)</a></p>
                                </div>
                            </div>
                        </li>

                        {isAuthenticated ? (
                            <li><Link href="/" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`} rel="nofollow" data-method="delete" onClick={handleLogout}>Logout</Link></li>
                        ) : (
                            <>
                                <li><Link href="/login" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`}>Login</Link></li>
                                <li><Link href="/signup" className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`}>Sign Up</Link></li>
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
                        <li><a href="/plans">Dashboard</a></li>
                        <li><a role="menuitem" href="/dashboard">Upload Plan</a></li>
                        <li><a href="/plans/new">Create Plan</a></li>

                        <li><a href="/public_plans">Public Plans</a></li>
                        <li><a href="/public_templates">Funder Requirements</a></li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><a href="#">About</a></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><a role="menuitem" href="/about_us">Learn more</a></li>
                                    <li><a role="menuitem" href="/join_us">Institutional membership</a></li>
                                    <li><a role="menuitem" href="/faq">FAQs</a></li>
                                    <li><a role="menuitem" href="/editorial_board">Editorial Board</a></li>
                                    <li><a role="menuitem" href="/promote">DMP Tool Logos</a></li>
                                </ul>
                            </div>
                        </li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><a href="#">Admin</a></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><a role="menuitem" href="/super_admin/orgs">Organizations</a></li>
                                    <li><a role="menuitem" href="/org/admin/users/admin_index">Users</a></li>
                                    <li><a role="menuitem" href="/org_admin/plans">Plans</a></li>
                                    <li><a role="menuitem" href="/usage">Usage</a></li>
                                    <li><a role="menuitem" href="/org_admin/templates">Templates</a></li>
                                    <li><a role="menuitem" href="/org/admin/guidance/15/admin_index">Guidance</a></li>
                                    <li><a role="menuitem" href="/super_admin/themes">Themes</a></li>
                                    <li><a role="menuitem" href="/super_admin/api_clients">Api Clients</a></li>
                                    <li><a role="menuitem" href="/super_admin/api_logs">Api Logs</a></li>
                                    <li><a role="menuitem" href="/super_admin/notifications">Notifications</a></li>
                                </ul>
                            </div>
                        </li>


                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span>User</span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><a role="menuitem" href="/users/edit">Edit profile</a></li>
                                    <li><a role="menuitem" href="/users/third_party_apps">3rd party apps</a></li>
                                    <li><a role="menuitem" href="/users/developer_tools">Developer tools</a></li>
                                </ul>
                            </div>
                        </li>

                        <li>
                            <div className={styles['dmpui-dropdown']}>
                                <span><a href="#">Language</a></span>
                                <ul className={styles['mobile-menu-submenu']}>
                                    <li><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/en-US">English (US)</a></li>
                                    <li><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/pt-BR">Português (Brasil)</a></li>
                                </ul>
                            </div>
                        </li>

                        <li><a className={`${styles['dmpui-frontend-btn']} ${styles['dmpui-frontend-btn-secondary']}`} rel="nofollow" data-method="delete" href="/users/sign_out" onClick={handleLogout}>Logout</a>
                        </li></ul>
                </div>
            </div>
        </header>
    )
}

export default Header;

