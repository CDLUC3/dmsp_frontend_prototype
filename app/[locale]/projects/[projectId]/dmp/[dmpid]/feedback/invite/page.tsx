'use client';

import React, { useReducer, useRef, useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  Form,
  Link,
  Modal,
} from "react-aria-components";
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer, } from "@/components/Container";
import { FormInput, RadioGroupComponent } from '@/components/Form';
import ErrorMessages from '@/components/ErrorMessages';

// Other
import { logECS, routePath } from '@/utils/index';
import { AddProjectContributorInput } from "@/generated/graphql";
import { useToast } from '@/context/ToastContext';
import { addProjectCollaboratorAction, addProjectMemberAction } from './actions/index';
import { UserInterface, CollaboratorResponse, AddProjectContributorResponse } from '@/app/types';
import styles from './ProjectsProjectPlanFeedbackInvite.module.scss';

// Define initial state for useReducer
const initialState = {
  accessLevel: 'edit',
  email: '',
  statusMessage: '',
  errorMessages: [] as string[],
  isModalOpen: false,
  invitedEmail: '',
  addAsMember: 'yes',
  user: {
    givenName: '',
    surName: '',
    affiliation: { uri: '' },
    orcid: ''
  } as UserInterface,
  emailError: null as string | null,
};

// Define reducer function
const reducer = (state: typeof initialState, action: { type: string; payload?: any }) => {
  switch (action.type) {
    case 'SET_ACCESS_LEVEL':
      return { ...state, accessLevel: action.payload };
    case 'SET_EMAIL':
      return { ...state, email: action.payload, emailError: null };
    case 'SET_STATUS_MESSAGE':
      return { ...state, statusMessage: action.payload };
    case 'SET_ERROR_MESSAGES':
      return { ...state, errorMessages: action.payload };
    case 'SET_IS_MODAL_OPEN':
      return { ...state, isModalOpen: action.payload };
    case 'SET_INVITED_EMAIL':
      return { ...state, invitedEmail: action.payload };
    case 'SET_ADD_AS_MEMBER':
      return { ...state, addAsMember: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_EMAIL_ERROR':
      return { ...state, emailError: action.payload };
    default:
      return state;
  }
};

const ProjectsProjectPlanFeedbackInvite = () => {
  // Get projectId and planId params
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const dmpId = Array.isArray(params.dmpid) ? params.dmpid[0] : params.dmpid;
  const planId = Number(dmpId);

  const Global = useTranslations('Global');
  const toastState = useToast(); // Access the toast state from context

  const [state, dispatch] = useReducer(reducer, initialState);

  // Set refs for error messages and scrolling
  const errorRef = useRef<HTMLDivElement | null>(null);

  //Routes
  const INVITE_ROUTE = routePath('projects.dmp.feedback.invite', { projectId, dmpId });
  const radioData = {
    radioGroupLabel: "What should this person be able to do?",
    radioButtonData: [
      { value: 'edit', label: "Edit the plan" },
      { value: 'comment', label: "Comment only" }
    ]
  }

  const addMemberRadioData = {
    radioButtonData: [
      { value: 'yes', label: "Yes - add as project team member" },
      { value: 'no', label: "No" }
    ]
  }

  const handleRadioChange = (value: string) => {
    dispatch({ type: 'SET_ACCESS_LEVEL', payload: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset email error when user starts typing
    dispatch({ type: 'SET_EMAIL_ERROR', payload: null });
    dispatch({ type: 'SET_EMAIL', payload: e.target.value });
  }

  const addProjectCollaborator = async (email: string, accessLevel: string): Promise<CollaboratorResponse> => {
    try {
      const response = await addProjectCollaboratorAction({
        projectId: Number(projectId),
        email,
        accessLevel: accessLevel.toUpperCase()
      })

      if (response.redirect) {
        router.push(response.redirect);
      }

      return {
        success: response.success,
        errors: response.errors,
        data: response.data,
        redirect: response.redirect
      }
    } catch (error) {
      logECS('error', 'updatePlan', {
        error,
        url: {
          path: routePath('projects.dmp.show', { projectId, dmpId: planId })
        }
      });
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')],
      data: undefined
    };
  }

  const handleAddProjectCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract email and access level from form data
    const email = formData.get('email') as string;

    // Form validation
    if (!email) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: 'Please enter an email address' });
      return;
    }

    const result = await addProjectCollaborator(state.email, state.accessLevel);

    if (!result.success) {
      const errors = result.errors;

      // Check if errors is an array or an object
      if (Array.isArray(errors)) {
        logECS('error', 'addProjectCollaborator', {
          errors,
          url: { path: INVITE_ROUTE }
        });
        //Handle errors as an array
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [...state.errorMessages, Global('messaging.somethingWentWrong')] });
      }
    } else {
      if (result.data?.errors.general) {
        const errorMsg = result.data.errors.general;
        toastState.add(errorMsg, { type: 'error' });
      }

      if (result.data?.errors.email) {
        dispatch({ type: 'SET_EMAIL_ERROR', payload: result.data.errors.email });
      }
      // Set user data so that it is available for adding to project contributor
      if (result.data?.user) {
        dispatch({
          type: 'SET_USER',
          payload: {
            givenName: result.data.user.givenName || '',
            surName: result.data.user.surName || '',
            affiliation: { uri: result.data.user.affiliation?.uri || '' },
            orcid: result.data.user.orcid || '',
          },
        });
      }

      // Store the email for use in the modal
      dispatch({ type: 'SET_INVITED_EMAIL', payload: state.email });

      // Open the confirmation modal
      dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true });
    }

  };

  const handleModalClose = () => {
    dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false });
    // Reset form after closing the modal
    dispatch({ type: 'SET_EMAIL', payload: '' });
  };


  const addProjectMember = async (input: AddProjectContributorInput): Promise<AddProjectContributorResponse> => {
    try {
      const response = await addProjectMemberAction({
        input
      })

      if (response.redirect) {
        router.push(response.redirect);
      }

      return {
        success: response.success,
        errors: response.errors,
        data: response.data,
        redirect: response.redirect
      }
    } catch (error) {
      logECS('error', 'addProjectMember', {
        error,
        url: {
          path: INVITE_ROUTE
        }
      });
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')],
      data: undefined
    };
  }

  const handleAddProjectMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.addAsMember === 'no') {
      handleModalClose();
      return;
    }

    const input = {
      projectId: Number(projectId),
      affiliationId: state.user.affiliation?.uri,
      givenName: state.user.givenName,
      surName: state.user.surName,
      orcid: state.user.orcid,
      email: state.invitedEmail,
    }

    const result = await addProjectMember(input);

    if (!result.success) {
      const errors = result.errors;

      // Check if errors is an array or an object
      if (Array.isArray(errors)) {
        logECS('error', 'addProjectCollaborator', {
          errors,
          url: { path: INVITE_ROUTE }
        });
        //Handle errors as an array
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [...state.errorMessages, Global('messaging.somethingWentWrong')] });
      }
    } else {
      if (result.data?.errors.general) {
        dispatch({ type: 'SET_ERROR_MESSAGES', payload: [...state.errorMessages, (result.data?.errors.general ?? Global('messaging.somethingWentWrong'))] });
      }

      const addProjMemberSuccess = `${state.email} added as project member`;
      toastState.add(addProjMemberSuccess, { type: 'success' });
    }
    // Close the modal and reset
    handleModalClose();
  }

  return (
    <>
      <PageHeader
        title="Invite people and manage access"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects/proj_2425/dmp/xxx/feedback">Manage
              Access</Link></Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
          </>
        }
        className="page-project-members"
      />

      <ErrorMessages errors={state.errorMessages} ref={errorRef} />
      <LayoutContainer>
        <ContentContainer>
          <div className={styles.inviteFormContainer}>
            <Form onSubmit={handleAddProjectCollaborator}>
              <div className={styles.formGroup}>
                <FormInput
                  name="email"
                  type="email"
                  value={state.email}
                  onChange={handleInputChange}
                  inputClasses={styles.emailInput}
                  aria-required="true"
                  label="Email address"
                  placeholder='Enter a valid email address'
                  isInvalid={!state.emailError ? false : true}
                  errorMessage="Please enter a valid email address"
                />
              </div>

              <div className={styles.formGroup}>
                <RadioGroupComponent
                  name="accessLevel"
                  value={state.accessLevel}
                  classes={styles.radioGroup}
                  radioGroupLabel={radioData.radioGroupLabel}
                  radioButtonData={radioData.radioButtonData}
                  onChange={handleRadioChange}
                />
              </div>

              <div className={styles.formActions}>
                <Button
                  type="submit"
                  className="react-aria-Button react-aria-Button--primary"
                >
                  Grant access
                </Button>
              </div>

              <div className={styles.formHelp}>
                <p>
                  When you click <strong>Grant access</strong> we&#39;ll send an
                  email to this person inviting
                  them to view your plan.
                </p>
                <p>
                  If they aren&#39;t already a member of
                  we&#39;ll invite them to join.
                </p>
                <p>
                  <Link href="/help/sharing" className="text-base underline">Learn
                    more</Link>
                </p>
              </div>
            </Form>
          </div>
        </ContentContainer>
      </LayoutContainer>

      {/* Confirmation Modal */}
      < Modal
        isDismissable
        isOpen={state.isModalOpen}
        onOpenChange={(isOpen) => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: isOpen })} >
        <Dialog
          aria-labelledby="invite-confirmation">
          <div >
            <h2 id="invite-confirmation">Invite sent</h2>

            <p >
              We have sent an invite to <strong>{state.invitedEmail}</strong>. They
              will have access to this project.
            </p>
            <hr />

            <p >
              <strong>
                Would you like to add this person as a project team member on
                the project?
              </strong>
            </p>
            <p>
              This will make it easier for you add them to a plans etc
            </p>

            <Form onSubmit={handleAddProjectMember}>
              <RadioGroupComponent
                name="addAsMember"
                value={state.addAsMember}
                classes={styles.radioGroup}
                radioButtonData={addMemberRadioData.radioButtonData}
                onChange={() => dispatch({ type: 'SET_ADD_AS_MEMBER', payload: state.addAsMember === 'yes' ? 'no' : 'yes' })}
              />

              <div className="modal-actions">
                <div>
                  <Button type="submit">{Global('buttons.save')}</Button>
                </div>
                <div>
                  <Button data-secondary className="secondary" onPress={handleModalClose}>{Global('buttons.close')}</Button>
                </div>
              </div>
            </Form>
          </div>
        </Dialog>
      </Modal >
    </>
  );
};

export default ProjectsProjectPlanFeedbackInvite;

