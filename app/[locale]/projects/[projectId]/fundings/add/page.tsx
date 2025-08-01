'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
  ListBoxItem,
} from "react-aria-components";

import {
  ProjectFundingStatus,
  AffiliationErrors,
  ProjectFundingErrors,
  useAddAffiliationMutation,
  useAddProjectFundingMutation,
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { FormInput, FormSelect } from "@/components/Form";
import ErrorMessages from '@/components/ErrorMessages';

import { scrollToTop } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';

import styles from './addFunderManually.module.scss';


interface FieldErrorsInterface {
  funderName: string;
  funderGrantId: string;
  funderOpportunityNumber: string;
  funderProjectNumber: string;
}

interface ProjectFundingInterface {
  funderName: string;
  fundingStatus: ProjectFundingStatus;
  funderGrantId: string;
  funderOpportunityNumber: string;
  funderProjectNumber: string;
}

const AddProjectFunderManually = () => {
  const editFunding = useTranslations('ProjectsProjectFundingEdit');
  const global = useTranslations('Global');

  const toastState = useToast();
  const topRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.projectId);

  if (isNaN(projectId)) {
    // TODO:: Big Error, shouldn't happen what to do here?
    // Redirect?
    // 400?
    // definitely log the error
  }

  const [addAffiliation] = useAddAffiliationMutation();
  const [addProjectFunding] = useAddProjectFundingMutation();

  const [fundingData, setFundingData] = useState<ProjectFundingInterface>({
    funderName: '',
    fundingStatus: ProjectFundingStatus.Planned,
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const fundingStatuses = Object.values(ProjectFundingStatus).map(status => ({
    id: status,
    name: status.toLowerCase()
  }));

  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsInterface>({
    funderName: '',
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });


  function clearAllFieldErrors() {
    setFieldErrors({
      funderName: '',
      funderGrantId: '',
      funderOpportunityNumber: '',
      funderProjectNumber: ''
    });
  }

  // Show Success Message
  function showSuccessToast() {
    const successMessage = editFunding('messages.success.projectFundingUpdated');
    toastState.add(successMessage, { type: 'success' });
    scrollToTop(topRef);
  }

  /**
   * Check if there are any errors from our two graphql queries.
   * returns true if any error was detected.
   */
  function hasAffiliationErrors(errs: AffiliationErrors): boolean {
    if (!errs) return false;

    const keys: (keyof AffiliationErrors)[] = [
      "name",
    ];
    return keys.some((k) => !!errs[k]);
  }

  function hasProjectFundingErrors(errs: ProjectFundingErrors): boolean {
    if (!errs) return false;

    // is ProjectFunding error
    const keys: (keyof ProjectFundingErrors)[] = [
      "projectId",
      "affiliationId",
      "funderOpportunityNumber",
      "funderProjectNumber",
      "grantId",
      "general",
      "status",
    ];
    return keys.some((k) => !!errs[k]);
  }

  // Handle any changes to form field values
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFundingData({ ...fundingData, [name]: value });
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Clear previous error messages
    clearAllFieldErrors();
    setErrors([]);

    // First we need to add the Affiliation
    addAffiliation({
      variables: {
        input: {
          funder: true,
          name: fundingData.funderName,
      
        },
      }
    }).then((result) => {
      if (result && result.data) {
        const data = result.data;
        const hasErrors = hasAffiliationErrors(data?.addAffiliation?.errors as AffiliationErrors);
        if (hasErrors) {
          setFieldErrors({
            ...fieldErrors,
            funderName: data?.addAffiliation?.errors?.name || '',
          });
          setErrors([editFunding('messages.errors.projectFundingUpdateFailed')]);
        } else {
          const affiliationId = data!.addAffiliation!.id;
          return addProjectFunding({
            variables: {
              input: {
                projectId,
                affiliationId: String(affiliationId),
                funderOpportunityNumber: fundingData.funderOpportunityNumber,
                funderProjectNumber: fundingData.funderProjectNumber,
                grantId: fundingData.funderGrantId,
                status: fundingData.fundingStatus,
              },
            },
          });
        }
      }
    }).then((result) => {
      if (result && result.data) {
        const data = result.data;
        const hasErrors = hasProjectFundingErrors(data?.addProjectFunding?.errors as ProjectFundingErrors);
        if (hasErrors) {
          const errs = data?.addProjectFunding?.errors;
          setFieldErrors({
            ...fieldErrors,
            funderGrantId: errs?.grantId || '',
            funderOpportunityNumber: errs?.funderOpportunityNumber || '',
            funderProjectNumber: errs?.funderProjectNumber || '',
          });
          setErrors([editFunding('messages.errors.projectFundingUpdateFailed')]);
        } else {
          showSuccessToast();
          router.push(`/projects/${projectId}/fundings`);
        }
      }
    }).catch((err) => {
      logECS('error', 'addProjectFunderManually', {
        err,
        url: { path: '/projects/[projectId]/fundings/add' }
      });
      setErrors(prevErrors => [...prevErrors, editFunding('messages.errors.projectFundingUpdateFailed')]);
    });
  };

  return (
    <>
      <div ref={topRef} />
      <PageHeader
        title={editFunding('title')}
        description={editFunding('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}/fundings`}>{global('breadcrumbs.projectFunding')}</Link></Breadcrumb>
            <Breadcrumb>{editFunding('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-funding-edit"
      />
      <LayoutContainer>
        <ContentContainer>
          <ErrorMessages errors={errors} ref={errorRef} />
          <Form onSubmit={handleFormSubmit}>
            <FormInput
              name="funderName"
              type="text"
              isRequired={true}
              label={editFunding('labels.funderName')}
              value={fundingData.funderName}
              onChange={handleInputChange}
              isInvalid={(!fundingData.funderName || !!fieldErrors.funderName)}
              errorMessage={fieldErrors.funderName.length > 0 ? fieldErrors.funderName : editFunding('messages.errors.fundingName')}
            />

            <FormSelect
              label={editFunding('labels.fundingStatus')}
              isRequired
              name="fundingStatus"
              items={fundingStatuses}
              selectClasses={styles.fundingStatusSelect}
              onChange={value => setFundingData({ ...fundingData, fundingStatus: value as ProjectFundingStatus})}
              selectedKey={fundingData.fundingStatus}
            >
              {fundingStatuses && fundingStatuses.map((status) => {
                return (
                  <ListBoxItem key={status.id}>{status.name}</ListBoxItem>
                )
              })}
            </FormSelect>

            <FormInput
              name="funderGrantId"
              type="text"
              isRequired={true}
              label={editFunding('labels.grantNumber')}
              value={fundingData.funderGrantId}
              onChange={handleInputChange}
              isInvalid={(!fundingData.funderGrantId || !!fieldErrors.funderGrantId)}
              errorMessage={fieldErrors.funderGrantId.length > 0 ? fieldErrors.funderGrantId : editFunding('messages.errors.fundingGrantId')}
            />

            <FormInput
              name="funderProjectNumber"
              type="text"
              isRequired={true}
              label={editFunding('labels.projectNumber')}
              value={fundingData.funderProjectNumber}
              onChange={handleInputChange}
              isInvalid={(!fundingData.funderProjectNumber || !!fieldErrors.funderProjectNumber)}
              errorMessage={fieldErrors.funderProjectNumber.length > 0 ? fieldErrors.funderProjectNumber : editFunding('messages.errors.fundingProjectNumber')}
            />

            <FormInput
              name="funderOpportunityNumber"
              type="text"
              isRequired={true}
              label={editFunding('labels.opportunity')}
              value={fundingData.funderOpportunityNumber}
              onChange={handleInputChange}
              isInvalid={(!fundingData.funderOpportunityNumber || !!fieldErrors.funderOpportunityNumber)}
              errorMessage={fieldErrors.funderOpportunityNumber.length > 0 ? fieldErrors.funderOpportunityNumber : editFunding('messages.errors.fundingProjectNumber')}
            />

            <Button type="submit" className="submit-button">{global('buttons.saveChanges')}</Button>
          </Form>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default AddProjectFunderManually;
