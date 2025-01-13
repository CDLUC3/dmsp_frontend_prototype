'use client'

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import { useCsrf } from '@/context/CsrfContext';
import { handleErrors } from '@/utils/errorHandler';
import { useAuthContext } from '@/context/AuthContext';
import './login.scss';
import {
  Button,
  Form,
  TextField,
  Link,
  Text,
  Label,
  Input,
  FieldError,
} from "react-aria-components";
import {
  LayoutContainer,
  ContentContainer,
  ToolbarContainer,
} from '@/components/Container';


type LoginSteps =
  | "email"
  | "sso"
  | "password";


const LoginPage: React.FC = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [step, setStep] = useState<LoginSteps>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const { csrfToken } = useCsrf();
  const router = useRouter();
  const { setIsAuthenticated } = useAuthContext();

  const handleLogin = async () => {
    setLoading(true);
    setErrors([]);  // Clear previous errors

    const loginRequest = async (token: string | null) => {
      return await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/apollo-signin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': token || '',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
    }

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
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    switch (step) {
      case "email":
        // TODO: Detect SSO email and redirect to that page. For now just
        // go to normal login step.
        setStep("password");
        break;

      case "password":
        handleLogin();
        break;
    }
  }

  function reFocusForm() {
    if (formRef.current) {
      // Focus the first input in the form.
      const formEl = formRef.current as HTMLElement;
      const inputEl = formEl.querySelector('input') as HTMLElement;
      if (inputEl) inputEl.focus();
    }
  }

  useEffect(() => {
    if (errors) {
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth' });
        errorRef.current.focus();
      }
    }
    reFocusForm();
  }, [errors])

  useEffect(() => {
    if (step === "password") {
      if (formRef.current) {
        const formEl = formRef.current as HTMLElement;
        const inputEl = formEl.querySelector('#password') as HTMLElement;
        if (inputEl) inputEl.focus();
      }
    }
  }, [step]);

  return (
    <LayoutContainer id="loginPage">
      <ContentContainer>
        <h3>Sign In</h3>

        <Form
          id="loginForm"
          onSubmit={handleSubmit}
          ref={formRef}
          data-step={step}
        >
          {errors && errors.length > 0 &&
            <div className="error">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          }

          {(step === "email" || "password") && (
            <TextField
              name="email"
              type="email"
              aria-label="Email address"
              onChange={setEmail}
              value={email}
              isRequired
            >
              <Label>Email address</Label>
              <Input data-testid="emailInput" />
              {(step === "email") && (
                <Text slot="description" className="help">
                  To enable Single Sign On (SSO), use your institutional
                  address. You will be redirected to your institution&apos;s single
                  sign on platform.
                </Text>
              )}
              <FieldError />
            </TextField>
          )}

          {(step === "password") && (
            <TextField
              id="password"
              name="password"
              type="password"
              aria-label="Password"
              onChange={setPassword}
              isRequired
            >
              <Label>Password</Label>
              <Input data-testid="passInput" />
              <FieldError />
              <Text slot="description" className="help">
                <Link>Forgot Password?</Link>
              </Text>
            </TextField>
          )}

          <ToolbarContainer className="form-actions">
            {(step === "email") && (
              <Button
                type="submit"
                isDisabled={loading}
                data-testid="actionContinue"
              >
                {loading ? '...' : 'Continue'}
              </Button>
            )}

            {(step === "password") && (
              <Button
                type="submit"
                isDisabled={loading}
                data-testid="actionSubmit"
              >
                {loading ? '...' : 'Submit'}
              </Button>
            )}
          </ToolbarContainer>

          <div className="form-links">
            {(step === "email") && (
              <Link href="/signup/">Create a free DMP Tool account instead</Link>
            )}
            <Link href="#">Get help</Link>
          </div>
        </Form>
      </ContentContainer>
    </LayoutContainer>
  );
};

export default LoginPage;
