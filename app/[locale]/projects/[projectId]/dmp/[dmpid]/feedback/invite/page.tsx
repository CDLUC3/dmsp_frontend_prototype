'use client';

import React, { useReducer, useRef } from 'react';
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
import { useToast } from '@/context/ToastContext';
import { addProjectCollaboratorAction } from './actions/index';
import { UserInterface, CollaboratorResponse } from '@/app/types';

// Define types for actions
type Action =
  | { type: 'SET_ACCESS_LEVEL'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_STATUS_MESSAGE'; payload: string }
  | { type: 'SET_ERROR_MESSAGES'; payload: string[] }
  | { type: 'SET_IS_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_INVITED_EMAIL'; payload: string }
  | { type: 'SET_USER'; payload: UserInterface }
  | { type: 'SET_EMAIL_ERROR'; payload: string | null };


// Define the initial state type
type State = {
  accessLevel: string;
  email: string;
  statusMessage: string;
  errorMessages: string[];
  isModalOpen: boolean;
  invitedEmail: string;
  user: UserInterface;
  emailError: string | null;
};
// Define initial state for useReducer
const initialState: State = {
  accessLevel: 'edit',
  email: '',
  statusMessage: '',
  errorMessages: [] as string[],
  isModalOpen: false,
  invitedEmail: '',
  user: {
    givenName: '',
    surName: '',
    affiliation: { uri: '' },
    orcid: ''
  },
  emailError: null,
};

// Define reducer function
const reducer = (state: typeof initialState, action: Action) => {
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
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_EMAIL_ERROR':
      return { ...state, emailError: action.payload };
    default:
      return state;
  }
};

// Email validation regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


const ProjectsProjectPlanFeedbackInvite = () => {
  // Get projectId and planId params
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const dmpId = Array.isArray(params.dmpid) ? params.dmpid[0] : params.dmpid;
  const planId = Number(dmpId);

  // Localization keys
  const Global = useTranslations('Global');
  const t = useTranslations('ProjectsProjectPlanFeedbackInvite');

  const toastState = useToast(); // Access the toast state from context

  const [state, dispatch] = useReducer(reducer, initialState);

  // To be used in the translation key for the modal
  const accessLevelDescription =
    state.accessLevel === 'comment'
      ? t('accessLevelOn', { accessLevel: state.accessLevel })
      : state.accessLevel; //e.g.

  // Set refs for error messages and scrolling
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Route paths
  const INVITE_ROUTE = routePath('projects.dmp.feedback.invite', { projectId, dmpId });
  const MEMBERS_ROUTE = routePath('projects.members.index', { projectId });
  const FEEDBACK_ROUTE = routePath('projects.dmp.feedback', { projectId, dmpId });
  const FEEDBACK_INVITE_ROUTE = routePath('projects.dmp.feedback.invite', { projectId, dmpId });

  // Access level ratio button data
  const radioData = {
    radioGroupLabel: t('radioButtons.access.label'),
    radioButtonData: [
      { value: 'edit', label: t('radioButtons.access.edit') },
      { value: 'comment', label: t('radioButtons.access.comment') }
    ]
  }

  // Handle access level radio button change
  const handleRadioChange = (value: string) => {
    dispatch({ type: 'SET_ACCESS_LEVEL', payload: value });
  };

  // Handle change to email input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset email error when user starts typing
    dispatch({ type: 'SET_EMAIL_ERROR', payload: null });
    dispatch({ type: 'SET_EMAIL', payload: e.target.value });
  }

  // Close modal and redirect to Feedback page
  const handleModalClose = () => {
    dispatch({ type: 'SET_IS_MODAL_OPEN', payload: false });
    // Reset form after closing the modal
    dispatch({ type: 'SET_EMAIL', payload: '' });
    // Redirect back to feedback page
    router.push(FEEDBACK_ROUTE);
  };

  // Validate email before submitting
  const validateEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email);
  };

  // Use Server Action to add project collaborator
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
        data: response.data
      }
    } catch (error) {
      logECS('error', 'addProjectCollaborator', {
        error,
        url: {
          path: FEEDBACK_INVITE_ROUTE
        }
      });
    }
    return {
      success: false,
      errors: [Global('messaging.somethingWentWrong')]
    };
  }

  // Handle form submission to add project collaborator
  const handleAddProjectCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract email and access level from form data
    const email = formData.get('email') as string;

    // Validate email field
    if (!email || !validateEmail(email)) {
      dispatch({ type: 'SET_EMAIL_ERROR', payload: t('messaging.errors.email') });
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
      if (result.data?.errors?.general) {
        const errorMsg = result.data.errors.general;
        toastState.add(errorMsg, { type: 'error' });
      } else {
        if (result.data?.errors?.email) {
          dispatch({ type: 'SET_EMAIL_ERROR', payload: result.data.errors.email });
        }
        // Store the email for use in the modal
        dispatch({ type: 'SET_INVITED_EMAIL', payload: state.email });

        // Open the confirmation modal
        dispatch({ type: 'SET_IS_MODAL_OPEN', payload: true });
      }
    }
  };


  return (
    <>
      <PageHeader
        title={t('title')}
        description=""
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath('app.home')}>{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.index')}>{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId })}>{Global('breadcrumbs.project')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.dmp.feedback', { projectId, dmpId: planId })}>{Global('breadcrumbs.feedback')}</Link></Breadcrumb>
            <Breadcrumb>{t('title')}</Breadcrumb>
          </Breadcrumbs >
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
          <div >
            <Form onSubmit={handleAddProjectCollaborator} data-testid="add-collaborator-form">
              <div>
                <FormInput
                  name="email"
                  type="email"
                  value={state.email}
                  onChange={handleInputChange}
                  aria-required="true"
                  label={t('formLabels.email')}
                  placeholder={t('placeHolders.email')}
                  isInvalid={!state.emailError ? false : true}
                  errorMessage={t('messaging.errors.email')}
                />
              </div>

              <div>
                <RadioGroupComponent
                  name="accessLevel"
                  value={state.accessLevel}
                  radioGroupLabel={radioData.radioGroupLabel}
                  radioButtonData={radioData.radioButtonData}
                  onChange={handleRadioChange}
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="react-aria-Button react-aria-Button--primary"
                >
                  {t('buttons.grantAccess')}
                </Button>
              </div>

              <div>
                <p>
                  {t.rich('para1', {
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
                <p>
                  {t('para2')}
                </p>
                <p>
                  <Link href="/help/sharing" className="text-base underline">{Global('links.learnMore')}</Link>
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
        onOpenChange={(isOpen) => dispatch({ type: 'SET_IS_MODAL_OPEN', payload: isOpen })}
        data-testid="invite-confirmation-modal"
      >
        <Dialog
          aria-labelledby="invite-confirmation">
          <div >
            <h2 id="invite-confirmation">{t('headings.h2InviteSent')}</h2>

            <p >
              {t.rich('para3', {
                strong: (chunks) => <strong>{chunks}</strong>,
                email: state.invitedEmail
              })}

            </p>
            <hr />

            <p >
              {t.rich('para4', {
                projectMember: (chunks) => <a href={MEMBERS_ROUTE}>{chunks}</a>
              })}
            </p>
            <p>

              {t('para5', { access: accessLevelDescription })}
            </p>
          </div>
          <Button data-secondary className="secondary" onPress={handleModalClose}>{Global('buttons.close')}</Button>
        </Dialog>
      </Modal >
    </>
  );
};

export default ProjectsProjectPlanFeedbackInvite;

