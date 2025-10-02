"use client";

import React, { useState } from "react";
import {
  Breadcrumb,
  Breadcrumbs,
  Link,
  Button,
  Label,
  Checkbox,
  Dialog,
  DialogTrigger,
  OverlayArrow,
  Popover,
  Form,
  ListBoxItem,
} from "react-aria-components";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { DmpIcon } from "@/components/Icons";
import { FormInput, CheckboxGroupComponent, FormSelect } from "@/components/Form";

import { routePath } from "@/utils/routes";
import styles from "./guidanceTextCreate.module.scss";

interface GuidanceText {
  title: string;
  content: string;
  selectedTags: string[];
  status: "Published" | "Draft";
}

interface Tag {
  id: number;
  name: string;
  description: string;
}

const GuidanceTextCreatePage: React.FC = () => {
  const params = useParams();
  const groupId = String(params.groupId);
  const [guidanceText, setGuidanceText] = useState<GuidanceText>({
    title: "",
    content: "",
    selectedTags: [],
    status: "Draft",
  });

  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Status options for dropdown
  const statusOptions = [
    { id: "Published", name: t("status.published") },
    { id: "Draft", name: t("status.draft") },
  ];

  // Fake tags data (same as edit page)
  const tags: Tag[] = [
    {
      id: 1,
      name: "Data description",
      description: "The types of data that will be collected along with their formats and estimated volumes.",
    },
    {
      id: 2,
      name: "Data organization & documentation",
      description:
        "Descriptions naming conventions, metadata standards that will be used along with data dictionaries and glossaries",
    },
    {
      id: 3,
      name: "Security & privacy",
      description:
        "Who will have access to the data and how that access will be controlled, how the data will be encrypted and relevant compliance with regulations or standards (e.g. HIPAA, GDPR)",
    },
    {
      id: 4,
      name: "Ethical considerations",
      description:
        "Ethical considerations during data collection, use or sharing and how informed consent will be obtained from participants",
    },
    {
      id: 5,
      name: "Training & support",
      description:
        "Training that will be provided to team members on data management practices and support for data issues",
    },
    {
      id: 6,
      name: "Budget",
      description: "Costs associated with data management activities and resources needed",
    },
    {
      id: 7,
      name: "Data Collection",
      description: "Methods and procedures for collecting research data",
    },
    {
      id: 8,
      name: "Data format",
      description: "File formats and data structures used for storing research data",
    },
    {
      id: 9,
      name: "Data repository",
      description: "Where and how research data will be stored and archived",
    },
    {
      id: 10,
      name: "Data sharing",
      description: "Policies and procedures for sharing research data with other researchers",
    },
  ];

  const handleStatusChange = () => {
    setIsEditingStatus(true);
  };

  const handleStatusForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditingStatus(false);
    // TODO: Implement status update functionality
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    // console.log("Creating guidance text:", guidanceText);
  };

  return (
    <>
      <PageHeader
        title={t("pages.textCreate.title")}
        description={t("pages.textCreate.description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.index")}>{t("breadcrumbs.guidanceGroups")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.groups.index", { groupId })}>{t("breadcrumbs.group")}</Link>
            </Breadcrumb>
            <Breadcrumb>{t("breadcrumbs.createText")}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-guidance-text-create"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <form className={styles.createForm}>
            {/* Guidance Text Content Section */}
            <div className="sectionContainer mt-0">
              <div className="sectionContent">
                <div className={styles.formGroup}>
                  <FormInput
                    name="title"
                    label={t("fields.title.label")}
                    value={guidanceText.title}
                    onChange={(e) => setGuidanceText({ ...guidanceText, title: e.target.value })}
                    placeholder={t("fields.title.placeholder")}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="content"
                    id="contentLabel"
                  >
                    {t("fields.guidanceText.label")}
                  </Label>
                  <TinyMCEEditor
                    content={guidanceText.content}
                    setContent={(value) => setGuidanceText({ ...guidanceText, content: value })}
                    id="content"
                    labelId="contentLabel"
                    helpText={t("fields.guidanceText.helpText")}
                  />
                </div>

                <div>
                  <CheckboxGroupComponent
                    name="guidanceTags"
                    checkboxGroupLabel={t("fields.themes.label")}
                    checkboxGroupDescription={t("fields.themes.helpText")}
                    value={guidanceText.selectedTags}
                    onChange={(value) => setGuidanceText({ ...guidanceText, selectedTags: value })}
                  >
                    <div className="checkbox-group-two-column">
                      {tags &&
                        tags.map((tag) => {
                          const id = tag.id?.toString();
                          return (
                            <Checkbox
                              value={tag.name}
                              key={tag.name}
                              id={id}
                            >
                              <div className="checkbox">
                                <svg
                                  viewBox="0 0 18 18"
                                  aria-hidden="true"
                                >
                                  <polyline points="1 9 7 14 15 4" />
                                </svg>
                              </div>
                              <span
                                className="checkbox-label"
                                data-testid="checkboxLabel"
                              >
                                <div className="checkbox-wrapper">
                                  <div>{tag.name}</div>
                                  <DialogTrigger>
                                    <Button
                                      className="popover-btn"
                                      aria-label={`More information about ${tag.name}`}
                                    >
                                      <div className="icon">
                                        <DmpIcon icon="info" />
                                      </div>
                                    </Button>
                                    <Popover>
                                      <OverlayArrow>
                                        <svg
                                          width={12}
                                          height={12}
                                          viewBox="0 0 12 12"
                                        >
                                          <path d="M0 0 L6 6 L12 0" />
                                        </svg>
                                      </OverlayArrow>
                                      <Dialog>
                                        <div className="flex-col">{tag.description}</div>
                                      </Dialog>
                                    </Popover>
                                  </DialogTrigger>
                                </div>
                              </span>
                            </Checkbox>
                          );
                        })}
                    </div>
                  </CheckboxGroupComponent>
                </div>

                <div className={styles.formGroup}>
                  <Button
                    onPress={handleSave}
                    className="button button--primary"
                  >
                    {t("actions.createText")}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </ContentContainer>

        <SidebarPanel>
          <div className={`statusPanelContent sidePanel`}>
            <div className="sidePanelContent">
              {isEditingStatus ? (
                <div>
                  <Form
                    onSubmit={handleStatusForm}
                    className="statusForm"
                  >
                    <FormSelect
                      label={t("status.status")}
                      ariaLabel="Select status"
                      isRequired
                      name="status"
                      items={statusOptions}
                      onChange={(selected) =>
                        setGuidanceText({ ...guidanceText, status: selected as "Published" | "Draft" })
                      }
                      selectedKey={guidanceText.status}
                    >
                      {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
                    </FormSelect>
                    {isEditingStatus && <Button type="submit">Save</Button>}
                  </Form>
                </div>
              ) : (
                <div className={`panelRow mb-5`}>
                  <div>
                    <p
                      className="sidebar-label"
                      role="heading"
                      aria-level={2}
                    >
                      {t("status.status")}
                    </p>
                    <p>{guidanceText.status === "Published" ? t("status.published") : t("status.draft")}</p>
                  </div>
                  <Button
                    className={`buttonLink link`}
                    onPress={handleStatusChange}
                    aria-label="Change status"
                  >
                    {t("actions.edit")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default GuidanceTextCreatePage;
