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

// import styles from './signup.module.scss';
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
  first_name: string;
  last_name: string;
  institution: string;
  password: string;
};

const SignUpPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<SignupStepState>("email");
  const [isWorking, setIsWorking] = useState<bool>(false);

  // A general flag to set the invalid state for the entire form
  const [invalid, setInvalid] = useState<bool>(false);

  // Maps errors from the server to the form or fields within
  const [errors, setErrors] = useState<string[]>([]);

  // TODO: Type-safety
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [otherField, setOtherField] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState<bool>(false);

  const router = useRouter();
  const { csrfToken } = useCsrf();
  const { setIsAuthenticated } = useAuthContext();

  function handleInvalid(ev) {
    ev.preventDefault();
    setInvalid(true);
  }


  const handleSignUp = async (ev: React.FormEvent) => {
    ev.preventDefault();

    setLoading(true);
    setErrors([]);

    let data = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: password,
      institution: institution,
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

      if (csrfToken) {
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
          setLoading(false);
        }
      } else {
          setErrors(prev => prev.concat('Something went wrong'))
      }

    } catch (err: any) {
      logECS('error', 'Signup error', {
        error: err,
        url: { path: '/apollo-signup' }
      });
    } finally {
      setLoading(false);
    }
  };

  function handleSubmit(ev) {
    console.log(ev);
    if (!ev.nativeEvent || invalid) return;

    ev.nativeEvent.preventDefault();
    switch (step) {
      case "email":
        // TODO:: How do we detect SSO? For the time being we just go
        // straight to profile
        setStep("profile");
        break;

      case "profile":
        if (termsAccepted) setStep("final");

        console.log(ev.target);
        console.log(`Step? ${step}`);

        setIsWorking(true);

        console.log(`First name: ${firstName}`);
        console.log(`Last name: ${lastName}`);
        console.log(`Email: ${email}`);
        console.log(`Institution: ${institution}`);
        console.log(`Other: ${otherField}`);

        if (termsAccepted) {
          console.log("POST!!!");
          handleSignUp(ev);
        }

        break;
    }
  }


  useEffect(() => {
    if (invalid) {
      // if (errorRef.current) {
      //   errorRef.current.scrollIntoView({ behavior: 'smooth' });
      //   errorRef.current.focus();
      // }
    }
  }, [invalid]);

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
                To enable Single Sign On (SSO), use your institutional
                address. You will be redirected to your institution's single
                sign on platform
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
                setOtherField={setOtherField}
                required={true}
                helpText="Search for your institution"
                updateFormData={() => console.log('updating form')}
              />

              {otherField && (
                <TextField
                  name="institution"
                  id="fieldInstitution"
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
                isDisabled={loading}
                onPress={handleSubmit}
              >
                {loading ? '...' : 'Continue'}
              </Button>
            )}

            {(step === "profile") && (
              <Button
                type="submit"
                isDisabled={(loading || !termsAccepted)}
                onPress={handleSubmit}
              >
                {loading ? 'Signing up ...' : 'Sign Up'}
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

// const SignUpPage: React.FC = () => {
    // const [email, setEmail] = useState("");
    // const [password, setPassword] = useState("");
    // const [termsAccepted, setTermsAccepted] = useState<bool>(false);
    // const [errors, setErrors] = useState<string[]>([]);
    // const [loading, setLoading] = useState(false);
    // const router = useRouter();
    // const errorRef = useRef<HTMLDivElement>(null);
    // const { csrfToken } = useCsrf();
    // const { setIsAuthenticated } = useAuthContext();


    // useEffect(() => {
    //   if (errors) {
    //     if (errorRef.current) {
    //       errorRef.current.scrollIntoView({ behavior: 'smooth' });
    //       errorRef.current.focus();
    //     }
    //   }
    // }, [errors]);

    // return (
    //   <LayoutContainer id="signupPage">
    //     <ContentContainer ref={errorRef}>
    //       <Form className={styles.signupForm} onSubmit={handleSignUp}>
    //         {errors && errors.length > 0 &&
    //           <div className="error">
    //               {errors.map((error, index) => (
    //                   <p key={index}>{error}</p>
    //               ))}
    //           </div>
    //         }
    //         <h3 className={styles.heading3}>Create an account</h3>

    //         <TextField
    //           name="first_name"
    //           type="text"
    //           aria-label="First Name"
    //           isRequired
    //         >
    //           <Label>First Name</Label>
    //           <FieldError />
    //           <Input />
    //         </TextField>

    //         <TextField
    //           name="last_name"
    //           type="text"
    //           aria-label="Last Name"
    //           isRequired
    //         >
    //           <Label>Last Name</Label>
    //           <FieldError />
    //           <Input />
    //         </TextField>

    //         Institution, Cannot find institution checkbox

    //         <TextField
    //           name="email"
    //           type="email"
    //           aria-label="Email address"
    //           isRequired
    //         >
    //           <Label>Email address</Label>
    //           <FieldError />
    //           <Input />
    //         </TextField>

    //         <TextField
    //           name="password"
    //           type="password"
    //           aria-label="Password"
    //           isRequired
    //         >
    //           <Label>Password</Label>
    //           <FieldError />
    //           <Input />
    //         </TextField>

    //         <Checkbox isSelectec={termsAccepted} onChange={setTermsAccepted}>
    //           <div className="checkbox">
    //             <svg viewBox="0 0 18 18" aria-hidden="true">
    //               <polyline points="1 9 7 14 15 4" />
    //             </svg>
    //           </div>
    //           Accept terms?
    //         </Checkbox>

    //         <Button
    //           type="submit"
    //           isDisabled={(loading || !termsAccepted)}
    //         >
    //           {loading ? 'Signing up ...' : 'Sign Up'}
    //         </Button>
    //       </Form>
    //     </ContentContainer>
    //   </LayoutContainer>
    // );
// };

export default SignUpPage;
