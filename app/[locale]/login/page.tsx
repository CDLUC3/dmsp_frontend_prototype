'use client'

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "react-aria-components";
import logECS from '@/utils/clientLogger';
import { handleErrors } from '@/utils/errorHandler';
import { useCsrf } from '@/context/CsrfContext';
import { useAuthContext } from '@/context/AuthContext';
import FormInput from '@/components/Form/FormInput';
import styles from './login.module.scss'

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
                <FormInput
                    name="email"
                    type="email"
                    label="Email"
                    value={user.email}
                    onChange={handleInputChange}
                />

                <FormInput
                    name="password"
                    type="password"
                    label="Password"
                    value={user.password}
                    onChange={handleInputChange}
                />
                <Button type="submit" isDisabled={loading}>Login</Button>
            </form>
        </div>
    );
};
export default LoginPage;
