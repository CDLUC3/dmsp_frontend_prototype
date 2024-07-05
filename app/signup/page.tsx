'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.scss';
import logECS from '@/utils/clientLogger';

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const router = useRouter();
    const errorRef = useRef<HTMLDivElement>(null);

    const handleResponse = async (response: Response) => {
        const { message } = await response.json();
        if (response.status === 200) {
            router.push('/') //redirect to home page
        } else if (response.status === 400) {
            if (message) {
                // Convert string into array
                const errorMessages = message.split('| ');
                setErrors(prevErrors => {
                    return [...prevErrors, ...errorMessages]
                })
            }
        } else if (response.status === 500) {
            router.push('/500');
        } else {
            setErrors(['An unexpected error occurred. Please try again.'])
        }
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrors([]); // Clear previous errors

        /* eslint-disable @typescript-eslint/no-explicit-any */
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            await handleResponse(response);

        } catch (err: any) {
            logECS('error', 'Signup error', {
                error: { err },
                url: { path: '/signup' }
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
        <div className={styles.signupWrapper} ref={errorRef}>
            <form className={styles.signupForm} onSubmit={handleSignUp}>
                {errors && errors.length > 0 &&
                    <div className="error">
                        {errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                }
                <h3 className={styles.heading3}>Create an account</h3>

                <label htmlFor="email">Email address:</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required />

                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required />

                <button type="submit">Sign Up</button>
            </form>

        </div>
    );
};
export default SignUpPage; 