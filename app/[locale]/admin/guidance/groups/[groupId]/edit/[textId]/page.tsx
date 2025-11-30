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
} from "react-aria-components";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

// GraphQL
import {
  useGuidanceQuery,
  useTagsQuery
} from '@/generated/graphql';
import { updateGuidanceAction } from "./actions";
import { TagsInterface } from '@/app/types';

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutWithPanel } from "@/components/Container";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { DmpIcon } from "@/components/Icons";
import { CheckboxGroupComponent } from "@/components/Form";
import ErrorMessages from "@/components/ErrorMessages";


// Utils & other
import { routePath } from "@/utils/routes";
import { useToast } from "@/context/ToastContext";
import logECS from "@/utils/clientLogger";
import { extractErrors } from "@/utils/errorHandler";
import styles from "./guidanceTextEdit.module.scss";

type UpdateGuidanceTextErrors = {
  general?: string;
  guidanceGroupId?: string;
  guidanceText?: string;
  tags?: string;
};

interface GuidanceText {
  id: string;
  guidanceText: string;
  tags: TagsInterface[];
  status?: "Published" | "Draft";
}
const GuidanceTextEditPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast();
  const groupId = String(params.groupId);
  const textId = String(params.textId);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  //Store selection of tags in state
  const [tags, setTags] = useState<TagsInterface[]>([]);

  // Keep track of which checkboxes have been selected
  const [selectedTags, setSelectedTags] = useState<TagsInterface[]>([]);
  const [checkboxTags, setCheckboxTags] = useState<string[]>([]);


  const [guidanceText, setGuidanceText] = useState<GuidanceText>({
    id: textId,
    guidanceText: "",
    tags: [],
  });

  // Query for all tags
  const { data: tagsData } = useTagsQuery();

  // Query for the specified guidance text
  const { data } = useGuidanceQuery({
    variables: {
      guidanceId: Number(textId)
    },
  })

  useEffect(() => {
    // Update state values from data results
    if (data?.guidance) {
      const guidance = data.guidance;

      // Clean tags data - filter out nulls and remove __typename
      const cleanedTags = guidance.tags
        ? guidance.tags
          .filter(tag => tag !== null && tag !== undefined && tag.id !== null && tag.id !== undefined)
          .map(({ __typename, ...fields }) => ({
            id: fields.id as number,
            name: fields.name,
            description: fields.description || ''
          }))
        : [];

      if (data.guidance?.tags) {
        const cleanedTags = data.guidance?.tags.filter(tag => tag !== null && tag !== undefined);
        const cleanedData = cleanedTags.map(({ __typename, ...fields }) => fields);
        setSelectedTags(cleanedData);
        const selectedTagNames = cleanedData.map(tag => tag.name);
        setCheckboxTags(selectedTagNames);
      }

      setGuidanceText((prev) => ({
        ...prev,
        guidanceText: guidance.guidanceText ? guidance.guidanceText : '',
        tags: cleanedTags,
      }));
    }
  }, [data])

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

  // Handle checkbox change for tags
  // Handle changes to tag checkbox selection
  const handleCheckboxChange = (tag: TagsInterface) => {
    setSelectedTags(prevTags => {
      const isCurrentlySelected = prevTags.some(selectedTag => selectedTag.id === tag.id);
      const updatedTags = isCurrentlySelected
        ? prevTags.filter(selectedTag => selectedTag.id !== tag.id)
        : [...prevTags, tag];

      // Update guidanceText.tags to match
      setGuidanceText(prev => ({ ...prev, tags: updatedTags }));

      // Update checkboxTags with tag names
      setCheckboxTags(updatedTags.map(t => t.name));

      return updatedTags;
    });
  };

  const handleSave = useCallback(async () => {
    setErrorMessages([]);

    if (!groupId) {
      setErrorMessages(['Guidance Group ID is undefined']);
      return;
    }

    const response = await updateGuidanceAction({
      guidanceId: Number(textId),
      guidanceText: guidanceText.guidanceText,
      tags: guidanceText.tags
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
        logECS("error", "updating Guidance text", {
          errors,
          url: { path: routePath("admin.guidance.groups.index", { groupId }) },
        });
      }
    } else {
      // Check if there are any GraphQL errors
      if (response?.data?.errors) {
        const errs = extractErrors<UpdateGuidanceTextErrors>(response?.data?.errors, ["general", "guidanceGroupId", "guidanceText", "tags"]);

        if (errs.length > 0) {
          setErrorMessages(errs);
          logECS("error", "updating Guidance text", {
            errors: errs,
            url: { path: routePath("admin.guidance.groups.index", { groupId }) },
          });
          return; // Don't show success if there are errors
        }
      }

      // Success case - no errors
      const successMessage = t("messages.success.guidanceTextUpdated");
      toastState.add(successMessage, { type: "success" });
      router.push(routePath("admin.guidance.groups.index", { groupId }));
    }
  }, [guidanceText.guidanceText, Global, router, groupId, toastState]);

  console.log("Selected Tags:", selectedTags);
  return (
    <>
      <PageHeader
        title={`${t("pages.textEdit.title")}`}
        description={t("pages.textEdit.description")}
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
            <Breadcrumb>{t("breadcrumbs.editText")}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-guidance-text-edit"
      />

      <ErrorMessages errors={errorMessages} ref={errorRef} />

      <LayoutWithPanel>
        <ContentContainer>
          <form className={styles.editForm}>
            {/* Guidance Text Content Section */}
            <div className="sectionContainer mt-0">
              <div className="sectionContent">
                <div className={styles.formGroup}>
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

                <div className={styles.formGroup}>
                  <CheckboxGroupComponent
                    name="guidanceTags"
                    value={checkboxTags}
                    checkboxGroupLabel={t("fields.themes.label")}
                    checkboxGroupDescription={t("fields.themes.helpText")}
                  >
                    <div className="checkbox-group-two-column">
                      {tags &&
                        tags.map((tag) => {
                          const id = tag.id?.toString();
                          // Check if this tag is selected
                          const isSelected = guidanceText.tags.some((selectedTag) => selectedTag.id === tag.id);
                          return (
                            <Checkbox
                              value={tag.name}
                              key={tag.name}
                              id={id}
                              isSelected={isSelected}
                              onChange={() => handleCheckboxChange(tag)}
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
                    {t("actions.saveChanges")}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  );
};

export default GuidanceTextEditPage;
