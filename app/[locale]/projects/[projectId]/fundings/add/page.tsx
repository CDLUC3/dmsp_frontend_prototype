'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { routePath } from '@/utils/routes';
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
  const addFunding = useTranslations('ProjectsProjectFundingAdd');
  const global = useTranslations('Global');

  const toastState = useToast();
  const topRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.projectId);

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
    const successMessage = addFunding('messages.success.projectFundingUpdated');
    toastState.add(successMessage, { type: 'success' });
    scrollToTop(topRef);
  }

  /**
   * Check if there are any errors from our addAffilitation graphql mutation.
   *
   * Returns true if any error was detected, as well as the original error
   * object that should now be type casted correctly
   */
  function hasAffiliationErrors(errs: AffiliationErrors): [boolean, AffiliationErrors] {
    const noErrors = Object.values(errs).every(val => val === null);
    if (noErrors) return [false, errs];

    const keys: (keyof AffiliationErrors)[] = [
      "name",
    ];

    return [keys.some((k) => !!errs[k]), errs];
  }

  /**
   * Check if there are any errors from our addProjectFunding graphql mutation.
   *
   * Returns true if any error was detected, as well as the original error
   * object that should now be type casted correctly
   */
  function hasProjectFundingErrors(errs: ProjectFundingErrors): [boolean, ProjectFundingErrors] {
    const noErrors = Object.values(errs).every(val => val === null);
    if (noErrors) return [false, errs];

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

    return [keys.some((k) => !!errs[k]), errs];
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
      const data = result!.data!;
      const affiliationId = data!.addAffiliation!.uri;

      const [hasErrors, errs] = hasAffiliationErrors(data?.addAffiliation?.errors as AffiliationErrors);
      if (hasErrors) {
        setFieldErrors({
          ...fieldErrors,
          funderName: String(errs.name),
        });
        setErrors([addFunding('messages.errors.projectFundingUpdateFailed')]);
      } else {
        return addProjectFunding({
          variables: {
            input: {
              projectId,
              affiliationId,
              funderOpportunityNumber: fundingData.funderOpportunityNumber,
              funderProjectNumber: fundingData.funderProjectNumber,
              grantId: fundingData.funderGrantId,
              status: fundingData.fundingStatus,
            },
          },
        });
      }
    }).then((result) => {
      if (result && result.data) {
        const data = result.data;
        const [hasErrors, errs] = hasProjectFundingErrors(data?.addProjectFunding?.errors as ProjectFundingErrors);
        if (hasErrors) {
          setFieldErrors({
            ...fieldErrors,
            funderGrantId: String(errs.grantId),
            funderOpportunityNumber: String(errs.funderOpportunityNumber),
            funderProjectNumber: String(errs.funderProjectNumber),
          });
          setErrors([addFunding('messages.errors.projectFundingUpdateFailed')]);
        } else {
          showSuccessToast();
          router.push(routePath('projects.fundings.index', {projectId}));
        }
      }
    }).catch((err) => {
      logECS('error', 'addProjectFunderManually', {
        err,
        url: { path: '/projects/[projectId]/fundings/add' }
      });
      setErrors(prevErrors => [...prevErrors, addFunding('messages.errors.projectFundingUpdateFailed')]);
    });
  };

  return (
    <>
      <div ref={topRef} />
      <PageHeader
        title={addFunding('title')}
        description={addFunding('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index', {projectId})}>{global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', {projectId})}>{global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.fundings.index', {projectId})}>{global('breadcrumbs.projectFunding')}</Link></Breadcrumb>
            <Breadcrumb>{addFunding('title')}</Breadcrumb>
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
              label={addFunding('labels.funderName')}
              value={fundingData.funderName}
              onChange={handleInputChange}
              isInvalid={(!fundingData.funderName || !!fieldErrors.funderName)}
              errorMessage={fieldErrors.funderName.length > 0 ? fieldErrors.funderName : addFunding('messages.errors.fundingName')}
            />

            <FormSelect
              label={addFunding('labels.fundingStatus')}
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
              label={addFunding('labels.grantNumber')}
              value={fundingData.funderGrantId}
              onChange={handleInputChange}
              isInvalid={!!fieldErrors.funderGrantId}
              errorMessage={fieldErrors.funderGrantId}
            />

            <FormInput
              name="funderProjectNumber"
              type="text"
              label={addFunding('labels.projectNumber')}
              value={fundingData.funderProjectNumber}
              onChange={handleInputChange}
              isInvalid={!!fieldErrors.funderProjectNumber}
              errorMessage={fieldErrors.funderProjectNumber}
            />

            <FormInput
              name="funderOpportunityNumber"
              type="text"
              label={addFunding('labels.opportunity')}
              value={fundingData.funderOpportunityNumber}
              onChange={handleInputChange}
              isInvalid={!!fieldErrors.funderOpportunityNumber}
              errorMessage={fieldErrors.funderOpportunityNumber}
            />

            <Button type="submit" className="submit-button">{global('buttons.saveChanges')}</Button>
          </Form>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default AddProjectFunderManually;
