'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";
import {
  Button,
  Form,
  TextField,
  Link,
  Text,
  Label,
  Input,
  FieldError,
  Checkbox,
} from "react-aria-components";

import { AffiliationsDocument } from '@/generated/graphql';
import {useCsrf} from '@/context/CsrfContext';
import logECS from '@/utils/clientLogger';
import {handleErrors} from '@/utils/errorHandler';
import {useAuthContext} from '@/context/AuthContext';
import TypeAheadWithOther from '@/components/Form/TypeAheadWithOther';

import {
  LayoutContainer,
  ContentContainer,
  ToolbarContainer,
} from '@/components/Container';
import styles from './signup.module.scss';


type SignupStepState =
  | "email"
  | "sso"
  | "profile";


type signupDataMap = {
  email: string;
  givenName: string;
  surName: string;
  affiliationId: string;
  otherAffiliationName: string;
  password: string;
  acceptedTerms: boolean,
};

type fieldErrorsMap = {
  email: string;
  givenName: string;
  surName: string;
  affiliationId: string;
  otherAffiliationName: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage: React.FC = () => {
  const t = useTranslations('SignupPage');

  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const { csrfToken } = useCsrf();
  const { setIsAuthenticated } = useAuthContext();

  const [step, setStep] = useState<SignupStepState>("email");
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [invalid, setInvalid] = useState<boolean>(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<fieldErrorsMap>({
    email: "",
    givenName: "",
    surName: "",
    affiliationId: "",
    otherAffiliationName: "",
    password: "",
    confirmPassword: "",
  });

  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [otherField, setOtherField] = useState<boolean>(false);
  const [otherAffiliation, setOtherAffiliation] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);


  async function handleSignUp() {
    setIsWorking(true);
    setErrors([]);

    const data: signupDataMap = {
      givenName: firstName,
      surName: lastName,
      email,
      password,
      affiliationId: institution,
      otherAffiliationName: otherAffiliation,
      acceptedTerms: termsAccepted,
    };

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
    } catch (err: any) {
      logECS('error', 'Signup error', {
        error: err,
        url: { path: '/apollo-signup' }
      });
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsWorking(false);
    }
  };

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    if (!ev.nativeEvent || invalid || hasErrors()) return;
    ev.nativeEvent.preventDefault();

    setIsWorking(true);
    switch (step) {
      case "email":
        // TODO:: How do we detect SSO? For the time being we just go
        // straight to profile
        setStep("profile");
        break;

      case "profile":
        if (password !== confirmPassword) {
          setFieldErrors({
            ...fieldErrors,
            confirmPassword: t('passMissMatch'),
          });
          setErrors([t('fixBelow')]);
          setInvalid(true);
        } else if (termsAccepted) {
          handleSignUp();
        }
        break;
    }
    setIsWorking(false);
  }

  function hasErrors() {
    return Object.values(fieldErrors).some(v => v.trim() !== "");
  }

  function reFocusForm() {
    const appElement = document.getElementById("App") as HTMLElement;
    if (appElement) appElement.scrollIntoView({ behavior: 'smooth' });
    if (formRef.current) {
      // Focus the first input in the form, since we cannot use focus() on
      // a form itself.
      const formEl = formRef.current as HTMLElement;
      const inputEl = formEl.querySelector('input') as HTMLElement;
      if (inputEl) inputEl.focus();
    }
  }

  function updateAffiliations(dataId: string, value: string) {
    if (dataId) {
      setInstitution(dataId);
    } else if (value.toLowerCase() === "other") {
      setInstitution("");
    }
  }

  useEffect(() => {
    reFocusForm();
  }, [step]);

  useEffect(() => {
    if (invalid || errors) {
      reFocusForm();
    }
  }, [invalid, errors]);

  return (
    <LayoutContainer className={styles.signupPage}>
      <ContentContainer className={styles.signupContent}>
        {(step === "email") ? (
          <h3>{t('register')}</h3>
        ) : (
          <h3>{t('createAccount')}</h3>
        )}

        <Form
          className={styles.signupForm}
          role="form"
          onSubmit={handleSubmit}
          validationErrors={fieldErrors}
          data-step={step}
          ref={formRef}
        >
          {errors && errors.length > 0 &&
            <div className="error">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          }

          {(step === "email") && (
            <TextField
              name="email"
              type="email"
              aria-label={t('emailAddress')}
              value={email}
              onChange={setEmail}
              isRequired
            >
              <Label>{t('emailAddress')}</Label>
              <Input />
              <Text slot="description" className={styles.help}> {t('emailHelp')} </Text>
              <FieldError />
            </TextField>
          )}

          {(step === "profile") && (
            <>
              <div className="two-item-row">
                <TextField
                  name="first_name"
                  type="text"
                  aria-label={t('firstName')}
                  isRequired
                  onChange={setFirstName}
                >
                  <Label>{t('firstName')}</Label>
                  <Input />
                  <FieldError />
                </TextField>

                <TextField
                  name="last_name"
                  type="text"
                  aria-label={t('lastName')}
                  isRequired
                  onChange={setLastName}
                >
                  <Label>{t('lastName')}</Label>
                  <Input />
                  <FieldError />
                </TextField>
              </div>

              <TypeAheadWithOther
                className={styles.typeAhead}
                label={t('institution')}
                fieldName="institution"
                graphqlQuery={AffiliationsDocument}
                resultsKey="affiliations"
                setOtherField={setOtherField}
                required={true}
                helpText={t('institutionHelp')}
                updateFormData={updateAffiliations}
              />
              {otherField && (
                <TextField
                  name="otherAffiliation"
                  id="fieldInstitution"
                  onChange={setOtherAffiliation}
                >
                  <Label>{t('institutionOther')}</Label>
                  <Input
                    data-testid="otherAffiliation"
                    placeholder={t('institutionOtherPlaceholder')}
                  />
                  <FieldError />
                </TextField>
              )}

              <TextField
                name="email"
                type="email"
                aria-label={t('emailAddress')}
                onChange={setEmail}
                value={email}
                isRequired
              >
                <Label>{t('emailAddress')}</Label>
                <Input />
                <FieldError />
              </TextField>

              <TextField
                name="password"
                type="password"
                aria-label={t('password')}
                isRequired
                onChange={setPassword}
              >
                <Label>{t('password')}</Label>
                <Input data-testid="pass" />
                <FieldError />
              </TextField>

              <TextField
                name="confirmPassword"
                type="password"
                aria-label={t('passwordConfirm')}
                isRequired
                onChange={setConfirmPassword}
              >
                <Label>{t('passwordConfirm')}</Label>
                <Input data-testid="confirmpass" />
                <FieldError />
              </TextField>

              <Checkbox
                isSelected={termsAccepted}
                onChange={setTermsAccepted}>
                <div className="checkbox">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                {t('acceptTerms')}
              </Checkbox>
            </>
          )}

          <ToolbarContainer className={styles.formActions}>
            {(step === "email") && (
              <Button
                type="submit"
                isDisabled={isWorking}
                data-testid="continue"
              >
                {isWorking ? '...' : t('submitContinue')}
              </Button>
            )}

            {(step === "profile") && (
              <Button
                type="submit"
                isDisabled={(isWorking || !termsAccepted)}
                data-testid="signup"
              >
                {isWorking ? t('signingUp') + ' ...' : t('submitSignup')}
              </Button>
            )}
          </ToolbarContainer>

          {(step === "email") && (
            <div className={styles.formLinks}>
              <Link href="/login/">{t('loginLink')}</Link>
              <Link href="#">{t('helpLink')}</Link>
            </div>
          )}
        </Form>
      </ContentContainer>
    </LayoutContainer>
  );
}

export default SignUpPage;
