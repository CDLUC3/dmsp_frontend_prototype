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

        if (result.ok) {
            const data = await result.json();
            console.log(data.message);
        } else {
            console.error('Failed to set cookie');
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
            router.push('/500');
        } else {
            setErrors(['An unexpected error occurred. Please try again.'])
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
                error: { err },
                url: { path: '/signin' }
            });
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};
export default LoginPage;