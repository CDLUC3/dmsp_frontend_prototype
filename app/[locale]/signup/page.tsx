'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Form,
  TextField,
  Label,
  Input,
  FieldError,
  Checkbox,
} from "react-aria-components";
import styles from './signup.module.scss';
import {useCsrf} from '@/context/CsrfContext';
import logECS from '@/utils/clientLogger';
import {handleErrors} from '@/utils/errorHandler';
import {useAuthContext} from '@/context/AuthContext';

const SignUpPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [termsAccepted, setTermsAccepted] = useState<bool>(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const errorRef = useRef<HTMLDivElement>(null);
    const { csrfToken } = useCsrf();
    const { setIsAuthenticated } = useAuthContext();

    const handleSignUp = async (ev: React.FormEvent) => {
      ev.preventDefault();

      setLoading(true);
      setErrors([]);

      let data = {
        first_name: ev.target.first_name.value,
        last_name: ev.target.last_name.value,
        email: ev.target.email.value,
        password: ev.target.password.value,
        "acceptedTerms": termsAccepted,
      };

      console.log(data);

       const signupRequest = async (token: string | null) => {
         return await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signup`, {
           method: 'POST',
           credentials: 'include',
           headers: {
             'Content-Type': 'application/json',
             'X-CSRF-TOKEN': token || '',
           },
           body: JSON.stringify(data),
         });
       }

      /* eslint-disable @typescript-eslint/no-explicit-any */
      try {
        const response = await signupRequest(csrfToken);

        if (response && response.ok) {
          setIsAuthenticated(true);
          router.push('/')
        } else {
          await handleErrors(response, signupRequest, setErrors, router, '/signup');
        }

        // if (csrfToken) {
        //     /* eslint-disable @typescript-eslint/no-explicit-any */
        //     try {
        //         const response = await signupRequest(csrfToken);

        //         if (response && response.ok) {
        //             setIsAuthenticated(true);
        //             router.push('/')
        //         } else {
        //             await handleErrors(response, signupRequest, setErrors, router, '/signup');
        //         }

        //     } catch (err: any) {
        //         logECS('error', 'Signup error', {
        //             error: err,
        //             url: { path: '/apollo-signup' }
        //         });
        //     } finally {
        //         setLoading(false);
        //     }
        // } else {
        //     setErrors(prev => prev.concat('Something went wrong'))
        // }

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
    }, [errors]);

    return (
      <div className={styles.signupWrapper} ref={errorRef}>
        <Form className={styles.signupForm} onSubmit={handleSignUp}>
          {errors && errors.length > 0 &&
            <div className="error">
                {errors.map((error, index) => (
                    <p key={index}>{error}</p>
                ))}
            </div>
          }
          <h3 className={styles.heading3}>Create an account</h3>

          <TextField
            name="first_name"
            type="input"
            aria-label="First Name"
            isRequired
          >
            <Label>First Name</Label>
            <FieldError />
            <Input />
          </TextField>

          <TextField
            name="last_name"
            type="input"
            aria-label="Last Name"
            isRequired
          >
            <Label>Last Name</Label>
            <FieldError />
            <Input />
          </TextField>

          Institution, Cannot find institution checkbox

          <TextField
            name="email"
            type="email"
            aria-label="Email address"
            isRequired
          >
            <Label>Email address</Label>
            <FieldError />
            <Input />
          </TextField>

          <TextField
            name="password"
            type="password"
            aria-label="Password"
            isRequired
          >
            <Label>Password</Label>
            <FieldError />
            <Input />
          </TextField>

          <Checkbox isSelectec={termsAccepted} onChange={setTermsAccepted}>
            <div className="checkbox">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <polyline points="1 9 7 14 15 4" />
              </svg>
            </div>
            Accept terms?
          </Checkbox>

          <Button
            type="submit"
            isDisabled={(loading || !termsAccepted)}
          >
            {loading ? 'Signing up ...' : 'Sign Up'}
          </Button>
        </Form>
      </div>
    );
};

export default SignUpPage;
