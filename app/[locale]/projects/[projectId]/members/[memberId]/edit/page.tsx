'use client';

import { useEffect, useRef, useReducer, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Link,
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel } from "@/components/Container";
import { FormInput, CheckboxGroupComponent } from "@/components/Form";
import ErrorMessages from '@/components/ErrorMessages';

// GraphQL
import {
  ContributorRole,
  ProjectContributorErrors,
  useContributorRolesQuery,
  useUpdateProjectContributorMutation,
  useRemoveProjectContributorMutation
} from '@/generated/graphql';


// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
import { useProjectContributorData } from "@/hooks/projectContributorData";

//Other
import logECS from '@/utils/clientLogger';
import { ProjectContributorFormInterface } from '@/app/types';
import styles from './ProjectsProjectMembersEdit.module.scss';
import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/routes';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = {
  roles: [] as ContributorRole[],
};

type State = typeof initialState;

type Action = { type: 'SET_ROLES'; payload: ContributorRole[] };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ROLES':
      const sortedRoles = action.payload.sort((a, b) => a.displayOrder - b.displayOrder);
      return { ...state, roles: sortedRoles };
    default:
      return state;
  }
};

const ProjectsProjectMembersEdit: React.FC = () => {

  const [state, dispatch] = useReducer(reducer, initialState);

  // Get projectId and memberId params
  const params = useParams();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const memberId = Array.isArray(params.memberId) ? params.memberId[0] : params.memberId;

  //Routes
  const EDIT_MEMBER_ROUTE = routePath('projects.members.edit', { projectId, memberId });
  const PROJECT_MEMBERS_ROUTE = routePath('projects.members.index', { projectId });

  // Hooks for toast, router and scroll to top
  const toastState = useToast();
  const router = useRouter();
  const { scrollToTop } = useScrollToTop();

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<ProjectContributorFormInterface>({
    givenName: '',
    surName: '',
    affiliationId: '',
    email: '',
    orcid: '',
  });

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  // localization keys
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectMembersEdit');

  // Get Contributor Roles
  const { data: contributorRoles, loading: contributorRolesLoading, error: contributorRolesError } = useContributorRolesQuery();

  // Hooks for project contributor data
  const {
    projectContributorData,
    checkboxRoles,
    setCheckboxRoles,
    loading,
    setProjectContributorData,
    queryError
  } = useProjectContributorData(Number(memberId));


  const isLoading = loading || contributorRolesLoading;
  const isError = queryError || contributorRolesError;


  // Initialize project contributor mutations
  const [updateProjectContributorMutation] = useUpdateProjectContributorMutation();
  const [removeProjectContributorMutation] = useRemoveProjectContributorMutation();

  // Show Success Message for updating member
  const showSuccessToast = () => {
    const successMessage = t('form.success.memberUpdated');
    toastState.add(successMessage, { type: 'success' });
  }

  // Show Success Message for removing member
  const showRemoveSuccessToast = () => {
    const successMessage = t('form.success.removedMember');
    toastState.add(successMessage, { type: 'success' });
  }

  // Handle changes to role checkbox selection
  const handleCheckboxChange = (values: string[]) => {
    setCheckboxRoles(values); // Set the selected role IDs
  }

  const clearAllFieldErrors = () => {
    setFieldErrors({
      givenName: '',
      surName: '',
      affiliationId: '',
      email: '',
      orcid: '',
    });
  }

  // Remove project contributor
  const removeProjectContributor = async (): Promise<[ProjectContributorErrors, boolean]> => {
    try {
      const response = await removeProjectContributorMutation({
        variables: {
          projectContributorId: Number(memberId)
        }
      });

      const responseErrors = response.data?.removeProjectContributor?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'ProjectContributorErrors').length > 0) {
          return [responseErrors, false];
        }
      }
      return [{}, true];
    } catch (error) {
      logECS('error', 'removeProjectContributor', {
        error,
        url: { path: EDIT_MEMBER_ROUTE }
      });
      if (error instanceof ApolloError) {
        return [{}, false];
      } else {
        setErrorMessages(prevErrors => [...prevErrors, t('form.errors.removingMember')]);
        return [{}, false];
      }
    }
  }

  // Handle remove member from project
  const handleRemoveMember = async () => {

    const [errors, success] = await removeProjectContributor();

    if (!success) {
      if (errors) {
        setFieldErrors({
          givenName: errors.givenName || '',
          surName: errors.surName || '',
          affiliationId: errors.affiliationId || '',
          email: errors.email || '',
          orcid: errors.orcid || '',
        });
      }
      setErrorMessages([errors.general || t('form.errors.updatingMember')]);

    } else {
      // Show success message
      showRemoveSuccessToast();
      router.push(PROJECT_MEMBERS_ROUTE);
    }

    // Scroll to top of page
    scrollToTop(topRef);
  }

  // update the project contributor
  const updateProjectContributor = async (): Promise<[ProjectContributorErrors, boolean]> => {
    try {
      const response = await updateProjectContributorMutation({
        variables: {
          input: {
            projectContributorId: Number(memberId),
            givenName: projectContributorData.givenName,
            surName: projectContributorData.surName,
            affiliationId: projectContributorData.affiliationId,
            email: projectContributorData.email,
            orcid: projectContributorData.orcid,
            contributorRoleIds: checkboxRoles.filter((id) => id !== undefined).map(Number)
          }
        }
      });

      const responseErrors = response.data?.updateProjectContributor?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'ProjectContributorErrors').length > 0) {
          return [responseErrors, false];
        }
      }

      return [{}, true];
    } catch (error) {
      logECS('error', 'updateProjectContributor', {
        error,
        url: { path: EDIT_MEMBER_ROUTE }
      });
      if (error instanceof ApolloError) {
        return [{}, false];
      } else {
        setErrorMessages(prevErrors => [...prevErrors, t('form.errors.updatingMember')]);
        return [{}, false];
      }
    }
  };

  // Client-side validation of fields
  const validateField = (name: string, value: string | string[] | undefined) => {
    let error = '';
    switch (name) {
      case 'givenName':
        if (!value || value.length <= 2) {
          error = t('form.errors.firstName');
        }
        break;
      case 'surName':
        if (!value || value.length <= 2) {
          error = t('form.errors.lastName');
        }
        break;
      case 'email':
        if (!value || !emailRegex.test(value as string)) {
          error = t('form.errors.email');
        }
        break;
    }

    setFieldErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
    if (error.length > 1) {
      setErrorMessages(prev => [...prev, error]);
    }

    return error;
  }

  // Check whether form is valid before submitting
  const isFormValid = (): boolean => {
    // Initialize a flag for form validity
    let isValid = true;
    // Field errors
    const errors: ProjectContributorFormInterface = {
      givenName: '',
      surName: '',
      affiliationId: '',
      email: '',
      orcid: '',
    };

    // Iterate over formData to validate each field
    Object.keys(projectContributorData).forEach((key) => {
      const name = key as keyof ProjectContributorFormInterface;
      const value = projectContributorData[name];

      // Call validateField to update errors for each field
      const error = validateField(name, value);
      if (error) {
        isValid = false;
        errors[name] = error;
      }
    });
    return isValid;
  };

  // Handle form submit
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous error messages
    clearAllFieldErrors();
    setErrorMessages([]);

    if (isFormValid()) {
      // Create new section
      const [errors, success] = await updateProjectContributor();

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (!success) {
        if (errors) {
          setFieldErrors({
            givenName: errors.givenName || '',
            surName: errors.surName || '',
            affiliationId: errors.affiliationId || '',
            email: errors.email || '',
            orcid: errors.orcid || '',
          });
        }
        setErrorMessages([errors.general || t('form.errors.updatingMember')]);

      } else {
        // Show success message
        showSuccessToast();
        router.push(PROJECT_MEMBERS_ROUTE);
      }

      // Scroll to top of page
      scrollToTop(topRef);
    }
  };

  useEffect(() => {
    // Set the roles from the query
    if (contributorRoles?.contributorRoles) {
      const filteredRoles = contributorRoles.contributorRoles.filter((role): role is ContributorRole => role !== null);
      dispatch({ type: 'SET_ROLES', payload: filteredRoles });
    }
  }, [contributorRoles]);

  useEffect(() => {
    console.log(fieldErrors);
  }, [fieldErrors]);

  if (isLoading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  if (isError) {
    return <div>{Global('messaging.error')}</div>;
  }


  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.project')}</Link></Breadcrumb>
            <Breadcrumb><Link href={PROJECT_MEMBERS_ROUTE}>{t('breadcrumbs.projectMembers')}</Link></Breadcrumb>
            <Breadcrumb>{t('title')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-member-edit"
      />

      <ErrorMessages errors={errorMessages} ref={errorRef} />

      <LayoutWithPanel>
        <ContentContainer>
          <div ref={topRef}>
            <h2>Test{fieldErrors.givenName}</h2>

            <Form onSubmit={handleFormSubmit} className={styles.editForm}>
              <div className={styles.formSection}>
                <FormInput
                  name="givenName"
                  type="text"
                  label={t('form.labels.firstName')}
                  value={projectContributorData.givenName}
                  onChange={(e) => {
                    setProjectContributorData({ ...projectContributorData, givenName: e.target.value });
                    // Clear the error for this field when user changes it
                    setFieldErrors(prev => ({ ...prev, givenName: '' }));
                  }}
                  isInvalid={fieldErrors.givenName.length !== 0}
                  errorMessage={` ${fieldErrors.givenName} Test`}
                />

                <FormInput
                  name="surName"
                  type="text"
                  label={t('form.labels.lastName')}
                  value={projectContributorData.surName}
                  onChange={(e) => {
                    setProjectContributorData({ ...projectContributorData, surName: e.target.value });
                    // Clear the error for this field when user changes it
                    setFieldErrors(prev => ({ ...prev, surName: '' }));
                  }}
                  isInvalid={fieldErrors.surName.length !== 0}
                  errorMessage={fieldErrors.surName}
                />

                <FormInput
                  name="affiliation"
                  type="text"
                  label={t('form.labels.affiliation')}
                  value={projectContributorData.affiliationId}
                  onChange={(e) => {
                    setProjectContributorData({ ...projectContributorData, affiliationId: e.target.value });
                    // Clear the error for this field when user changes it
                    setFieldErrors(prev => ({ ...prev, affiliationId: '' }));
                  }}
                  isInvalid={fieldErrors.affiliationId.length !== 0}
                  errorMessage={fieldErrors.affiliationId || t('form.errors.affiliation')}
                />

                <FormInput
                  name="email"
                  type="email"
                  label={t('form.labels.emailAddress')}
                  value={projectContributorData.email}
                  onChange={(e) => {
                    setProjectContributorData({ ...projectContributorData, email: e.target.value });
                    // Clear the error for this field when user changes it
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }}
                  isInvalid={fieldErrors.email.length > 0 || Boolean(projectContributorData.email && !emailRegex.test(projectContributorData.email))}
                  errorMessage={fieldErrors.email || t('form.errors.email')}
                />

                <FormInput
                  name="orcid"
                  type="text"
                  label={t('form.labels.orcid')}
                  value={projectContributorData.orcid}
                  onChange={(e) => {
                    setProjectContributorData({ ...projectContributorData, orcid: e.target.value });
                    // Clear the error for this field when user changes it
                    setFieldErrors(prev => ({ ...prev, orcid: '' }));
                  }}
                  isInvalid={fieldErrors.orcid.length !== 0}
                  errorMessage={fieldErrors.orcid || t('form.errors.orcid')}
                />

                <CheckboxGroupComponent
                  name="projectRoles"
                  value={checkboxRoles}
                  onChange={(newValues) => handleCheckboxChange(newValues)}
                  checkboxGroupLabel={t('form.labels.checkboxGroupLabel')}
                  checkboxGroupDescription={t('form.labels.checkboxGroupDescription')}
                  checkboxData={state.roles && state.roles.map(role => ({
                    label: role.label,
                    value: role?.id?.toString() ?? ''
                  }))}
                />

                <Button type="submit">{Global('buttons.saveChanges')}</Button>
              </div>
            </Form>
          </div>

          <section className={styles.dangerZone} aria-labelledby="remove-section">
            <h2 id="remove-section">{t('headings.h2RemoveMember')}</h2>
            <p>
              {t('paragraphs.removeMember')}
            </p>
            <Button
              onPress={handleRemoveMember}
              className="secondary"
              aria-label={t('form.labels.removeMemberFromProject')}
            >
              {t('buttons.removeMember')}
            </Button>
          </section>
        </ContentContainer>
      </LayoutWithPanel >
    </>
  );
};

export default ProjectsProjectMembersEdit;
