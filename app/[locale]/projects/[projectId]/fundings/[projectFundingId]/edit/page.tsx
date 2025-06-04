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

import { scrollToTop } from '@/utils/general';
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';

import styles from './projectFunding.module.scss';

interface ProjectFundingFormErrorsInterface {
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

const ProjectsProjectFundingEdit = () => {
  const toastState = useToast(); // Access the toast state from context
  const router = useRouter(); // Access the router object

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);
  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Get projectId and projectFundingID
  const params = useParams();
  const { projectId, projectFundingId } = params; // From route /projects/:projectId/fundings/:projectFundingId/edit

  const [projectFunding, setProjectFunding] = useState<ProjectFundingInterface>({
    funderName: '',
    fundingStatus: ProjectFundingStatus.Planned,
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const [fieldErrors, setFieldErrors] = useState<ProjectFundingFormErrorsInterface>({
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
      notifyOnNetworkStatusChange: true
    }
  );

  // Initialize useUpdateProjectMutation
  const [updateProjectFundingMutation] = useUpdateProjectFundingMutation();

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
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

  const updateProjectFundingContent = (
    key: string,
    value: string
  ) => {
    setProjectFunding((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
  };

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

    // Create new section
    const [errors, success] = await updateProjectFunding();

    if (!success) {
      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors) {
        setFieldErrors({
          funderGrantId: errors.grantId || '',
          funderOpportunityNumber: errors.funderOpportunityNumber || '',
          funderProjectNumber: errors.funderProjectNumber || ''
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
    // set project data in state
    if (data && data.projectFunding) {
      setProjectFunding({
        funderName: data.projectFunding?.affiliation?.name || '',
        fundingStatus: data.projectFunding.status || ProjectFundingStatus.Planned,
        funderGrantId: data.projectFunding?.grantId || '',
        funderOpportunityNumber: data.projectFunding?.funderOpportunityNumber || '',
        funderProjectNumber: data.projectFunding?.funderProjectNumber || ''
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
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}/fundings`}>{Global('breadcrumbs.projectFunding')}</Link></Breadcrumb>
            <Breadcrumb>{EditFunding('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-funding-edit"
      />
      <LayoutContainer>
        <ContentContainer>
          <ErrorMessages errors={errorMessages} ref={errorRef} />
          <Form onSubmit={handleFormSubmit}>
            <FormInput
              name="funderName"
              type="text"
              isRequired={true}
              label={EditFunding('labels.funderName')}
              value={projectFunding.funderName}
              onChange={(e) => updateProjectFundingContent('funderName', e.target.value)}
            />

            <FormSelect
              label={EditFunding('labels.fundingStatus')}
              isRequired
              name="fundingStatus"
              items={fundingStatuses}
              selectClasses={styles.fundingStatusSelect}
              onSelectionChange={selected => updateProjectFundingContent('fundingStatus', selected as ProjectFundingStatus)}
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
              isRequired={true}
              label={EditFunding('labels.grantNumber')}
              value={projectFunding.funderGrantId}
              onChange={(e) => updateProjectFundingContent('funderGrantId', e.target.value)}
              isInvalid={(!projectFunding.funderGrantId || !!fieldErrors.funderGrantId)}
              errorMessage={fieldErrors.funderGrantId.length > 0 ? fieldErrors.funderGrantId : EditFunding('messages.errors.fundingGrantId')}
            />

            <FormInput
              name="projectNumber"
              type="text"
              isRequired={true}
              label={EditFunding('labels.projectNumber')}
              value={projectFunding.funderProjectNumber}
              onChange={(e) => updateProjectFundingContent('funderProjectNumber', e.target.value)}
              isInvalid={(!projectFunding.funderProjectNumber || !!fieldErrors.funderProjectNumber)}
              errorMessage={fieldErrors.funderProjectNumber.length > 0 ? fieldErrors.funderProjectNumber : EditFunding('messages.errors.fundingProjectNumber')}
            />

            <FormInput
              name="opportunityNumber"
              type="text"
              isRequired={true}
              label={EditFunding('labels.opportunity')}
              value={projectFunding.funderOpportunityNumber}
              onChange={(e) => updateProjectFundingContent('funderOpportunityNumber', e.target.value)}
              isInvalid={(!projectFunding.funderOpportunityNumber || !!fieldErrors.funderOpportunityNumber)}
              errorMessage={fieldErrors.funderOpportunityNumber.length > 0 ? fieldErrors.funderOpportunityNumber : EditFunding('messages.errors.fundingProjectNumber')}
            />

            <Button type="submit" className="submit-button">{Global('buttons.saveChanges')}</Button>
          </Form>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectFundingEdit;
