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
  MemberRole,
  ProjectMemberErrors,
  useMemberRolesQuery,
  useUpdateProjectMemberMutation,
  useRemoveProjectMemberMutation
} from '@/generated/graphql';


// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
import { useProjectMemberData } from "@/hooks/projectMemberData";

//Other
import logECS from '@/utils/clientLogger';
import { ProjectMemberFormInterface, ProjectMemberErrorInterface } from '@/app/types';
import styles from './ProjectsProjectMembersEdit.module.scss';
import { useToast } from '@/context/ToastContext';
import { routePath } from '@/utils/routes';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = {
  roles: [] as MemberRole[],
};

type State = typeof initialState;

type Action = { type: 'SET_ROLES'; payload: MemberRole[] };

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
  const projectId = String(params.projectId);
  const memberId = String(params.memberId);

  //Routes
  const EDIT_MEMBER_ROUTE = routePath('projects.members.edit', { projectId, memberId });
  const PROJECT_MEMBERS_ROUTE = routePath('projects.members.index', { projectId });

  // Hooks for toast, router and scroll to top
  const toastState = useToast();
  const router = useRouter();
  const { scrollToTop } = useScrollToTop();

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<ProjectMemberErrorInterface>({
    givenName: '',
    surName: '',
    affiliationId: '',
    email: '',
    orcid: '',
    projectRoles: ''
  });

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  // localization keys
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectMembersEdit');

  // Get Member Roles
  const { data: memberRoles, loading: memberRolesLoading, error: memberRolesError } = useMemberRolesQuery();

  // Hooks for project member data
  const {
    projectMemberData,
    checkboxRoles,
    setCheckboxRoles,
    loading,
    setProjectMemberData,
    queryError
  } = useProjectMemberData(Number(memberId));


  const isLoading = loading || memberRolesLoading;
  const isError = queryError || memberRolesError;


  // Initialize project member mutations
  const [updateProjectMemberMutation] = useUpdateProjectMemberMutation();
  const [removeProjectMemberMutation] = useRemoveProjectMemberMutation();

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
      projectRoles: ''
    });
  }

  // Remove project member
  const removeProjectMember = async (): Promise<[ProjectMemberErrors, boolean]> => {
    try {
      const response = await removeProjectMemberMutation({
        variables: {
          projectMemberId: Number(memberId)
        }
      });

      const responseErrors = response.data?.removeProjectMember?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'ProjectMemberErrors').length > 0) {
          return [responseErrors, false];
        }
      }
      return [{}, true];
    } catch (error) {
      logECS('error', 'removeProjectMember', {
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

    const [errors, success] = await removeProjectMember();

    if (!success) {
      if (errors) {
        setFieldErrors({
          givenName: errors.givenName || '',
          surName: errors.surName || '',
          affiliationId: errors.affiliationId || '',
          email: errors.email || '',
          orcid: errors.orcid || '',
          projectRoles: errors.memberRoleIds ?? ''
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

  // update the project member
  const updateProjectMember = async (): Promise<[ProjectMemberErrors, boolean]> => {
    try {
      const response = await updateProjectMemberMutation({
        variables: {
          input: {
            projectMemberId: Number(memberId),
            givenName: projectMemberData.givenName,
            surName: projectMemberData.surName,
            affiliationId: projectMemberData.affiliationId,
            email: projectMemberData.email,
            orcid: projectMemberData.orcid,
            memberRoleIds: checkboxRoles.filter((id) => id !== undefined).map(Number)
          }
        }
      });

      const responseErrors = response.data?.updateProjectMember?.errors
      if (responseErrors) {
        if (responseErrors && Object.values(responseErrors).filter((err) => err && err !== 'ProjectMemberErrors').length > 0) {
          return [responseErrors, false];
        }
      }

      return [{}, true];
    } catch (error) {
      logECS('error', 'updateProjectMember', {
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
    const errors: ProjectMemberErrorInterface = {
      givenName: '',
      surName: '',
      affiliationId: '',
      email: '',
      orcid: '',
      projectRoles: ''
    };

    // Iterate over formData to validate each field
    Object.keys(projectMemberData).forEach((key) => {
      const name = key as keyof ProjectMemberFormInterface;
      const value = projectMemberData[name];

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
      const [errors, success] = await updateProjectMember();

      // Check if there are any errors (always exclude the GraphQL `_typename` entry)
      if (!success) {
        if (errors) {
          setFieldErrors({
            givenName: errors.givenName || '',
            surName: errors.surName || '',
            affiliationId: errors.affiliationId || '',
            email: errors.email || '',
            orcid: errors.orcid || '',
            projectRoles: errors.memberRoleIds ?? ''
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
    if (memberRoles?.memberRoles) {
      const filteredRoles = memberRoles.memberRoles.filter((role): role is MemberRole => role !== null);
      dispatch({ type: 'SET_ROLES', payload: filteredRoles });
    }
  }, [memberRoles]);

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
                  value={projectMemberData.givenName}
                  onChange={(e) => {
                    setProjectMemberData({ ...projectMemberData, givenName: e.target.value });
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
                  value={projectMemberData.surName}
                  onChange={(e) => {
                    setProjectMemberData({ ...projectMemberData, surName: e.target.value });
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
                  value={projectMemberData.affiliationId}
                  onChange={(e) => {
                    setProjectMemberData({ ...projectMemberData, affiliationId: e.target.value });
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
                  value={projectMemberData.email}
                  onChange={(e) => {
                    setProjectMemberData({ ...projectMemberData, email: e.target.value });
                    // Clear the error for this field when user changes it
                    setFieldErrors(prev => ({ ...prev, email: '' }));
                  }}
                  isInvalid={fieldErrors.email.length > 0 || Boolean(projectMemberData.email && !emailRegex.test(projectMemberData.email))}
                  errorMessage={fieldErrors.email || t('form.errors.email')}
                />

                <FormInput
                  name="orcid"
                  type="text"
                  label={t('form.labels.orcid')}
                  value={projectMemberData.orcid}
                  onChange={(e) => {
                    setProjectMemberData({ ...projectMemberData, orcid: e.target.value });
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
                  isRequired={true}
                  checkboxGroupLabel={t('form.labels.checkboxGroupLabel')}
                  checkboxGroupDescription={t('form.labels.checkboxGroupDescription')}
                  checkboxData={state.roles && state.roles.map(role => ({
                    label: role.label,
                    value: role?.id?.toString() ?? ''
                  }))}
                  isInvalid={checkboxRoles.length === 0}
                  errorMessage={fieldErrors.projectRoles || t('form.errors.projectRoles')}
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
