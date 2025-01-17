'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import TemplateSelectTemplatePage from '@/components/SelectExistingTemplate';
import {
  ContentContainer,
  LayoutContainer,
} from '@/components/Container';
import FormInput from '@/components/Form/FormInput';

const TemplateCreatePage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [errors, setErrors] = useState<string[]>([])
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const stepQueryValue = stepParam ? parseInt(stepParam, 10) : 1;


  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // redirect to select an existing template page
    if (templateName.length > 2) {
      router.push('/template/create?step=2')
    } else {
      setErrors(prev => [...prev, 'Please enter a valid value for template name.']);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    setTemplateName(e.target.value);
  }

  useEffect(() => {
    // If a step was specified in a query param, then set that step
    if (stepQueryValue) {
      setStep(stepQueryValue);
    }
  }, [stepQueryValue])

  // Show a loading state until the `step` is initialized
  if (step === null) {
    return <div>...Loading</div>
  }

  return (
    <>
      {errors && errors.length > 0 &&
        <div className="error" role="alert" aria-live="assertive">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      }
      {step === 1 && (
        <>
          <PageHeader
            title="Create a template"
            showBackButton={false}
            breadcrumbs={
              <Breadcrumbs>
                <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
                <Breadcrumb><Link href="/template">Template</Link></Breadcrumb>
                <Breadcrumb>Create a template</Breadcrumb>
              </Breadcrumbs>
            }
            actions={null}
            className="page-template-list"
          />

          <LayoutContainer>
            <ContentContainer>
              <Form onSubmit={handleNext}>
                <FormInput
                  name="template_name"
                  type="text"
                  label="Name of your template"
                  placeholder=""
                  value={templateName}
                  onChange={handleInputChange}
                  helpMessage="Don't worry, you can change this later."
                />

                <Button type="submit"
                  className="">Next</Button>

              </Form>
            </ContentContainer>
          </LayoutContainer>
        </>
      )}
      {step == 2 && (
        <TemplateSelectTemplatePage
          templateName={templateName}
        />
      )}

    </>
  );
}

export default TemplateCreatePage;