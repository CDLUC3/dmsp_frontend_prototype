'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, confirmSignUp } from "aws-amplify/auth";
import ConfirmUser from '@/components/confirmation';

import './signup.scss';


const SignUp: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newUser, setNewUser] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
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
            console.log('Login successful:', data);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleConfirmSignUp = async (e: React.FormEvent) => {
        e.preventDefault();


    }
    return (
        <main className="signup-wrapper">
            {newUser ? <ConfirmUser verificationCode={verificationCode} handleConfirmSignUp={handleConfirmSignUp} setVerificationCode={setVerificationCode} /> :
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
            }
        </main>
    );
};
export default SignUp; 