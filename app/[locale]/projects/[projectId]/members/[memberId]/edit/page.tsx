'use client';

import { useEffect, useRef, useReducer, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  TextField
} from "react-aria-components";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel } from "@/components/Container";
import ErrorMessages from '@/components/ErrorMessages';

// GraphQL
import {
  ContributorRole,
  ProjectContributorErrors,
  useContributorRolesQuery,
  useUpdateProjectContributorMutation
} from '@/generated/graphql';


// Hooks
import { useScrollToTop } from '@/hooks/scrollToTop';
import { useProjectContributorData } from "@/hooks/projectContributorData";

//Other
import logECS from '@/utils/clientLogger';
import { ProjectContributorFormInterface } from '@/app/types';
import styles from './ProjectsProjectMembersEdit.module.scss';
import { useToast } from '@/context/ToastContext';


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
  // Get projectId and memberId params
  const params = useParams();
  const { projectId, memberId } = params; // From route /projects/:projectId/members/:memberId/edit
  const toastState = useToast(); // Access the toast state from context
  const { scrollToTop } = useScrollToTop();

  const [state, dispatch] = useReducer(reducer, initialState);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  //For scrolling to top of page
  const topRef = useRef<HTMLDivElement | null>(null);

  // localization keys
  const Global = useTranslations('Global');

  // Get Contributor Roles
  const { data: contributorRoles, loading: contributorRolesLoading, error: contributorRolesError } = useContributorRolesQuery();


  const {
    projectContributorData,
    selectedRoles,
    checkboxRoles,
    loading,
    setProjectContributorData,
    setSelectedRoles,
  } = useProjectContributorData(Number(memberId));

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<ProjectContributorFormInterface>({
    givenName: '',
    surName: '',
    affiliationId: '',
    email: '',
    orcid: '',
  });

  // Initialize project contributor mutation
  const [updateProjectContributorMutation] = useUpdateProjectContributorMutation();

  const projectRoles = [
    "Primary Investigator (PI)",
    "Project Administrator",
    "Data Curator",
    "Other"
  ];

  // Show Success Message
  const showSuccessToast = () => {
    const successMessage = "Project contributor updated successfully";
    toastState.add(successMessage, { type: 'success' });
  }


  // Handle changes to role checkbox selection
  const handleCheckboxChange = (role: ContributorRole) => {
    setSelectedRoles(prevTags => prevTags.some(selectedRole => selectedRole.id === role.id)
      ? prevTags.filter(selectedRole => selectedRole.id !== role.id)
      : [...prevTags, role]
    );
  };

  const clearAllFieldErrors = () => {
    //Remove all field errors
    setFieldErrors({
      givenName: '',
      surName: '',
      affiliationId: '',
      email: '',
      orcid: '',
    });
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Member details updated');
    window.location.href = '/projects/proj_2425/members';
  }

  const handleRemoveMember = () => {
    console.log('Member removed');
    // Add confirmation dialog and removal logic
  }

  // Make GraphQL mutation request to update the project contributor
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
            contributorRoleIds: selectedRoles.map(role => role.id).filter((id): id is number => id !== undefined)
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
        url: { path: `/projects/${projectId}/members/${memberId}/edit` }
      });
      if (error instanceof ApolloError) {
        return [{}, false];
      } else {
        setErrorMessages(prevErrors => [...prevErrors, 'An error occurred while updating the project contributor.']);
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
    const [errors, success] = await updateProjectContributor();

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
      setErrorMessages([errors.general || "Error updating project contributor"]);

    } else {
      // Show success message
      showSuccessToast();
    }

    // Scroll to top of page
    scrollToTop(topRef);

  };

  useEffect(() => {
    if (contributorRoles?.contributorRoles) {
      const filteredRoles = contributorRoles.contributorRoles.filter((role): role is ContributorRole => role !== null);
      dispatch({ type: 'SET_ROLES', payload: filteredRoles });
      console.log("ROLES", filteredRoles);
    }
  }, [contributorRoles]);


  console.log("CHECKBOX ROLES", checkboxRoles);
  return (
    <>
      <PageHeader
        title="Edit Member Details"
        description="Update collaborator information"
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/projects/${projectId}/members`}>Project Members</Link></Breadcrumb>
            <Breadcrumb>Edit Member Details</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-member-edit"
      />

      <ErrorMessages errors={errorMessages} ref={errorRef} />

      <LayoutWithPanel>
        <ContentContainer>
          <div ref={topRef}>
            <Form onSubmit={handleSubmit} className={styles.editForm}>
              <div className={styles.formSection}>
                <TextField name="first_name" type="text" isRequired>
                  <Label>First Name</Label>
                  <Input
                    onChange={(e) => setProjectContributorData({ ...projectContributorData, givenName: e.target.value })}
                    value={projectContributorData.givenName}
                  />
                  <FieldError />
                </TextField>

                <TextField name="last_name" type="text" isRequired>
                  <Label>Last Name</Label>
                  <Input
                    onChange={(e) => setProjectContributorData({ ...projectContributorData, surName: e.target.value })}
                    value={projectContributorData.surName}
                  />
                  <FieldError />
                </TextField>

                <TextField name="affiliation" type="text" isRequired>
                  <Label>Affiliation</Label>
                  <Input
                    onChange={(e) => setProjectContributorData({ ...projectContributorData, affiliationId: e.target.value })}
                    value={projectContributorData.affiliationId}
                  />
                  <FieldError />
                </TextField>

                <TextField name="email" type="email" isRequired>
                  <Label>Email Address</Label>
                  <Input
                    onChange={(e) => setProjectContributorData({ ...projectContributorData, email: e.target.value })}
                    value={projectContributorData.email}
                  />
                  <FieldError />
                </TextField>

                <TextField name="orcid" type="text">
                  <Label>ORCID ID</Label>
                  <Input
                    onChange={(e) => setProjectContributorData({ ...projectContributorData, orcid: e.target.value })}
                    value={projectContributorData.orcid}
                    placeholder="0000-0000-0000-0000" />
                  <FieldError />
                </TextField>

                <CheckboxGroup
                  name="project_roles"
                  className={styles.rolesGroup}
                  aria-label="Project roles"
                  value={checkboxRoles}
                >
                  <Label>Project Role(s)</Label>
                  {state.roles && state.roles.map((role) => (
                    <Checkbox
                      key={role.id}
                      value={role.label}
                      onChange={() => handleCheckboxChange(role)}
                    >
                      <div className="checkbox">
                        <svg viewBox="0 0 18 18" aria-hidden="true">
                          <polyline points="1 9 7 14 15 4" />
                        </svg>
                      </div>
                      {role.label}
                    </Checkbox>

                  ))}
                  <FieldError />
                </CheckboxGroup>

                <Button type="submit" >Save Changes</Button>
              </div>
            </Form>
          </div>

          <section className={styles.dangerZone} aria-labelledby="remove-section">
            <h2 id="remove-section">Remove Member</h2>
            <p>
              Removing this member means they will no longer be able to access this plan.
              This is not reversible.
            </p>
            <Button
              onPress={handleRemoveMember}
              className="secondary"
              aria-label="Remove member from project"
            >
              Remove Member
            </Button>
          </section>
        </ContentContainer>
      </LayoutWithPanel >
    </>
  );
};

export default ProjectsProjectMembersEdit;
