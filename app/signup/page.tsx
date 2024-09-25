'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.scss';
import { useCsrf } from '@/context/CsrfContext';
import logECS from '@/utils/clientLogger';
import { handleErrors } from '@/utils/errorHandler';

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState<number>(0);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const errorRef = useRef<HTMLDivElement>(null);
    const { csrfToken } = useCsrf();

    const handleAcceptedTerms = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        if (event.target.checked) {
            setAcceptedTerms(1)
        }
    }

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setErrors([]); // Clear previous errors


        const signupRequest = async (token: string | null) => {
            return await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signup`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify({ email, password, acceptedTerms }),
            });
        }

        /* eslint-disable @typescript-eslint/no-explicit-any */
        try {
            const response = await signupRequest(csrfToken);

            await handleErrors(response, signupRequest, setErrors, router);

        } catch (err: any) {
            logECS('error', 'Signup error', {
                error: err,
                url: { path: '/apollo-signup' }
            });
        } finally {
            setLoading(false);
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

                <label htmlFor="acceptedTerms">Accept terms:</label>
                <input
                    type="checkbox"
                    id="acceptedTerms"
                    name="acceptedTerms"
                    onChange={e => handleAcceptedTerms(e)}
                />

                <button type="submit" disabled={loading}>Sign up</button>
            </form>

        </div>
    );
};
export default SignUpPage; 