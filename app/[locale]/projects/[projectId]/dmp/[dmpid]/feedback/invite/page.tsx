'use client';

import React, { useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Checkbox,
  CheckboxGroup,
  Dialog,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Modal,
  Radio,
  RadioGroup,
  TextField
} from "react-aria-components";
import { useParams, useRouter } from 'next/navigation';


// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer, } from "@/components/Container";

// Other
import { logECS } from '@/utils/index';
import { routePath } from '@/utils/routes';
import { useTranslations } from 'next-intl';
import { addProjectCollaboratorAction } from './addCollaboratorAction';
import styles from './ProjectsProjectPlanFeedbackInvite.module.scss';

const ProjectsProjectPlanFeedbackInvite = () => {
  // Get projectId and planId params
  const params = useParams();
  const router = useRouter();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  const dmpId = Array.isArray(params.dmpid) ? params.dmpid[0] : params.dmpid;
  const planId = Number(dmpId);

  const Global = useTranslations('Global');

  const [accessType, setAccessType] = useState<string>('edit'); // Default to 'edit'
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [addAsMember, setAddAsMember] = useState('yes');



  const addProjectCollaborator = async (email: string, accessLevel: string) => {
    try {
      const response = await addProjectCollaboratorAction({
        projectId: Number(projectId),
        email,
        accessLevel
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
      data: null
    };
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);


    // Extract email and access level from form data
    const email = formData.get('email') as string;
    const accessLevel = formData.get('accessLevel') as string;

    // Form validation
    if (!email) {
      setStatusMessage('Please enter an email address');
      return;
    }

    const result = await addProjectCollaborator(email, accessLevel);

    if (!result.success) {
      const errors = result.errors;

      // Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        //Set error mesages
      }
    } else {
      if (
        result.data?.errors &&
        typeof result.data.errors === 'object' &&
        typeof result.data.errors.general === 'string') {
        // Handle errors as an object with general or field-level errors
        // Set error messages
      }
      //Need to refetch plan data to refresh the info that was changed
      //await refetch();
    }

    setStatusMessage(`Invitation sent to ${email}`);

    // Store the email for use in the modal
    setInvitedEmail(email);

    // Open the confirmation modal
    setIsModalOpen(true);

    // You would typically make an API call here
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Reset form after closing the modal
    setEmail('');
  };

  const handleSave = () => {
    // Process the user's choice about adding as a team member
    console.log('Adding as team member:', addAsMember === 'yes');

    // Here you would make an API call to save this preference

    // Close the modal and reset
    setIsModalOpen(false);
    setEmail('');
  };

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

      <LayoutContainer>
        <ContentContainer>
          <div
            aria-live="polite"
            className={styles.srOnly}
            role="status"
          >
            {statusMessage}
          </div>
          <div className={styles.inviteFormContainer}>
            <h2 className={styles.formTitle}>Who should have access to this
              plan?</h2>

            <Form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <TextField
                  name="email"
                  type="email"
                  isRequired
                  value={email}
                  onChange={setEmail}
                >
                  <Label>Email address</Label>
                  <Input
                    placeholder="Enter a valid email address"
                    className={styles.emailInput}
                  />
                  <FieldError />
                </TextField>
              </div>

              <div className={styles.formGroup}>
                <h3 className={styles.sectionLabel}>What should this person be
                  able to do?</h3>
                <CheckboxGroup
                  aria-label="User permissions"
                  value={[accessType]}
                >
                  <Checkbox
                    value="edit"
                    isSelected={accessType === 'edit'}
                    onChange={() => setAccessType('edit')}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <span>Edit the plan</span>
                  </Checkbox>

                  <Checkbox
                    value="comment"
                    isSelected={accessType === 'comment'}
                    onChange={() => setAccessType('comment')}
                  >
                    <div className="checkbox">
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </div>
                    <span>Comment only</span>
                  </Checkbox>
                </CheckboxGroup>
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
      <Modal isDismissable isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog aria-label="Invite Confirmation">
          <div >
            <h2 >Invite sent</h2>

            <p >
              We have sent an invite to <strong>{invitedEmail}</strong>. They
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

            <Form onSubmit={handleSave}>
              <RadioGroup
                name="addAsMember"
                value={addAsMember}
                onChange={setAddAsMember}
                className={styles.radioGroup}
              >
                <Radio value="yes" className={styles.radioBtn}>
                  <div className={styles.radioContent}>
                    <span>Yes - add as project team member</span>
                  </div>
                </Radio>

                <Radio value="no" className={styles.radioBtn}>
                  <div className={styles.radioContent}>
                    <span>No</span>
                  </div>
                </Radio>
              </RadioGroup>

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
      </Modal>
    </>
  );
};

export default ProjectsProjectPlanFeedbackInvite;

