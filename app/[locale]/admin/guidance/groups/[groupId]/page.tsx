"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Link,
  OverlayArrow,
  Popover,
} from "react-aria-components";
import { useParams, useRouter } from "next/navigation";

// GraphQL
import {
  useMeQuery,
  useGuidanceGroupQuery,
  useGuidanceByGroupQuery,
  useTagsQuery
} from '@/generated/graphql';
import {
  addGuidanceTextAction,
  publishGuidanceGroupAction,
  updateGuidanceAction
} from "./actions";

// Components
import PageHeader from "@/components/PageHeader";
import { Card, } from "@/components/Card/card";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { DmpIcon } from "@/components/Icons";
import Loading from "@/components/Loading";
import ErrorMessages from "@/components/ErrorMessages";

// Hooks
import { useFormatDate } from '@/hooks/useFormatDate';

// Utils, other
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import { stripHtmlTags } from '@/utils/general';
import { routePath } from "@/utils/routes";
import { useToast } from "@/context/ToastContext";
import logECS from "@/utils/clientLogger";
import { extractErrors } from "@/utils/errorHandler";
import { TagsInterface } from "@/app/types";

import styles from "./guidanceGroupIndex.module.scss";

// Types for guidance texts
interface GuidanceTag {
  id: number;
  name: string;
}

type UpdateGuidanceTextErrors = {
  general?: string;
  guidanceGroupId?: string;
  guidanceText?: string;
  tags?: string;
};

type AddGuidanceTextErrors = {
  general?: string;
  guidanceGroupId?: string;
  guidanceText?: string;
  tags?: string;
};

type PublishGuidanceGroupErrors = {
  general?: string;
  affiliationId?: string;
  bestPractice?: string;
  name?: string;
  description?: string;
};

interface GuidanceText {
  id: string;
  guidanceText: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  url: string;
  tags: GuidanceTag[];
}

interface TagGuidanceItem {
  tag: TagsInterface;
  guidance: GuidanceText | null;
}

interface GuidanceGroup {
  guidanceGroupId: number;
  name: string;
  description: string;
  optionalSubset: boolean;
  bestPractice?: boolean;
  status: string;
  lastPublishedDate: string;
}


const GuidanceGroupIndexPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const toastState = useToast();
  const formatDate = useFormatDate();

  const groupId = String(params.groupId);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [guidanceGroup, setGuidanceGroup] = useState<GuidanceGroup>();
  const [guidanceTexts, setGuidanceTexts] = useState<GuidanceText[]>([]);
  const [tagGuidanceList, setTagGuidanceList] = useState<TagGuidanceItem[]>([]);
  const [savingGuidanceId, setSavingGuidanceId] = useState<string | null>(null);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GROUP_EDIT_URL = routePath("admin.guidance.groups.edit", { groupId });

  // Query for all tags
  const { data: tagsData, loading: tagsLoading } = useTagsQuery();

  // Run me query to get user's name
  const { data: me } = useMeQuery();

  // Fetch guidance group data
  const { data: guidanceGroupData } = useGuidanceGroupQuery({
    variables: {
      guidanceGroupId: Number(groupId)
    },
    fetchPolicy: "network-only",
  });

  // Fetch Guidance Texts by Group Id
  const { data: guidance, refetch: refetchGuidance, loading: guidanceLoading } = useGuidanceByGroupQuery({
    variables: {
      guidanceGroupId: Number(groupId)
    },
    fetchPolicy: "cache-and-network", // Show cached data first, then update with fresh data
  });

  // Handler to update guidance text in state
  const handleGuidanceTextChange = (tagId: number, newText: string) => {
    setTagGuidanceList(prevList =>
      prevList.map(item => {
        if (item.tag.id === tagId) {
          if (item.guidance) {
            // Update existing guidance
            return { ...item, guidance: { ...item.guidance, guidanceText: newText } };
          } else {
            // Create temporary guidance object for tags without existing guidance
            return {
              ...item,
              guidance: {
                id: `temp-${tagId}`,
                guidanceText: newText,
                lastUpdated: '',
                lastUpdatedBy: '',
                url: '',
                tags: [{ id: tagId, name: item.tag.name }],
              }
            };
          }
        }
        return item;
      })
    );
  };

  const handlePublish = useCallback(async () => {
    setErrorMessages([]);

    if (guidanceGroup?.guidanceGroupId === undefined) {
      setErrorMessages(['Guidance Group ID is undefined']);
      return;
    }

    const response = await publishGuidanceGroupAction({
      guidanceGroupId: guidanceGroup.guidanceGroupId
    });

    if (response.redirect) {
      router.push(response.redirect);
      return;
    }

    if (!response.success) {
      setErrorMessages(
        response.errors?.length ? response.errors : [Global("messaging.somethingWentWrong")]
      )
      logECS("error", "publishing Guidance Group", {
        errors: response.errors,
        url: { path: routePath("admin.guidance.groups.create") },
      });
      return;
    } else {
      if (response?.data?.errors) {
        const errs = extractErrors<PublishGuidanceGroupErrors>(response?.data?.errors, ["general", "affiliationId", "bestPractice", "name", "description"]);

        if (errs.length > 0) {
          setErrorMessages(errs);
          logECS("error", "publishing Guidance Group", {
            errors: errs,
            url: { path: routePath("admin.guidance.groups.create") },
          });
        } else {
          const successMessage = t("messages.success.guidanceGroupPublished", { groupName: guidanceGroup?.name });
          toastState.add(successMessage, { type: "success" });
          router.push(routePath("admin.guidance.index"));
        }
      }
    }
  }, [guidanceGroup, Global, router]);

  // Handler to update guidance or add new one based on the tagId
  const handleSaveGuidance = async (tagId: number) => {
    setErrorMessages([]);

    // Find the guidance based on the tagId
    const tagItem = tagGuidanceList.find(item => item.tag.id === tagId);

    // If none exists then return
    if (!tagItem) {
      return;
    }

    // Get the text to save from the guidance object
    const textToSave = tagItem.guidance?.guidanceText ?? "";

    // Don't save if there's no text
    if (!textToSave.trim()) {
      alert("Please enter guidance text before saving.");
      return;
    }

    // Use a temporary ID for new guidance that's being saved
    const savingId = tagItem.guidance?.id ?? `new-${tagId}`;
    setSavingGuidanceId(savingId);

    // Check if this is a real guidance (has a numeric ID) or a temporary one
    const isExistingGuidance = tagItem.guidance && !tagItem.guidance.id.startsWith('temp-');

    // If guidance exists, update it; otherwise, create new guidance
    if (isExistingGuidance && tagItem.guidance) {
      // Don't need a try-catch block here, as the error is handled in the action
      const response = await updateGuidanceAction({
        guidanceId: parseInt(tagItem.guidance.id, 10),
        guidanceText: textToSave,
        tags: tagItem.guidance.tags.map(tag => ({
          id: tag.id,
          name: tag.name,
        })),
      });

      if (response.redirect) {
        router.push(response.redirect);
        return;
      }

      if (!response.success) {
        setErrorMessages(
          response.errors?.length ? response.errors : [Global("messaging.somethingWentWrong")]
        )
        logECS("error", "updating Guidance text", {
          errors: response.errors,
          url: { path: routePath("admin.guidance.groups.index", { groupId }) },
        });
        return;
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
        const successMessage = t("messages.success.guidanceTextUpdated", { tagName: tagItem.tag.name });
        toastState.add(successMessage, { type: "success" });
      }
    } else {
      // Create new guidance since none exists for this tag
      // Don't need a try-catch block here, as the error is handled in the action
      const response = await addGuidanceTextAction({
        guidanceGroupId: Number(groupId),
        guidanceText: textToSave,
        tags: [{
          id: tagId,
          name: tagItem.tag.name,
        }],
      });

      if (response.redirect) {
        router.push(response.redirect);
        return;
      }

      if (!response.success) {
        setErrorMessages(
          response.errors?.length ? response.errors : [Global("messaging.somethingWentWrong")]
        )
        logECS("error", "adding Guidance text", {
          errors: response.errors,
          url: { path: routePath("admin.guidance.groups.index", { groupId }) },
        });
        return;
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
        // Optimistically update the local state to reflect the new guidance
        const newGuidanceId = String((response as any)?.data?.id);
        if (newGuidanceId) {
          const newGuidance: GuidanceText = {
            id: newGuidanceId,
            guidanceText: textToSave,
            lastUpdated: '',
            lastUpdatedBy: `${me?.me?.givenName || ""} ${me?.me?.surName || ""}`.trim(),
            url: routePath("admin.guidance.groups.texts.edit", { groupId, textId: Number(newGuidanceId) }),
            tags: [{ id: tagId, name: tagItem.tag.name }],
          };

          // Update guidanceTexts array
          setGuidanceTexts(prev => [...prev, newGuidance]);

          // Update tagGuidanceList to link the new guidance to this tag
          setTagGuidanceList(prev =>
            prev.map(item =>
              item.tag.id === tagId
                ? { ...item, guidance: newGuidance }
                : item
            )
          );
        }

        // Refetch from server to ensure we have the latest data
        refetchGuidance().catch(err => {
          // Non-critical: log but don't block the UI
          console.error("Failed to refetch guidance after adding:", err);
        });

        const successMessage = t("messages.success.guidanceTextAdded", { tagName: tagItem.tag.name });
        toastState.add(successMessage, { type: "success" });
      }

    }
    setSavingGuidanceId(null);
  };

  // Set Guidance Texts data in state when fetched
  useEffect(() => {
    if (guidance && guidance.guidanceByGroup.length > 0) {
      const transformedGuidanceTexts = guidance.guidanceByGroup.map((g) => ({
        id: String(g.id),
        guidanceText: g.guidanceText || "",
        lastUpdated: g.modified ? formatDate(g.modified) : "",
        lastUpdatedBy: `${g.user?.givenName} ${g.user?.surName}`,
        url: routePath("admin.guidance.groups.texts.edit", { groupId, textId: Number(g.id) }),
        tags: g.tags?.filter(tag => tag.id !== null).map(tag => ({ id: tag.id!, name: tag.name })) || [],
      }));

      setGuidanceTexts(transformedGuidanceTexts);
    }
  }, [guidance]);

  // Build the tag-guidance mapping whenever tags or guidance data changes
  useEffect(() => {
    if (tagsData?.tags && guidanceTexts) {
      // Only include tags that have a valid numeric id to avoid runtime/type errors downstream
      const validTags = tagsData.tags.filter((tag) => typeof tag.id === 'number');

      const tagGuidanceMap: TagGuidanceItem[] = validTags.map(tag => {
        // Find the guidance that has this tag
        const matchingGuidance = guidanceTexts.find(guidance =>
          guidance.tags.some(t => t.id === (tag.id as number))
        );

        return {
          tag: {
            id: tag.id as number,
            name: tag.name,
            description: tag.description || undefined,
          },
          guidance: matchingGuidance || null,
        };
      });

      setTagGuidanceList(tagGuidanceMap);
    }
  }, [tagsData, guidanceTexts]);


  useEffect(() => {
    // Set Guidance Group data in state when fetched. We need this for publishing the group
    if (guidanceGroupData && guidanceGroupData.guidanceGroup) {

      console.log("guidanceGroupData:", guidanceGroupData);
      const transformedGuidanceGroup: GuidanceGroup = {
        guidanceGroupId: Number(guidanceGroupData.guidanceGroup?.id),
        name: guidanceGroupData.guidanceGroup.name || 'Untitled Guidance Group',
        description: guidanceGroupData.guidanceGroup.description || '',
        optionalSubset: guidanceGroupData.guidanceGroup.optionalSubset || false,
        bestPractice: guidanceGroupData.guidanceGroup.bestPractice || false,
        status: guidanceGroupData.guidanceGroup.latestPublishedDate ? t('status.published') : t('status.draft'),
        lastPublishedDate: guidanceGroupData.guidanceGroup.latestPublishedDate ? formatDate(guidanceGroupData.guidanceGroup.latestPublishedDate) : '',
      }

      setGuidanceGroup(transformedGuidanceGroup);
    };
  }, [guidanceGroupData]);

  return (
    <>
      <PageHeader
        title={t("pages.groupIndex.title", { groupName: guidanceGroup?.name || "" })}
        description={t("pages.groupIndex.description")}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href={routePath("admin.guidance.index")}>{t("breadcrumbs.guidanceGroups")}</Link>
            </Breadcrumb>
            <Breadcrumb>{t("breadcrumbs.group")}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link
              href={GROUP_EDIT_URL}
              className={`react-aria-Button--link ${styles.editGroupButton}`}
            >
              {t("pages.groupIndex.editGroup")}
            </Link>
          </>
        }
        className="page-guidance-group-index"
      />

      <ErrorMessages ref={errorRef} errors={errorMessages} />

      <LayoutWithPanel>
        <ContentContainer>
          {tagsLoading || guidanceLoading ? (
            <Loading />
          ) : (
            <Card data-testid='guidance-card'>
              {tagGuidanceList
                .filter((it) => typeof it.tag.id === 'number')
                .map((item) => {
                  const tagId = item.tag.id as number;
                  return (
                    <div
                      key={tagId}
                      className={styles.guidanceListCard}
                    >

                      <div className={styles.tagWrapper}>
                        <h3 id={`contentLabel-${item.tag.id}`}>
                          {item.tag.name}
                        </h3>
                        <DialogTrigger>
                          <Button className="popover-btn" aria-label="Click for more info"><div className="icon info"><DmpIcon icon="info" /></div></Button>
                          <Popover>
                            <OverlayArrow>
                              <svg width={12} height={12} viewBox="0 0 12 12">
                                <path d="M0 0 L6 6 L12 0" />
                              </svg>
                            </OverlayArrow>
                            <Dialog>
                              <div className="flex-col">
                                {stripHtmlTags(item.tag.description)}
                              </div>
                            </Dialog>
                          </Popover>
                        </DialogTrigger>
                      </div>


                      <div>
                        <TinyMCEEditor
                          content={item.guidance?.guidanceText ?? ""}
                          setContent={(value) => handleGuidanceTextChange(tagId, value)}
                          id={`content-${tagId}`}
                          labelId={`contentLabel-${tagId}`}
                        />
                      </div>

                      <div className={styles.buttonWrapper}>
                        <Button
                          onPress={() => handleSaveGuidance(tagId)}
                          isDisabled={savingGuidanceId === item.guidance?.id || savingGuidanceId === `new-${tagId}`}
                          className="button--primary"
                        >
                          {(savingGuidanceId === item.guidance?.id || savingGuidanceId === `new-${tagId}`)
                            ? Global("buttons.saving") || "Saving..."
                            : Global("buttons.save") || "Save"}
                        </Button>
                      </div>
                    </div>
                  )
                })}

              {tagGuidanceList.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p>{t("pages.groupIndex.noTags") || "No tags available."}</p>
                </div>
              )}
            </Card>
          )}
        </ContentContainer>
        <SidebarPanel>
          <div className={`statusPanelContent sidePanel`}>
            <div className="{`buttonContainer withBorder  mb-5`}">
              <Button
                className={styles.publishButton}
                onPress={handlePublish}
              >
                {Global("buttons.publish")}
              </Button>
            </div>
            <div className="sidePanelContent">
              <div className={`panelRow mb-5`}>
                <div>
                  <h3>{t('status.publicationStatus')}</h3>
                  <p>{guidanceGroup?.status}</p>
                </div>
              </div>
            </div>

            <div className={`panelRow mb-5`}>
              <div>
                <h3>Last Published</h3>
                <p>{guidanceGroup?.lastPublishedDate || "Not yet published"}</p>
              </div>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel >
    </>
  );
};

export default GuidanceGroupIndexPage;
