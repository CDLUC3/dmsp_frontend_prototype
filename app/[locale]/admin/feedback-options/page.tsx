"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import { FormInput, FormTextArea } from "@/components/Form";
import RadioGroupComponent from "@/components/Form/RadioGroup";
import { Button } from "react-aria-components";

import { useTranslations } from "next-intl";
import styles from "./feedbackOptions.module.scss";

const FeedbackOptions: React.FC = () => {
  const t = useTranslations("FeedbackOptions");

  const [feedbackEnabled, setFeedbackEnabled] = useState<string>("on");
  const [feedbackEmail, setFeedbackEmail] = useState<string>("helpdesk@ucop.edu");
  const [feedbackText, setFeedbackText] = useState<string>(
    "Someone from the University of California Curation Center (UC3) will respond to your request within 48 hours. If you have questions pertaining to this action please contact us at dmptool@ucop.edu",
  );

  const radioButtonData = [
    {
      value: "on",
      label: t("fields.feedbackEnabled.options.on"),
    },
    {
      value: "off",
      label: t("fields.feedbackEnabled.options.off"),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit");
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        showBackButton={true}
        className="page-feedback-options-header"
      />

      <LayoutWithPanel className={"page-feedback-options"}>
        <ContentContainer>
          <form onSubmit={handleSubmit}>
            {/* Introduction text */}
            <div className={styles.sectionContainer}>
              <div className={styles.sectionContent}>
                <p>{t("description")}</p>

                <RadioGroupComponent
                  name="feedbackEnabled"
                  radioGroupLabel={t("fields.feedbackEnabled.label")}
                  radioButtonData={radioButtonData}
                  value={feedbackEnabled}
                  onChange={setFeedbackEnabled}
                />

                {/* Screen reader announcement for state changes */}
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className={styles.srOnly}
                >
                  {feedbackEnabled === "on"
                    ? "Feedback options are now enabled. Additional fields are available below."
                    : "Feedback options are now disabled. Additional fields are hidden."}
                </div>

                {/* Feedback email address section - only show when enabled */}
                <div
                  id="feedback-email-section"
                  role="region"
                  aria-label={t("fields.feedbackEmail.label")}
                  aria-live="polite"
                  className={`${styles.conditionalRegion} ${feedbackEnabled !== "on" ? styles.hidden : styles.visible}`}
                >
                  {feedbackEnabled === "on" && (
                    <FormInput
                      name="feedbackEmail"
                      label={t("fields.feedbackEmail.label")}
                      placeholder={t("fields.feedbackEmail.placeholder")}
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      isRequired={true}
                      helpMessage={t("fields.feedbackEmail.helpText")}
                    />
                  )}
                </div>

                {/* Request Expert Feedback section - only show when enabled */}
                <div
                  id="expert-feedback-section"
                  role="region"
                  aria-label={t("fields.feedbackText.label")}
                  aria-live="polite"
                  className={`${styles.conditionalRegion} ${feedbackEnabled !== "on" ? styles.hidden : styles.visible}`}
                >
                  {feedbackEnabled === "on" && (
                    <FormTextArea
                      name="feedbackText"
                      label={t("fields.feedbackText.label")}
                      richText={true}
                      value={feedbackText}
                      onChange={setFeedbackText}
                      isRequired={true}
                    />
                  )}
                </div>

                {/* Save button */}
                <div className={styles.saveButton}>
                  <Button type="submit">{t("actions.save")}</Button>
                </div>
              </div>
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

export default FeedbackOptions;
