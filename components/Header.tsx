'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, MouseEvent, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

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
    )
}

export default Header;