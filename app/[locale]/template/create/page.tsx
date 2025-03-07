'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from "react-aria-components";
import sanitizeHtml from 'sanitize-html';

// Components
import PageHeader from "@/components/PageHeader";
import TemplateSelectTemplatePage from '@/components/SelectExistingTemplate';
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import FormInput from '@/components/Form/FormInput';

import { debounce } from '@/hooks/debounce';
import { useQueryStep } from '@/app/[locale]/template/create/useQueryStep';

const TemplateCreatePage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const stepQueryValue = useQueryStep();

  //Localization keys
  const TemplateCreate = useTranslations('TemplateCreatePage');
  const Global = useTranslations('Global');

  // Debounced input handler
  const debouncedInputHandler = useMemo(
    () =>
      debounce((value: string) => {
        setErrors({});
        const sanitizedTemplateName = sanitizeHtml(value);
        setTemplateName(sanitizedTemplateName);
      }, 30),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedInputHandler(e.target.value);
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // If user enters a valid template name, we want to redirect them to
    // Step 2 of the create template pages, which is the 'Start with a copy of an existing template' page
    if (templateName.length > 2) {
      router.push('/template/create?step=2')
    } else {
      setErrors({ templateName: TemplateCreate('messages.templateNameError') });
    }
  }

  useEffect(() => {
    // If a step was specified in a query param, then set that step (step 1 or 2)
    if (step !== stepQueryValue) {
      setStep(stepQueryValue);
    }
  }, [stepQueryValue, step])

  // TODO: Need to implement a shared loading component
  if (step === null) {
    return <div>...{Global('messaging.loading')}</div>
  }

  return (
    <>
      {step === 1 && (
        <>
          <PageHeader
            title={Global('breadcrumbs.createTemplate')}
            showBackButton={false}
            breadcrumbs={
              <Breadcrumbs>
                <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
                <Breadcrumb><Link href="/template">{Global('breadcrumbs.template')}</Link></Breadcrumb>
                <Breadcrumb>{Global('breadcrumbs.createTemplate')}</Breadcrumb>
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
                  label={TemplateCreate('nameOfYourTemplate')}
                  placeholder=""
                  value={templateName}
                  onChange={handleInputChange}
                  helpMessage={TemplateCreate('helpText')}
                  errorMessage={errors.templateName ? errors.templateName : ''}
                  isInvalid={!!errors.templateName}
                />

                <Button type="submit">
                  {Global('buttons.next')}
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
