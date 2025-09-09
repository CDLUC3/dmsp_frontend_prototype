"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import { FormInput, FormTextArea } from "@/components/Form";
import { Button } from "react-aria-components";

import { useTranslations } from "next-intl";
import styles from "./emailPreferences.module.scss";

const EmailPreferencesPage: React.FC = () => {
  const t = useTranslations("EmailPreferences");

  const [subject, setSubject] = useState<string>(
    "A new data management plan (DMP) for the Non Partner Institution was started for you.",
  );
  const [emailText, setEmailText] = useState<string>(
    "A new data management plan (DMP) has been started for you by the %{external_system_name}. If you have any questions or need help, please contact the administrator for the Non Partner Institution at uc3@ucop.edu.<br><br>Thank you,<br>The DMPTool-Stage team<br><br>Please do not reply to this email. If you have any questions or need help, please contact us at or visit https://dmptool-stg.cdlib.org/contact-us",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit");
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        showBackButton={true}
        className="page-email-preferences-header"
      />

      <LayoutWithPanel className={"page-email-preferences"}>
        <ContentContainer>
          <form onSubmit={handleSubmit}>
            {/* Customize email text section */}
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <p>
                  <strong>{t("sections.customizeEmailText.title")}</strong>
                </p>
                <p>{t("sections.customizeEmailText.description")}</p>

                <FormInput
                  name="subject"
                  label={t("fields.subject.label")}
                  placeholder={t("fields.subject.placeholder")}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  isRequired={true}
                />

                <FormTextArea
                  name="emailText"
                  label={t("fields.emailText.label")}
                  richText={true}
                  value={emailText}
                  onChange={setEmailText}
                  isRequired={true}
                />
              </div>
            </div>

            {/* Preview Email section */}
            <div className={styles.sectionHeader}>
              <h2>{t("sections.previewEmail.title")}</h2>
            </div>
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <div className={styles.emailPreview}>
                  <div className={styles.emailPreviewHeader}>
                    <strong>Subject:</strong> {subject || "No subject entered"}
                  </div>
                  <div className={styles.emailPreviewBody}>
                    <div dangerouslySetInnerHTML={{ __html: emailText || "No email text entered" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className={styles.saveButton}>
              <Button type="submit">{t("buttons.save")}</Button>
            </div>
          </form>
        </ContentContainer>

        <SidebarPanel>
          <div>{/* TODO: Add sidebar content */}</div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default EmailPreferencesPage;
