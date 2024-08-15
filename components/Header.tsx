'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, MouseEvent, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

function DmpToolLink(props) {
    const logo = <Image src="/images/DMP-logo.svg" alt="DMP Tool" />;
    return (
        <Link href="/"
    )
}
function Header() {
    const { isAuthenticated, setIsAuthenticated } = useAuthContext();
    const router = useRouter();

    const handleLogout = async (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
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

    if (isAuthenticated === null) {
        return <div></div>;
    }

    return (
        <>
            <header>
                <h1>Header Placeholder</h1>
                <div>
                    {
                        isAuthenticated ? (
                            <Link href="/logout" onClick={handleLogout} style={{ color: 'white' }} > Log out</Link>
                        ) : (<Link href="/login" style={{ color: 'white' }}>Log in</Link>)
                    }

                </div>
            </header >

            <header>
                <div className="dmpui-frontend-container dmpui-frontend dmpui-frontend-header">
                    <div className="header-logo dmpui-grow">
                        <Link href="/">
                            <Image
                                src="/images/DMP-logo.svg"
                                alt="DMP Tool"
                                className="header-logo"
                            />
                        </Link>
                    </div>

                    {/* Standard Header Menu items */}
                    <div className="dmpui-desktop">
                        <ul>


                            <li><a href="/public_plans">Public Plans</a></li>
                            <li><a href="/public_templates">Funder Requirements</a></li>

                            <li>
                                <div className="dmpui-dropdown">
                                    <span><a href="#">About</a></span>
                                    <div className="dmpui-dropdown-content">
                                        <p><a role="menuitem" href="/about_us">Learn more</a></p>
                                        <p><a role="menuitem" href="/join_us">Institutional membership</a></p>
                                        <p><a role="menuitem" href="/faq">FAQs</a></p>
                                        <p><a role="menuitem" href="/editorial_board">Editorial Board</a></p>
                                        <p><a role="menuitem" href="/promote">DMP Tool Logos</a></p>
                                    </div>
                                </div>
                            </li>



                            <li>
                                <div className="dmpui-dropdown">
                                    <a href="#"><span className="fas fa-globe" aria-label="Language"></span></a>
                                    <div className="dmpui-dropdown-content">
                                        <p><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/en-US">English (US)</a></p>
                                        <p><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/pt-BR">Português (Brasil)</a></p>
                                    </div>
                                </div>
                            </li>

                            <li><a href="/auth?m=l" className="dmpui-frontend-btn dmpui-frontend-btn-primary ">Login</a></li>
                            <li><a href="/auth?m=s" className="dmpui-frontend-btn dmpui-frontend-btn-secondary ">Sign Up</a></li>
                        </ul>
                    </div>


                    {/*Mobile Menu */}
                    <button className="dmpui-mobile mobile-icon" id="mobile-menu-open">
                        <Link href="/">
                            <Image
                                src="/images/mobile-menu.svg"
                                alt="Mobile Menu"
                                className="header-logo"
                            />
                        </Link>
                    </button>

                    <div id="mobile-navigation" className="dmpui-mobile mobile-menu">
                        <button id="mobile-menu-close">
                            <img className="close-mobile-icon" src="/assets/blue-arrow-c0728ff817404cd6e6c065c6dbde7b22736a4611e0a372afde426b66478a8fab.svg" alt="Close Mobile Menu">
                        </button>
                        <ul>

                            <li><a href="/public_plans">Public Plans</a></li>
                            <li><a href="/public_templates">Funder Requirements</a></li>

                            <li>
                                <div className="dmpui-dropdown">
                                    <span><a href="#">About</a></span>
                                    <ul className="mobile-menu-submenu">
                                        <li><a role="menuitem" href="/about_us">Learn more</a></li>
                                        <li><a role="menuitem" href="/join_us">Institutional membership</a></li>
                                        <li><a role="menuitem" href="/faq">FAQs</a></li>
                                        <li><a role="menuitem" href="/editorial_board">Editorial Board</a></li>
                                        <li><a role="menuitem" href="/promote">DMP Tool Logos</a></li>
                                    </ul>
                                </div>
                            </li>



                            <li>
                                <div className="dmpui-dropdown">
                                    <span><a href="#">Language</a></span>
                                    <ul className="mobile-menu-submenu">
                                        <li><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/en-US">English (US)</a></li>
                                        <li><a role="menuitem" rel="nofollow" data-method="patch" href="/locale/pt-BR">Português (Brasil)</a></li>
                                    </ul>
                                </div>
                            </li>

                            <li><a href="/auth?m=l" className="dmpui-frontend-btn dmpui-frontend-btn-primary ">Login</a></li>
                            <li><a href="/auth?m=s" className="dmpui-frontend-btn dmpui-frontend-btn-secondary ">Sign Up</a></li>
                        </ul>
                    </div>
                </div>




                <div id="notification-area" class="c-notificationgroup">

                    <!-- Success message -->
                    <div id="js-notification-info" class="c-notification--info hide" role="alert">
                    </div>

                    <div id="js-notification-warning" class="c-notification--warning" role="alert">
                        <p></p>
                        <p></p><p>This is the staging environment of the DMPTool. Do not enter real data into this site- for testing only!</p><p></p>
                    </div>

                    <!-- Error message -->
                    <div id="js-notification-danger" class="c-notification--danger hide" role="alert">
                    </div>
                </div>

            </header>
        </>
    )
}

export default Header;