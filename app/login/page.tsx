'use client'

import React, { useState } from "react";

import '@/app/login/login.scss';

type User = {
    email: string;
    password: string;
};

const LoginPage: React.FC = () => {
    const [user, setUser] = useState<User>({
        email: "",
        password: "",
    });
    const [userInfo, setUserInfo] = useState();
    const [accessToken, setAccessToken] = useState<String>();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [event.target.name]: event.target.value });
    };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const { token } = await response.json();

            const data = JSON.stringify({ "token": token });
            console.log("TOKEN,", data)
            //Set the cookie
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

        } catch (err: any) {
            console.error(err.message);
        }

    };
    return (
        <div className="login-wrapper">
            <form className="login-form" onSubmit={handleSubmit}>
                <h3 className="heading-3">Sign in</h3>
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