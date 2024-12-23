'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

import './signup.scss';

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
  acceptedTerms: bool,
};

const SignUpPage: React.FC = () => {
  const formRef = useRef();
  const router = useRouter();
  const { csrfToken } = useCsrf();
  const { setIsAuthenticated } = useAuthContext();

  const [step, setStep] = useState<SignupStepState>("email");
  const [isWorking, setIsWorking] = useState<bool>(false);
  const [invalid, setInvalid] = useState<bool>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [otherField, setOtherField] = useState<bool>(false);
  const [otherAffiliation, setOtherAffiliation] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<bool>(false);


  function handleInvalid(ev) {
    ev.preventDefault();
    setInvalid(true);
  }

  const handleSignUp = async () => {
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
    } finally {
      setIsWorking(false);
    }
  };

  function handleSubmit(ev) {
    if (!ev.nativeEvent || invalid) return;
    ev.nativeEvent.preventDefault();

    switch (step) {
      case "email":
        // TODO:: How do we detect SSO? For the time being we just go
        // straight to profile
        setStep("profile");
        break;

      case "profile":
        setIsWorking(true);
        if (termsAccepted) {
          handleSignUp();
        }
        break;
    }
  }

  function reFocusForm() {
    document.getElementById("App").scrollIntoView({ behavior: 'smooth' });
    if (formRef.current) {
      // Focus the first input in the form, since we cannot use focus() on
      // a form itself.
      formRef.current.querySelector('input').focus();
    }
  }

  function updateAffiliations(dataId, value) {
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
    <LayoutContainer id="signupPage">
      <ContentContainer>
        {(step === "email") ? (
          <h3>Register</h3>
        ) : (
          <h3>Create a DMP Tool Account</h3>
        )}

        <Form
          id="signupForm"
          onSubmit={handleSubmit}
          onInvalid={handleInvalid}
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
              aria-label="Email address"
              value={email}
              onChange={setEmail}
              isRequired
            >
              <Label>Email address</Label>
              <Input />
              <Text slot="description" className="help">
                To enable Single Sign On (SSO), use your institutional address.
                You will be redirected to your institution&lsquo;s single sign
                on platform
              </Text>
              <FieldError />
            </TextField>
          )}

          {(step === "profile") && (
            <>
              <div className="two-item-row">
                <TextField
                  name="first_name"
                  type="text"
                  aria-label="First Name"
                  isRequired
                  onChange={setFirstName}
                >
                  <Label>First Name</Label>
                  <Input />
                  <FieldError />
                </TextField>

                <TextField
                  name="last_name"
                  type="text"
                  aria-label="Last Name"
                  isRequired
                  onChange={setLastName}
                >
                  <Label>Last Name</Label>
                  <Input />
                  <FieldError />
                </TextField>
              </div>

              <TypeAheadWithOther
                className="typeahead-with-other"
                label="Institution"
                fieldName="institution"
                graphqlQuery={AffiliationsDocument}
                resultsKey="affiliations"
                setOtherField={setOtherField}
                required={true}
                helpText="Search for your institution"
                updateFormData={updateAffiliations}
              />

              {otherField && (
                <TextField
                  name="otherAffiliation"
                  id="fieldInstitution"
                  onChange={setOtherAffiliation}
                >
                  <Label>Other institution</Label>
                  <Input placeholder="Enter custom institution name" />
                  <FieldError />
                </TextField>
              )}

              <TextField
                name="email"
                type="email"
                aria-label="Email address"
                onChange={setEmail}
                value={email}
                isRequired
              >
                <Label>Email address</Label>
                <Input />
                <FieldError />
              </TextField>

              <TextField
                name="password"
                type="password"
                aria-label="Password"
                isRequired
                onChange={setPassword}
              >
                <Label>Password</Label>
                <Input />
                <FieldError />
              </TextField>

              <Checkbox
                isSelectec={termsAccepted}
                onChange={setTermsAccepted}>
                <div className="checkbox">
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                Accept terms?
              </Checkbox>
            </>
          )}

          <ToolbarContainer className="form-actions">
            {(step === "email") && (
              <Button
                type="submit"
                isDisabled={isWorking}
                onPress={handleSubmit}
              >
                {isWorking ? '...' : 'Continue'}
              </Button>
            )}

            {(step === "profile") && (
              <Button
                type="submit"
                isDisabled={(isWorking || !termsAccepted)}
                onPress={handleSubmit}
              >
                {isWorking ? 'Signing up ...' : 'Sign Up'}
              </Button>
            )}
          </ToolbarContainer>

          {(step === "email") && (
            <div className="form-links">
              <Link href="/login/">Alread have a DMP Account?</Link>
              <Link href="#">Get help</Link>
            </div>
          )}
        </Form>
      </ContentContainer>
    </LayoutContainer>
  );
}

export default SignUpPage;
