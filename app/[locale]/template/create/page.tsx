'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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

import { debounce } from '@/hooks/debounce';
import { useQueryStep } from '@/app/[locale]/template/create/useQueryStep';

const TemplateCreatePage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const stepQueryValue = useQueryStep();

  // Debounced input handler
  const debouncedInputHandler = useMemo(
    () =>
      debounce((value: string) => {
        setErrors({});
        setTemplateName(value);
      }, 30),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedInputHandler(e.target.value);
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // redirect to select an existing template page
    if (templateName.length > 2) {
      router.push('/template/create?step=2')
    } else {
      setErrors({ templateName: 'Please enter a valid value for template name.' });
    }
  }

  useEffect(() => {
    // If a step was specified in a query param, then set that step
    if (step !== stepQueryValue) {
      setStep(stepQueryValue);
    }
  }, [stepQueryValue])

  // TODO: Need to implement a shared loading component
  if (step === null) {
    return <div>...Loading</div>
  }

  return (
    <>
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
                  name="templateName"
                  type="text"
                  label="Name of your template"
                  placeholder=""
                  value={templateName}
                  onChange={handleInputChange}
                  helpMessage="Don't worry, you can change this later."
                  errorMessage={errors.templateName ? errors.templateName : ''}
                  isInvalid={!!errors.templateName}
                />

                <Button type="submit">
                  Next
                </Button>

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