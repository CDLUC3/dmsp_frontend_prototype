"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useParams, useRouter } from "next/navigation";

// GraphQL
import { useTagsQuery } from '@/generated/graphql';
import { addGuidanceTextAction } from "./actions";
import { TagsInterface } from '@/app/types';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { DmpIcon } from "@/components/Icons";
import {
  FormInput,
  CheckboxGroupComponent,
  FormSelect
} from "@/components/Form";
import ErrorMessages from "@/components/ErrorMessages";

// Utils, other
import logECS from "@/utils/clientLogger";
import { extractErrors } from "@/utils/errorHandler";
import { routePath } from "@/utils/routes";
import { useToast } from "@/context/ToastContext";
import styles from "./guidanceTextCreate.module.scss";

interface GuidanceText {
  guidanceText: string;
  status: "Published" | "Draft";
}


type AddGuidanceTextErrors = {
  general?: string;
  guidanceGroupId?: string;
  guidanceText?: string;
  tags?: string;
};

const GuidanceTextCreatePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast();
  const groupId = String(params.groupId);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagsInterface[]>([]);
  //Store guidance text data in state
  const [guidanceText, setGuidanceText] = useState<GuidanceText>({
    guidanceText: "",
    status: "Draft",
  });
  //Store selection of tags in state
  const [tags, setTags] = useState<TagsInterface[]>([]);
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Status options for dropdown
  const statusOptions = [
    { id: "Published", name: t("status.published") },
    { id: "Draft", name: t("status.draft") },
  ];

  // Query for all tags
  const { data: tagsData } = useTagsQuery();

  const handleStatusChange = () => {
    setIsEditingStatus(true);
  };

  const handleStatusForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEditingStatus(false);
    // TODO: Implement status update functionality
  };

  // Handle addition of guidance text
  const handleCheckboxChange = (tag: TagsInterface) => {
    setSelectedTags((prevTags) => {
      // Check if the tag is already selected
      const isAlreadySelected = prevTags.some((selectedTag) => selectedTag.id === tag.id);

      if (isAlreadySelected) {
        // If already selected, remove it
        return prevTags.filter((selectedTag) => selectedTag.id !== tag.id);
      } else {
        // If not selected, add it
        return [...prevTags, tag];
      }
    });
  };

  const handleSave = useCallback(async () => {
    setErrorMessages([]);

    if (!groupId) {
      setErrorMessages(['Guidance Group ID is undefined']);
      return;
    }

    const response = await addGuidanceTextAction({
      guidanceGroupId: Number(groupId),
      guidanceText: guidanceText.guidanceText,
      tags: selectedTags
    });

    if (response.redirect) {
      router.push(response.redirect);
      return;
    }

    if (!response.success) {
      const errors = response.errors;

      //Check if errors is an array or an object
      if (Array.isArray(errors)) {
        //Handle errors as an array
        setErrorMessages(errors.length > 0 ? errors : [Global("messaging.somethingWentWrong")]);
        logECS("error", "adding Guidance text", {
          errors,
          url: { path: routePath("admin.guidance.groups.index", { groupId }) },
        });
      }
    } else {
      // Check if there are any GraphQL errors
      if (response?.data?.errors) {
        const errs = extractErrors<AddGuidanceTextErrors>(response?.data?.errors, ["general", "guidanceGroupId", "guidanceText", "tags"]);

        if (errs.length > 0) {
          setErrorMessages(errs);
          logECS("error", "adding Guidance text", {
            errors: errs,
            url: { path: routePath("admin.guidance.groups.index", { groupId }) },
          });
          return; // Don't show success if there are errors
        }
      }

      // Success case - no errors
      const successMessage = t("messages.success.guidanceTextAdded");
      toastState.add(successMessage, { type: "success" });
      router.push(routePath("admin.guidance.groups.index", { groupId }));
    }
  }, [guidanceText.guidanceText, Global, router, groupId, toastState]);

  useEffect(() => {
    if (tagsData?.tags) {
      // Remove __typename field from the tags selection
      const cleanedData = tagsData.tags.map(({
        __typename,
        ...fields
      }) => fields);
      setTags(cleanedData);
    }
  }, [tagsData])

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

                <div>
                  <Label
                    htmlFor="content"
                    id="contentLabel"
                  >
                    {t("fields.guidanceText.label")}
                  </Label>
                  <TinyMCEEditor
                    content={guidanceText.guidanceText}
                    setContent={(value) => setGuidanceText((prev) => ({ ...prev, guidanceText: value }))}
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
                  >
                    <div className="checkbox-group-two-column">
                      {tags && tags.map(tag => {
                        const id = (tag.id)?.toString();
                        return (
                          <Checkbox
                            value={tag.name}
                            key={tag.name}
                            id={id}
                            onChange={() => handleCheckboxChange(tag)}
                          >
                            <div className="checkbox">
                              <svg viewBox="0 0 18 18" aria-hidden="true">
                                <polyline points="1 9 7 14 15 4" />
                              </svg>
                            </div>
                            <span className="checkbox-label"
                              data-testid='checkboxLabel'>
                              <div className="checkbox-wrapper">
                                <div>{tag.name}</div>
                                <DialogTrigger>
                                  <Button className="popover-btn"
                                    aria-label="Click for more info"><div
                                      className="icon info"><DmpIcon
                                        icon="info" /></div></Button>
                                  <Popover>
                                    <OverlayArrow>
                                      <svg width={12} height={12}
                                        viewBox="0 0 12 12">
                                        <path d="M0 0 L6 6 L12 0" />
                                      </svg>
                                    </OverlayArrow>
                                    <Dialog>
                                      <div className="flex-col">
                                        {tag.description}
                                      </div>
                                    </Dialog>
                                  </Popover>
                                </DialogTrigger>
                              </div>
                            </span>
                          </Checkbox>
                        )
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
                        setGuidanceText((prev) => ({ ...prev, status: selected as "Published" | "Draft" }))
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
