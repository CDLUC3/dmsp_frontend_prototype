'use client';

import React, {useState} from 'react';
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
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import styles from './ProjectsProjectPlanFeedbackInvite.module.scss';

const ProjectsProjectPlanFeedbackInvite = () => {
  const [accessType, setAccessType] = useState<string>('edit'); // Default to 'edit'
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [addAsMember, setAddAsMember] = useState('yes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!email) {
      setStatusMessage('Please enter an email address');
      return;
    }

    // Form submission logic
    console.log('Inviting user:', {email, accessType});
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



      <LayoutWithPanel>
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
                  <FieldError/>
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
                        <polyline points="1 9 7 14 15 4"/>
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
                        <polyline points="1 9 7 14 15 4"/>
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
                  When you click <strong>Grant access</strong> we'll send an
                  email to this person inviting
                  them to view your plan.
                </p>
                <p>
                  If they aren't already a member of
                  we'll invite them to join.
                </p>
                <p>
                  <Link href="/help/sharing" className="text-base underline">Learn
                    more</Link>
                </p>
              </div>
            </Form>
          </div>
        </ContentContainer>
        <SidebarPanel/>
      </LayoutWithPanel>

      {/* Confirmation Modal */}
      <Modal isDismissable isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog >
          <div >
            <h2 >Invite sent</h2>

            <p >
              We have sent an invite to <strong>{invitedEmail}</strong>. They
              will have access to this project.
            </p>
            <hr/>

            <p >
              <strong>
                Would you like to add this person as a project team member on
                the project?
              </strong>
            </p>
            <p>
              This will make it easier for you add them to a plans etc
            </p>

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

            <div className={styles.modalActions}>
              <Button
                className="react-aria-Button react-aria-Button--secondary"
                onPress={handleModalClose}
              >
                Close
              </Button>
              <Button
                className="react-aria-Button react-aria-Button--primary"
                onPress={handleSave}
              >
                Save
              </Button>
            </div>
          </div>
        </Dialog>
      </Modal>
    </>
  );
};

export default ProjectsProjectPlanFeedbackInvite;
