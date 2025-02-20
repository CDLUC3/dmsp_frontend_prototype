'use client'

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import { useCsrf } from '@/context/CsrfContext';
import { handleErrors } from '@/utils/errorHandler';
import { useAuthContext } from '@/context/AuthContext';
import { useTranslations } from "next-intl";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Text,
  TextField,
} from "react-aria-components";
import {
  ContentContainer,
  LayoutContainer,
  ToolbarContainer,
} from '@/components/Container';
import styles from './login.module.scss';


type LoginSteps =
  | "email"
  | "sso"
  | "password";


const LoginPage: React.FC = () => {
  const t = useTranslations('LoginPage');

  const formRef = useRef<HTMLFormElement | null>(null);
  const [step, setStep] = useState<LoginSteps>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const { csrfToken } = useCsrf();
  const router = useRouter();

  console.log("***process.env.NEXT_PUBLIC_SERVER_ENDPOINT", process.env.NEXT_PUBLIC_SERVER_ENDPOINT);

  console.log("***process.env.NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);

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
      logECS('error', 'Login error', {
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
    <LayoutContainer className={styles.loginPage}>
      <ContentContainer className={styles.loginContent}>
        <h3>{t('pageTitle')}</h3>

        <Form
          className={styles.loginForm}
          onSubmit={handleSubmit}
          ref={formRef}
          data-step={step}
        >
          {errors && errors.length > 0 &&
            <div className={`error ${styles.error}`}>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          }

          {(step === "email" || "password") && (
            <TextField
              name="email"
              type="email"
              aria-label={t('emailAddress')}
              onChange={setEmail}
              value={email}
              isRequired
            >
              <Label>{t('emailAddress')}</Label>
              <Input data-testid="emailInput" />
              {(step === "email") && (
                <Text slot="description" className={styles.help}>
                  {t('singleSignOn')}
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
              aria-label={t('password')}
              onChange={setPassword}
              isRequired
            >
              <Label>{t('password')}</Label>
              <Input data-testid="passInput" />
              <FieldError />
              <Text slot="description" className={styles.help}>
                <Link>{t('forgotPassword')}</Link>
              </Text>
            </TextField>
          )}

          <ToolbarContainer className={styles.formActions}>
            {(step === "email") && (
              <Button
                type="submit"
                isDisabled={loading}
                data-testid="actionContinue"
              >
                {loading ? '...' : t('continue')}
              </Button>
            )}

            {(step === "password") && (
              <Button
                type="submit"
                isDisabled={loading}
                data-testid="actionSubmit"
              >
                {loading ? '...' : t('login')}
              </Button>
            )}
          </ToolbarContainer>

          <div className={styles.formLinks}>
            {(step === "email") && (
              <Link href="/signup/">{t('signupText')}</Link>
            )}
            <Link href="#">{t('getHelpText')}</Link>
          </div>
        </Form>
      </ContentContainer>
    </LayoutContainer>
  );
};

export default LoginPage;
