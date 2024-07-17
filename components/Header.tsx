'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, MouseEvent } from 'react';

function Header() {
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setLoggingOut(true);

        try {
            const response = await fetch('/api/logout', {
                method: 'POST'
            })

            if (response.ok) {
                setLoggingOut(false);
                router.push('/login')
            } else {
                console.error('Failed to logout');
                setLoggingOut(false);
            }
        } catch (err) {
            console.error('An error occurred during logout:', err);
            setLoggingOut(false);
        }

    }
    return (
        <header>
            <h1>Header Placeholder</h1>
            <div>
                {loggingOut ? (
                    <span style={{ color: 'white' }}>Logging out ...</span>
                ) : (
                    <Link href="/login" onClick={handleLogout} style={{ color: 'white' }}>Log out</Link>
                )
                }
            </div>
        </header>
    )
}

export default Header;