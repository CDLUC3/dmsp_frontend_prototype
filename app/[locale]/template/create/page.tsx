'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Radio,
  RadioGroup,
  SearchField,
  Text,
  TextField
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import TemplateSelectTemplatePage from '@/components/SelectExistingTemplate';
import {
  ContentContainer,
  LayoutContainer,
} from '@/components/Container';
import FormInput from '@/components/Form/FormInput';
import TemplateSelectListItem from "@/components/TemplateSelectListItem";

// NSF Templates
const nsfTemplates = [
  {
    funder: 'National Science Foundation (nsf.gov)',
    title: 'Arctic Data Center: NSF Polar Programs',
    description: 'Template for NSF Polar Programs data management plans.',
    lastRevisedBy: 'Sue Jones',
    lastUpdated: '04-01-2024',
    hasAdditionalGuidance: true
  },
  {
    funder: 'National Science Foundation (nsf.gov)',
    title: 'NSF Polar Expeditions',
    description: 'Specialized template for NSF polar expedition data management.',
    lastRevisedBy: 'Sue Jones',
    lastUpdated: '04-01-2024',
    hasAdditionalGuidance: false,
    publishStatus: 'Unpublished'
  },
  {
    funder: 'National Science Foundation (nsf.gov)',
    title: 'NSF: McMurdo Station (Antarctic)',
    description: 'Template specifically designed for McMurdo Station research projects.',
    lastRevisedBy: 'Sue Jones',
    lastUpdated: '09-21-2024',
    hasAdditionalGuidance: false
  }
];

// Public DMP Templates
const publicTemplates = [
  {
    funder: 'DMP Tool',
    title: 'General Research DMP',
    description: 'A general-purpose data management plan template suitable for various research projects.',
    lastRevisedBy: 'John Smith',
    lastUpdated: '03-15-2024',
    hasAdditionalGuidance: false
  },
  {
    funder: 'DMP Tool',
    title: 'Humanities Research DMP',
    description: 'Template designed for humanities research data management.',
    lastRevisedBy: 'Mary Johnson',
    lastUpdated: '03-28-2024',
    hasAdditionalGuidance: false
  },
  {
    funder: 'DMP Tool',
    title: 'Social Sciences DMP',
    description: 'Specialized template for social sciences research data management.',
    lastRevisedBy: 'David Wilson',
    lastUpdated: '04-01-2024',
    hasAdditionalGuidance: false
  }
];

const TemplateCreatePage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
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
        <TemplateSelectTemplatePage />
      )}

    </>
  );
}

export default TemplateCreatePage;