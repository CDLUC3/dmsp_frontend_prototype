'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/signup/signup.scss';


const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            router.push('/') //redirect to home page
        } catch (err: any) {
            console.error(err.message);
        }
    };

    return (
        <main className="signup-wrapper">

            <form className="signup-form" onSubmit={handleSignUp}>
                <h3 className="heading-3">Create an account</h3>

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

        </main>
    );
};
export default SignUpPage; 