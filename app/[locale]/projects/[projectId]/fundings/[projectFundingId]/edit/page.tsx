'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ApolloError } from '@apollo/client';
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
  AffiliationErrors,
  ProjectFundingErrors,
  ProjectFundingStatus,
  useProjectFundingQuery,
  useUpdateProjectFundingMutation
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer } from "@/components/Container";
import { FormInput, FormSelect } from "@/components/Form";
import ErrorMessages from '@/components/ErrorMessages';
import { TypeAheadWithOther, useAffiliationSearch } from '@/components/Form/TypeAheadWithOther';

import { scrollToTop } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { routePath } from '@/utils/routes';
import { useToast } from '@/context/ToastContext';

import styles from './projectFunding.module.scss';

interface ProjectFundingFormErrorsInterface {
  affiliationId: string;
  otherAffiliationName: string;
  funderGrantId: string;
  funderOpportunityNumber: string;
  funderProjectNumber: string;
}

interface ProjectFundingInterface {
  affiliationName: string;
  affiliationId: string;
  otherAffiliationName: string;
  fundingStatus: ProjectFundingStatus;
  funderGrantId: string;
  funderOpportunityNumber: string;
  funderProjectNumber: string;
}

const ProjectsProjectFundingEdit = () => {
  const toastState = useToast(); // Access the toast state from context
  const router = useRouter(); // Access the router object

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Get projectId and projectFundingID
  const params = useParams();
  // From route /projects/:projectId/fundings/:projectFundingId/edit
  const projectId = String(params.projectId);
  const projectFundingId = String(params.projectFundingId);

  // For TypeAhead component
  const { suggestions, handleSearch } = useAffiliationSearch();

  const [projectFunding, setProjectFunding] = useState<ProjectFundingInterface>({
    affiliationName: '',
    affiliationId: '',
    otherAffiliationName: '',
    fundingStatus: ProjectFundingStatus.Planned,
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const [fieldErrors, setFieldErrors] = useState<ProjectFundingFormErrorsInterface>({
    affiliationId: '',
    otherAffiliationName: '',
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [otherField, setOtherField] = useState(false);

  // Localization keys
  const EditFunding = useTranslations('ProjectsProjectFundingEdit');
  const Global = useTranslations('Global');

  // Place statuses into SelectItem interface for FormSelect component
  const fundingStatuses = Object.values(ProjectFundingStatus).map(status => ({
    id: status,
    name: status.toLowerCase()
  }));

  // Get Project Funding data
  const { data, loading, error: queryError, refetch } = useProjectFundingQuery(
    {
      variables: { projectFundingId: Number(projectFundingId) },
      /*Needed to add this fetchPolicy so that users get fresh data when coming back to this page after editing because it was
      previously showing stale data. I believe that it's ok to use this here because:
      - Edit pages typically are low traffic
      - Data accuracy is critical on form pages and we don't want users overwriting their changes*/
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    }
  );

  // Initialize useUpdateProjectMutation
  const [updateProjectFundingMutation] = useUpdateProjectFundingMutation();


  const updateAffiliationFormData = async (id: string, value: string) => {
    clearActiveFieldError('affiliationId')
    // Clear previous error messages
    clearAllFieldErrors();
    setErrorMessages([]);
    return setProjectFunding({ ...projectFunding, affiliationName: value, affiliationId: id });
  }

  const updateProjectFundingContent = (
    key: string,
    value: string
  ) => {
    // Clear previous error messages
    clearAllFieldErrors();
    setErrorMessages([]);
    setProjectFunding((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
  };

  // Clear any errors for the current active field
  const clearActiveFieldError = (name: string) => {
    // Clear error for active field
    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  }

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      affiliationId: '',
      otherAffiliationName: '',
      funderGrantId: '',
      funderOpportunityNumber: '',
      funderProjectNumber: ''
    });
  }

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = EditFunding('messages.success.projectFundingUpdated');
    toastState.add(successMessage, { type: 'success' });
    // Scroll to top of page
    scrollToTop(topRef);
  }

  // Make GraphQL mutation request to update projectFunding table
  const updateProjectFunding = async (): Promise<[ProjectFundingErrors, boolean]> => {
    try {
      const response = await updateProjectFundingMutation({
        variables: {
          input: {
            projectFundingId: Number(projectFundingId),
            status: projectFunding.fundingStatus,
            funderProjectNumber: projectFunding.funderProjectNumber,
            grantId: projectFunding.funderGrantId,
            funderOpportunityNumber: projectFunding.funderOpportunityNumber
          }
        }
      });

      const responseErrors = response.data?.updateProjectFunding?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'ProjectFundingErrors').length > 0) {
          return [responseErrors, false];
        }
      }

      return [{}, true];
    } catch (error) {
      logECS('error', 'updateProjectFundingMutation', {
        error,
        url: { path: '/projects/[projectId]/fundings/[projectFundingId]/edit' }
      });
      if (error instanceof ApolloError) {
        if (error.message.toLowerCase() === "unauthorized") {
          // Need to refresh values if the refresh token was refreshed in the graphql error handler
          refetch();
        }
        return [{}, false];
      } else {
        setErrorMessages(prevErrors => [...prevErrors, EditFunding('messages.errors.projectFundingUpdateFailed')]);
        return [{}, false];
      }
    }
  };


  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous error messages
    clearAllFieldErrors();
    setErrorMessages([]);

    // First check that if the user has opted to enter "Other", then that value cannot be blank
    if (otherField && !projectFunding.otherAffiliationName.trim()) {
      setFieldErrors(prev => ({
        ...prev,
        otherAffiliationName: EditFunding('messages.errors.requiredOtherAffiliation')
      }));
      setErrorMessages([EditFunding('messages.errors.projectFundingUpdateFailed')]);
      return;
    }

    // Create new section
    const [errors, success] = await updateProjectFunding();

    if (!success) {
      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors) {
        setFieldErrors({
          affiliationId: errors.affiliationId ?? '',
          otherAffiliationName: '',
          funderGrantId: errors.grantId ?? '',
          funderOpportunityNumber: errors.funderOpportunityNumber ?? '',
          funderProjectNumber: errors.funderProjectNumber ?? ''
        });
      }
      setErrorMessages([errors.general || EditFunding('messages.errors.projectFundingUpdateFailed')]);
    } else {
      // Show success message
      showSuccessToast();
      // Redirect back to the project funding page
      router.push(`/projects/${projectId}/fundings`);
    }
  };

  useEffect(() => {
    // set initial project data in state
    if (data && data.projectFunding) {
      setProjectFunding({
        affiliationName: data.projectFunding?.affiliation?.displayName ?? '',
        affiliationId: data.projectFunding?.affiliation?.uri ?? '',
        otherAffiliationName: '',
        fundingStatus: data.projectFunding.status ?? ProjectFundingStatus.Planned,
        funderGrantId: data.projectFunding?.grantId ?? '',
        funderOpportunityNumber: data.projectFunding?.funderOpportunityNumber ?? '',
        funderProjectNumber: data.projectFunding?.funderProjectNumber ?? ''
      });
    }
  }, [data]);

  useEffect(() => {
    if (queryError) {
      setErrorMessages(prev => [...prev, queryError.message]);
    }
  }, [queryError])

  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <div ref={topRef} />
      <PageHeader
        title={EditFunding('title')}
        description={EditFunding('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.fundings.index', { projectId })}>{Global('breadcrumbs.projectFunding')}</Link></Breadcrumb>
            <Breadcrumb>{EditFunding('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-funding-edit"
      />
      <LayoutContainer>
        <ContentContainer>
          <ErrorMessages errors={errorMessages} ref={errorRef} />
          <Form onSubmit={handleFormSubmit}>
            <TypeAheadWithOther
              label={EditFunding('labels.funderName')}
              fieldName="funderName"
              setOtherField={setOtherField}
              required={true}
              error={fieldErrors.affiliationId}
              updateFormData={updateAffiliationFormData}
              value={projectFunding.affiliationName}
              suggestions={suggestions}
              onSearch={handleSearch}
            />
            {otherField && (
              <div className={`${styles.formRow} ${styles.oneItemRow}`}>
                <FormInput
                  name="otherAffiliationName"
                  type="text"
                  label="Other Institution"
                  placeholder={projectFunding.otherAffiliationName}
                  value={projectFunding.otherAffiliationName}
                  onChange={(e) => updateProjectFundingContent('otherAffiliationName', e.target.value)}
                  isInvalid={!!fieldErrors['otherAffiliationName']}
                  errorMessage={fieldErrors['otherAffiliationName'] ?? ''}
                />
              </div>
            )}

            <FormSelect
              label={EditFunding('labels.fundingStatus')}
              isRequired
              name="fundingStatus"
              items={fundingStatuses}
              selectClasses={styles.fundingStatusSelect}
              onChange={selected => updateProjectFundingContent('fundingStatus', selected as ProjectFundingStatus)}
              selectedKey={projectFunding.fundingStatus}
            >

              {fundingStatuses && fundingStatuses.map((status) => {
                return (
                  <ListBoxItem key={status.id}>{status.name}</ListBoxItem>
                )

              })}
            </FormSelect>

            <FormInput
              name="grantNumber"
              type="text"
              isRequired={false}
              label={EditFunding('labels.grantNumber')}
              value={projectFunding.funderGrantId}
              onChange={(e) => updateProjectFundingContent('funderGrantId', e.target.value)}
              isInvalid={(!!fieldErrors.funderGrantId)}
              errorMessage={fieldErrors.funderGrantId.length > 0 ? fieldErrors.funderGrantId : EditFunding('messages.errors.fundingGrantId')}
            />

            <FormInput
              name="projectNumber"
              type="text"
              isRequired={false}
              label={EditFunding('labels.projectNumber')}
              value={projectFunding.funderProjectNumber}
              onChange={(e) => updateProjectFundingContent('funderProjectNumber', e.target.value)}
              isInvalid={(!!fieldErrors.funderProjectNumber)}
              errorMessage={fieldErrors.funderProjectNumber.length > 0 ? fieldErrors.funderProjectNumber : EditFunding('messages.errors.fundingProjectNumber')}
            />

            <FormInput
              name="opportunityNumber"
              type="text"
              isRequired={false}
              label={EditFunding('labels.opportunity')}
              value={projectFunding.funderOpportunityNumber}
              onChange={(e) => updateProjectFundingContent('funderOpportunityNumber', e.target.value)}
            />

            <Button type="submit" className="submit-button">{Global('buttons.saveChanges')}</Button>
          </Form>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectFundingEdit;
