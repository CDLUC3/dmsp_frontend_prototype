'use client'

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import styles from './login.module.scss'
import logECS from '@/utils/clientLogger';
import { useCsrf } from '@/context/CsrfContext';
import { handleErrors } from '@/utils/errorHandler';
import { useAuthContext } from '@/context/AuthContext';

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
    const errorRef = useRef<HTMLDivElement>(null);
    const { csrfToken } = useCsrf();
    const router = useRouter();
    const { setIsAuthenticated } = useAuthContext();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrors([]); // Clear previous errors

        const loginRequest = async (token: string | null) => {
            return await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signin`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(user),
            });
        }

        if (csrfToken) {

            /* eslint-disable @typescript-eslint/no-explicit-any */
            try {
                const response = await loginRequest(csrfToken);

                if (response.ok) {
                    setIsAuthenticated(true);
                    router.push('/')
                } else {
                    await handleErrors(response, loginRequest, setErrors, router, '/login');
                }

            } catch (err: any) {
                logECS('error', 'Signin error', {
                    error: err,
                    url: { path: '/apollo-signin' }
                });
            } finally {
                setLoading(false);
            }
        } else {
            setErrors(prev => prev.concat('Something went wrong'))
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


    return (
        <div className={styles.loginWrapper} ref={errorRef}>
            <form className={styles.loginForm} id="login" onSubmit={handleSubmit}>
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
                <button type="submit" id="login-button" disabled={loading}>Login</button>
            </form>
        </div>
    );
};
export default LoginPage;