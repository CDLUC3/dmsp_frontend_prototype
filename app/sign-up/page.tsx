'use client';
import React, {useState, useEffect} from 'react';
import {Amplify} from "aws-amplify";
import {useRouter} from 'next/navigation';
import awsConfig from '@/amplify';
import {signUp,confirmSignUp} from "aws-amplify/auth";
import ConfirmUser from '@/components/confirmation';

Amplify.configure(awsConfig as any)


  const SignUp:React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newUser, setNewUser] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const router = useRouter();

    const handleSignUp = async(event: React.FormEvent) => {
      event.preventDefault();
      try {
        const {isSignUpComplete, userId, nextStep} = await signUp({
          username: email,
          password: password,
        })
        console.log("User registered:");
        if(userId) {
          setNewUser(true);
        }
      } catch (error) {
        console.error("Error registering user:", error)
      }
    };

    const handleConfirmSignUp = async (e: React.FormEvent) => {
      e.preventDefault();
  
      try {
        const response = await confirmSignUp({username:email, confirmationCode: verificationCode});
        console.log(response);
        router.push('/login');
      } catch (err) {
        console.error(err);
      }
    }
    return (
      <main className="bg-gray-200 h-screen flex items-center justify-center">
        {newUser ? <ConfirmUser verificationCode={verificationCode} handleConfirmSignUp={handleConfirmSignUp} setVerificationCode={setVerificationCode} /> :
        <form className="max-w-lg w-full bg-gray-100 shadow-lg p-8 flex flex-col" onSubmit={handleSignUp}>
          <p className="text-xl mb-4 text-center">Create an account</p>
          
          <label htmlFor="email">Email address:</label>
          <input id="email" type="email" name="email" value={email} className="border py-2 px-4 border-gray-500 focus:outline-none mb-4" onChange={e => setEmail(e.target.value)} required />

          <label htmlFor="password">Password:</label>
          <input id="password" type="password" name="password" value={password} className="border py-2 px-4 border-gray-500 focus:outline-none mb-4" onChange={e => setPassword(e.target.value)} required />

          <button className="mt-3 text-lg font-semibold py-4 px-4 bg-gray-600 text-gray-200" type="submit">Sign Up</button>
        </form>
        }
      </main>
    );
  };
  export default SignUp; 