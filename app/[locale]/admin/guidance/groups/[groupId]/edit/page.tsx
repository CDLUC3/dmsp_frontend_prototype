"use client";

import React, { useState } from "react";
import { Breadcrumb, Breadcrumbs, Link, Button, Checkbox, Form, ListBoxItem } from "react-aria-components";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import { FormSelect, FormInput, CheckboxGroupComponent } from "@/components/Form";

import { routePath } from "@/utils/routes";
import styles from "./guidanceGroupEdit.module.scss";

interface GuidanceGroupSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface GuidanceGroup {
  id: string;
  title: string;
  settings: GuidanceGroupSetting[];
  status: "Published" | "Draft";
}

const GuidanceGroupEditPage: React.FC = () => {
  const params = useParams();
  const groupId = String(params.groupId);

  // For translations
  const t = useTranslations("Guidance");

  const [guidanceGroup, setGuidanceGroup] = useState<GuidanceGroup>({
    id: groupId,
    title: "School of Health Sciences",
    settings: [
      {
        id: "optional-subset",
        name: "Optional subset",
        description: "e.g. School/ Department",
        enabled: false,
      },
      {
        id: "requires-coffee",
        name: "Requires coffee",
        description: "for optimal guidance creation",
        enabled: true,
      },
      {
        id: "includes-emojis",
        name: "Includes emojis",
        description: "for enhanced readability",
        enabled: false,
      },
      {
        id: "has-secret-sauce",
        name: "Has secret sauce",
        description: "for that extra sparkle",
        enabled: false,
      },
    ],
    status: "Draft",
  });

  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Status options for dropdown
  const statusOptions = [
    { id: "Published", name: t("status.published") },
    { id: "Draft", name: t("status.draft") },
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
    console.log("Saving guidance group:", guidanceGroup);
  };

  const handlePublish = () => {
    // TODO: Implement publish functionality
    console.log("Publishing guidance group:", guidanceGroup);
  };

  return (
    <>
      <PageHeader
        title={t("pages.groupEdit.title")}
        description={t("pages.groupEdit.description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>Admin</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.index")}>{t("breadcrumbs.guidance")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.groups.index", { groupId })}>{guidanceGroup.title}</Link>
            </Breadcrumb>
            <Breadcrumb>{t("breadcrumbs.editGroup")}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-guidance-group-edit"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <form className={styles.editForm}>
            {/* Guidance Group Section */}
            <div className="sectionContainer mt-0">
              <div className="sectionContent">
                <div className={styles.formGroup}>
                  <FormInput
                    name="title"
                    label={t("fields.groupName.label")}
                    value={guidanceGroup.title}
                    onChange={(e) => setGuidanceGroup({ ...guidanceGroup, title: e.target.value })}
                    placeholder={t("fields.groupName.placeholder")}
                  />
                </div>

                <div className={styles.formGroup}>
                  <CheckboxGroupComponent
                    name="guidanceGroupSettings"
                    checkboxGroupLabel={t("fields.settings.label")}
                    value={guidanceGroup.settings.filter((s) => s.enabled).map((s) => s.id)}
                    onChange={(value) => {
                      // Update all settings based on the new value array
                      const updatedSettings = guidanceGroup.settings.map((setting) => ({
                        ...setting,
                        enabled: value.includes(setting.id),
                      }));
                      setGuidanceGroup({ ...guidanceGroup, settings: updatedSettings });
                    }}
                  >
                    <div className="">
                      {guidanceGroup.settings.map((setting) => (
                        <Checkbox
                          key={setting.id}
                          value={setting.id}
                        >
                          <div className="checkbox">
                            <svg
                              viewBox="0 0 18 18"
                              aria-hidden="true"
                            >
                              <polyline points="1 9 7 14 15 4" />
                            </svg>
                          </div>
                          <span className="checkbox-label">
                            {setting.name} ({setting.description})
                          </span>
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroupComponent>
                </div>
              </div>
            </div>
          </form>
        </ContentContainer>

        <SidebarPanel>
          <div className={`statusPanelContent sidePanel`}>
            <div className={`buttonContainer withBorder mb-5`}>
              {guidanceGroup.status === "Draft" ? (
                <Button
                  onPress={handlePublish}
                  className="button button--primary"
                >
                  {t("actions.publish")}
                </Button>
              ) : (
                <Button
                  onPress={handleSave}
                  className="button button--primary"
                >
                  {t("actions.saveChanges")}
                </Button>
              )}
            </div>

            <div className="sidePanelContent">
              <div className={`panelRow mb-5`}>
                <div>
                  <p
                    className="sidebar-label"
                    role="heading"
                    aria-level={2}
                  >
                    {t("status.lastUpdated")}
                  </p>
                  <p>July 5, 2024</p>
                </div>
              </div>

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
                        setGuidanceGroup({ ...guidanceGroup, status: selected as "Published" | "Draft" })
                      }
                      selectedKey={guidanceGroup.status}
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
                    <p>{guidanceGroup.status}</p>
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

export default GuidanceGroupEditPage;
