"use client";

import React, { useState } from "react";
import { Breadcrumb, Breadcrumbs, Link, Button, Checkbox } from "react-aria-components";
import { useTranslations } from "next-intl";

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import { FormInput, CheckboxGroupComponent } from "@/components/Form";

import { routePath } from "@/utils/routes";
import styles from "./guidanceGroupCreate.module.scss";

interface GuidanceGroupSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface GuidanceGroup {
  title: string;
  settings: GuidanceGroupSetting[];
  status: "Published" | "Draft";
}

const GuidanceGroupCreatePage: React.FC = () => {
  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  const [guidanceGroup, setGuidanceGroup] = useState<GuidanceGroup>({
    title: "",
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
        enabled: false,
      },
      {
        id: "includes-emojis",
        name: "Includes emojis",
        description: "for enhanced readability",
        enabled: false,
      },
    ],
    status: "Draft",
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Creating guidance group:", guidanceGroup);
  };

  return (
    <>
      <PageHeader
        title={t("pages.groupCreate.title")}
        description={t("pages.groupCreate.description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.index")}>{t("breadcrumbs.guidanceGroups")}</Link>
            </Breadcrumb>
            <Breadcrumb>{t("breadcrumbs.createGroup")}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-guidance-group-create"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <form className={styles.createForm}>
            {/* Guidance Group Section */}

            <div className="sectionContainer">
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
              <Button
                onPress={handleSave}
                className="button button--primary"
              >
                {t("actions.createGroup")}
              </Button>
            </div>

            <div className="sidePanelContent">
              <div className={`panelRow mb-5`}>
                <div>
                  <h3>{t("status.status")}</h3>
                  <p>{t("status.draft")}</p>
                </div>
              </div>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default GuidanceGroupCreatePage;
