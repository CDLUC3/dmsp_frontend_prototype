'use client'
import React, { useState, useEffect } from "react";
import {Amplify} from "aws-amplify";
import awsConfig from '@/amplify';
import { signIn, getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

Amplify.configure(awsConfig as any)

type User = {
    email: string;
    password: string;
  };
  const LoginPage:React.FC = () => {
    const [user, setUser] = useState<User>({
      email: "",
      password: "",
    });
    const [userInfo, setUserInfo] = useState();
    const [accessToken, setAccessToken] = useState<String>();

    // useEffect(() => {
    //   async function getUserInfo() {
    //     const userInfo = await getCurrentUser();
    //     console.log(userInfo);
    //     setUserInfo(userInfo);


    //   }

    //   getUserInfo();
    // },[])

    useEffect(() => {
      async function getAccessToken() {
        const session = await fetchAuthSession();
        const authToken = session.tokens?.idToken?.toString();
        if(authToken !== undefined){
          setAccessToken(authToken);
        }
        
      }
      getAccessToken();
      console.log("The access token is: " + accessToken);
    })
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setUser({ ...user, [event.target.name]: event.target.value });
    };
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const email = document.querySelector(".email")
      try{
      // Send the user data to the server to login the user
        const response = await signIn({username: user.email,password: user.password })
        console.log("User logged in:", user);
        console.log(response);


      } catch(e){
      console.log(e)
      }
    };
    return (
      <main className="bg-gray-200 h-screen flex items-center justify-center">
      <form className="max-w-lg w-full bg-gray-100 shadow-lg p-8 flex flex-col"  onSubmit={handleSubmit}>
      <p className="text-xl mb-4 text-center">Sign in</p>
        <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="border py-2 px-4 border-gray-500 focus:outline-none mb-4" 
            value={user.email}
            onChange={handleInputChange}
            required
          />

        <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="border py-2 px-4 border-gray-500 focus:outline-none mb-4" 
            value={user.password}
            onChange={handleInputChange}
            required
          />
        <button className="mt-3 text-lg font-semibold py-4 px-4 bg-gray-600 text-gray-200" type="submit">Login</button>
      </form>
      </main>
    );
  };
  export default LoginPage;