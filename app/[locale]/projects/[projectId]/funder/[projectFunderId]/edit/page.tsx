'use client';

import React, {useEffect, useRef, useState} from 'react';
import {ApolloError} from '@apollo/client';
import {useTranslations} from 'next-intl';
import {useParams, useRouter} from 'next/navigation';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
  ListBoxItem,
} from "react-aria-components";

import {
  ProjectFunderErrors,
  ProjectFunderStatus,
  useProjectFunderQuery,
  useUpdateProjectFunderMutation
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import {ContentContainer, LayoutContainer} from "@/components/Container";
import {FormInput, FormSelect} from "@/components/Form";
import ErrorMessages from '@/components/ErrorMessages';

import {scrollToTop} from '@/utils/general';
import logECS from '@/utils/clientLogger';
import {useToast} from '@/context/ToastContext';

import styles from './projectFunder.module.scss';

interface ProjectFunderFormErrorsInterface {
  funderGrantId: string;
  funderOpportunityNumber: string;
  funderProjectNumber: string;
}

interface ProjectFunderInterface {
  funderName: string;
  funderStatus: ProjectFunderStatus;
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

  // Get projectId and projectFunderID
  const params = useParams();
  const { projectId, projectFunderId } = params; // From route /projects/:projectId/funder/:projectFunderId/edit

  const [projectFunder, setProjectFunder] = useState<ProjectFunderInterface>({
    funderName: '',
    funderStatus: ProjectFunderStatus.Planned,
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const [fieldErrors, setFieldErrors] = useState<ProjectFunderFormErrorsInterface>({
    funderGrantId: '',
    funderOpportunityNumber: '',
    funderProjectNumber: ''
  });

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Localization keys
  const EditFunding = useTranslations('ProjectsProjectFundingEdit');
  const Global = useTranslations('Global');

  // Place statuses into SelectItem interface for FormSelect component
  const funderStatuses = Object.values(ProjectFunderStatus).map(status => ({
    id: status,
    name: status.toLowerCase()
  }));

  // Get Project Funder data
  const { data, loading, error: queryError, refetch } = useProjectFunderQuery(
    {
      variables: { projectFunderId: Number(projectFunderId) },
      notifyOnNetworkStatusChange: true
    }
  );

  // Initialize useUpdateProjectMutation
  const [updateProjectFunderMutation] = useUpdateProjectFunderMutation();

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
    const successMessage = EditFunding('messages.success.projectFunderUpdated');
    toastState.add(successMessage, { type: 'success' });
    // Scroll to top of page
    scrollToTop(topRef);
  }

  const updateProjectFunderContent = (
    key: string,
    value: string
  ) => {
    setProjectFunder((prevContents) => ({
      ...prevContents,
      [key]: value,
    }));
  };

  // Make GraphQL mutation request to update projectFunder table
  const updateProjectFunder = async (): Promise<[ProjectFunderErrors, boolean]> => {
    try {
      const response = await updateProjectFunderMutation({
        variables: {
          input: {
            projectFunderId: Number(projectFunderId),
            status: projectFunder.funderStatus,
            funderProjectNumber: projectFunder.funderProjectNumber,
            grantId: projectFunder.funderGrantId,
            funderOpportunityNumber: projectFunder.funderOpportunityNumber
          }
        }
      });

      const responseErrors = response.data?.updateProjectFunder?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'ProjectFunderErrors').length > 0) {
          return [responseErrors, false];
        }
      }

      return [{}, true];
    } catch (error) {
      logECS('error', 'updateProjectFunderMutation', {
        error,
        url: { path: '/projects/[projectId]/funder/[projectFunderId]/edit' }
      });
      if (error instanceof ApolloError) {
        if (error.message.toLowerCase() === "unauthorized") {
          // Need to refresh values if the refresh token was refreshed in the graphql error handler
          refetch();
        }
        return [{}, false];
      } else {
        setErrorMessages(prevErrors => [...prevErrors, EditFunding('messages.errors.projectFunderUpdateFailed')]);
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
    const [errors, success] = await updateProjectFunder();

    if (!success) {
      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (errors) {
        setFieldErrors({
          funderGrantId: errors.grantId || '',
          funderOpportunityNumber: errors.funderOpportunityNumber || '',
          funderProjectNumber: errors.funderProjectNumber || ''
        });
      }
      setErrorMessages([errors.general || EditFunding('messages.errors.projectFunderUpdateFailed')]);

    } else {
      // Show success message
      showSuccessToast();
      // Redirect back to the project funder page
      router.push(`/projects/${projectId}/funder`);
    }
  };

  useEffect(() => {
    // set project data in state
    if (data && data.projectFunder) {
      setProjectFunder({
        funderName: data.projectFunder?.affiliation?.name || '',
        funderStatus: data.projectFunder.status || ProjectFunderStatus.Planned,
        funderGrantId: data.projectFunder?.grantId || '',
        funderOpportunityNumber: data.projectFunder?.funderOpportunityNumber || '',
        funderProjectNumber: data.projectFunder?.funderProjectNumber || ''
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
            <Breadcrumb><Link href={`/projects/${projectId}/funder`}>{Global('breadcrumbs.projectFunder')}</Link></Breadcrumb>
            <Breadcrumb>{EditFunding('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-funder-edit"
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
              value={projectFunder.funderName}
              onChange={(e) => updateProjectFunderContent('projectName', e.target.value)}
            />

            <FormSelect
              label={EditFunding('labels.funderStatus')}
              isRequired
              name="funderStatus"
              items={funderStatuses}
              selectClasses={styles.funderStatusSelect}
              onSelectionChange={selected => updateProjectFunderContent('funderStatus', selected as ProjectFunderStatus)}
              selectedKey={projectFunder.funderStatus}
            >

              {funderStatuses && funderStatuses.map((status) => {
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
              value={projectFunder.funderGrantId}
              onChange={(e) => updateProjectFunderContent('funderGrantId', e.target.value)}
              isInvalid={(!projectFunder.funderGrantId || !!fieldErrors.funderGrantId)}
              errorMessage={fieldErrors.funderGrantId.length > 0 ? fieldErrors.funderGrantId : EditFunding('messages.errors.funderGrantId')}
            />

            <FormInput
              name="projectNumber"
              type="text"
              isRequired={true}
              label={EditFunding('labels.projectNumber')}
              value={projectFunder.funderProjectNumber}
              onChange={(e) => updateProjectFunderContent('funderProjectNumber', e.target.value)}
              isInvalid={(!projectFunder.funderProjectNumber || !!fieldErrors.funderProjectNumber)}
              errorMessage={fieldErrors.funderProjectNumber.length > 0 ? fieldErrors.funderProjectNumber : EditFunding('messages.errors.funderProjectNumber')}
            />

            <FormInput
              name="opportunityNumber"
              type="text"
              isRequired={true}
              label={EditFunding('labels.opportunity')}
              value={projectFunder.funderOpportunityNumber}
              onChange={(e) => updateProjectFunderContent('funderOpportunityNumber', e.target.value)}
              isInvalid={(!projectFunder.funderOpportunityNumber || !!fieldErrors.funderOpportunityNumber)}
              errorMessage={fieldErrors.funderOpportunityNumber.length > 0 ? fieldErrors.funderOpportunityNumber : EditFunding('messages.errors.funderProjectNumber')}
            />

            <Button type="submit" className="submit-button">{Global('buttons.saveChanges')}</Button>
          </Form>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default ProjectsProjectFundingEdit;
