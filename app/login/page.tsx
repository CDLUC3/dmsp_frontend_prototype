'use client'

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import styles from './login.module.scss'
import logECS from '@/utils/clientLogger';

type User = {
    email: string;
    password: string;
};

// Placeholder Login page until we get new design
const LoginPage: React.FC = () => {
    const [user, setUser] = useState<User>({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState<number | null>(null);
    const router = useRouter();
    const errorRef = useRef<HTMLDivElement>(null);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [event.target.name]: event.target.value });
    };

    const saveTokenInCookie = async (token: string) => {

        //Set the cookie. Needs to be set on server side in order to have security configs like httpOnly
        const result = await fetch('/api/setCookie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        })

        const data = await result.json();
        if (data.status !== 200) {
            logECS('error', data.message, {
                url: { path: '/signin' }
            });
        } else {
            logECS('info', data.message, {
                url: { path: '/signin' }
            });
        }
    }

    const handleResponse = async (response: Response) => {
        const { token, message } = await response.json();

        if (response.status === 200) {
            await saveTokenInCookie(token)
            router.push('/') //redirect to home page
        } else if (response.status === 401) {
            if (message) {
                setErrors(prevErrors => [...prevErrors, message])
            }
        } else if (response.status === 500) {
            logECS('error', 'Internal server error', {
                url: { path: '/signin' }
            });
            router.push('/500');
        } else {
            setErrors(['An unexpected error occurred. Please try again.'])
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrors([]); // Clear previous errors

        if (attempts > 5) {
            const remainingTime = lockoutTime ? Math.max(lockoutTime - Date.now(), 0) : 0;
            const minutesLeft = Math.ceil(remainingTime / 60000);
            const remainingMinutesText = minutesLeft < 2 ? 'minute' : 'minutes'
            setErrors([`Too many attempts. Please try again later${remainingTime > 0 ? ` in ${Math.ceil(remainingTime / 60000)} ${remainingMinutesText}.` : '.'}`]);
            setLoading(false);
            return;
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            await handleResponse(response);

        } catch (err: any) {
            logECS('error', 'Signin error', {
                error: err,
                url: { path: '/signin' }
            });
        } finally {
            setLoading(false);
            setAttempts(attempts + 1);
        }

    };

    useEffect(() => {
        if (errors) {
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ behavior: 'smooth' });
                errorRef.current.focus();
            }
        }
    }, [errors])

    useEffect(() => {
        if (attempts >= 5) {
            const lockoutDuration = 15 * 60 * 1000; //15 minutes
            const newLockoutTime = Date.now() + lockoutDuration;
            setLockoutTime(newLockoutTime);
            const timer = setTimeout(() => {
                setAttempts(0);
                setLockoutTime(null);
            }, lockoutDuration); // 15 minutes

            return () => clearTimeout(timer);
        }
    }, [attempts])

    return (
        <div className={styles.loginWrapper} ref={errorRef}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                {errors && errors.length > 0 &&
                    <div className="error">
                        {errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                }
                <h3 className={styles.heading3}>Sign in</h3>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={user.password}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit" disabled={loading}>{loading ? 'Logging in ...' : 'Login'}</button>
            </form>
        </div>
    );
};
export default LoginPage;