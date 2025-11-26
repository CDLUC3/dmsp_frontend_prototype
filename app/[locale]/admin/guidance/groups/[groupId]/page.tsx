"use client";

import React, { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  DialogTrigger,
  Label,
  Link,
  OverlayArrow,
  Popover,
} from "react-aria-components";
import { useParams } from "next/navigation";

// GraphQL
import {
  useMeQuery,
  useAddGuidanceMutation,
  useGuidanceByGroupQuery,
  useUpdateGuidanceMutation,
  useTagsQuery
} from '@/generated/graphql';

// Components
import PageHeader from "@/components/PageHeader";
import { Card, } from "@/components/Card/card";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { DmpIcon } from "@/components/Icons";

import DashboardListItem from "@/components/DashboardListItem";
import { ContentContainer, LayoutWithPanel, SidebarPanel } from "@/components/Container";
import { stripHtmlTags } from '@/utils/general';
import { routePath } from "@/utils/routes";
import styles from "./guidanceGroupIndex.module.scss";
import parentStyles from "../../guidance.module.scss";

// Types for guidance texts
interface GuidanceTag {
  id: number;
  name: string;
}

interface GuidanceText {
  id: string;
  guidanceText: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  url: string;
  tags: GuidanceTag[];
}

interface Tag {
  id: number;
  name: string;
  description?: string;
}

interface TagGuidanceItem {
  tag: Tag;
  guidance: GuidanceText | null;
}

interface GuidanceGroup {
  id: string;
  description: string;
}

const GuidanceGroupIndexPage: React.FC = () => {
  const params = useParams();
  const groupId = String(params.groupId);
  const formatter = useFormatter();

  const [guidanceTexts, setGuidanceTexts] = useState<GuidanceText[]>([]);
  const [guidanceGroup, setGuidanceGroup] = useState<GuidanceGroup | null>(null);
  const [tagGuidanceList, setTagGuidanceList] = useState<TagGuidanceItem[]>([]);
  const [savingGuidanceId, setSavingGuidanceId] = useState<string | null>(null);
  // Track text changes for tags that don't have guidance yet
  const [pendingTextChanges, setPendingTextChanges] = useState<Map<number, string>>(new Map());

  // For translations
  const t = useTranslations("Guidance");
  const Global = useTranslations("Global");

  // Set URLs
  const GROUP_EDIT_URL = routePath("admin.guidance.groups.edit", { groupId });
  const TEXT_CREATE_URL = routePath("admin.guidance.groups.texts.create", { groupId });

  // Query for all tags
  const { data: tagsData } = useTagsQuery();

  // Run me query to get user's name
  const { data: me } = useMeQuery();

  console.log("Me data:", me);
  // Fetch Guidance Texts by Group Id
  const { data: guidance } = useGuidanceByGroupQuery({
    variables: {
      guidanceGroupId: parseInt(groupId, 10)
    },
    fetchPolicy: "cache-and-network", // Show cached data first, then update with fresh data
  });

  console.log("GuidanceByGroup data:", guidance);
  // Mutation for updating guidance
  const [updateGuidanceMutation] = useUpdateGuidanceMutation();

  // Mutation for adding new guidance
  const [addGuidanceMutation] = useAddGuidanceMutation();

  const formatDate = (date: string | number) => {
    const parsedDate = typeof date === "number" ? new Date(date) : new Date(date.replace(/-/g, "/")); // Replace dashes with slashes for compatibility

    if (isNaN(parsedDate.getTime())) {
      return "Invalid Date"; // Handle invalid input gracefully
    }

    return formatter.dateTime(parsedDate, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handler to update guidance text in state
  const handleGuidanceTextChange = (tagId: number, newText: string) => {
    setTagGuidanceList(prevList =>
      prevList.map(item =>
        item.tag.id === tagId && item.guidance
          ? { ...item, guidance: { ...item.guidance, guidanceText: newText } }
          : item
      )
    );

    // Also track changes for tags without existing guidance
    setPendingTextChanges(prev => {
      const newMap = new Map(prev);
      newMap.set(tagId, newText);
      return newMap;
    });
  };

  // Handler to save individual guidance
  const handleSaveGuidance = async (tagId: number) => {
    const tagItem = tagGuidanceList.find(item => item.tag.id === tagId);
    if (!tagItem) {
      console.error("Tag item not found for tagId:", tagId);
      return;
    }

    // Determine the text to save (from existing guidance or pending changes)
    const textToSave = tagItem.guidance?.guidanceText ?? pendingTextChanges.get(tagId) ?? "";

    console.log("Save attempt for tag:", tagItem.tag.name, "tagId:", tagId);
    console.log("Text to save:", textToSave);
    console.log("Has existing guidance:", !!tagItem.guidance);
    console.log("Pending changes:", pendingTextChanges);

    // Don't save if there's no text
    if (!textToSave.trim()) {
      alert("Please enter guidance text before saving.");
      return;
    }

    // Use a temporary ID for new guidance that's being saved
    const savingId = tagItem.guidance?.id ?? `new-${tagId}`;
    setSavingGuidanceId(savingId);

    try {
      if (tagItem.guidance) {
        // Update existing guidance
        console.log("Updating existing guidance with input:", {
          guidanceId: parseInt(tagItem.guidance.id, 10),
          guidanceText: textToSave,
          tags: tagItem.guidance.tags,
        });

        const result = await updateGuidanceMutation({
          variables: {
            input: {
              guidanceId: parseInt(tagItem.guidance.id, 10),
              guidanceText: textToSave,
              tags: tagItem.guidance.tags.map(tag => ({
                id: tag.id,
                name: tag.name,
              })),
            },
          },
        });

        // Check if there are actual error messages (not just null values)
        const errors = result.data?.updateGuidance?.errors;
        const hasActualErrors = errors && (
          errors.general ||
          errors.guidanceGroupId ||
          errors.guidanceText ||
          errors.tags
        );

        if (hasActualErrors) {
          console.error("Error updating guidance:", errors);
          alert(`Error saving guidance: ${errors.general || 'Unknown error'}`);
        } else {
          console.log("Guidance updated successfully:", result.data?.updateGuidance);
          alert("Guidance saved successfully!");
        }
      } else {
        // Create new guidance
        const inputData = {
          guidanceGroupId: parseInt(groupId, 10),
          guidanceText: textToSave,
          tags: [{
            id: tagId,
            name: tagItem.tag.name,
          }],
        };

        console.log("Creating new guidance with input:", inputData);
        console.log("GroupId (string):", groupId, "Parsed:", parseInt(groupId, 10));

        const result = await addGuidanceMutation({
          variables: {
            input: inputData,
          },
          // Refetch the guidance list after adding
          refetchQueries: ['GuidanceByGroup'],
        });

        console.log("Add guidance result:", result);

        // Check if there are actual error messages (not just null values)
        const errors = result.data?.addGuidance?.errors;
        const hasActualErrors = errors && (
          errors.general ||
          errors.guidanceGroupId ||
          errors.guidanceText ||
          errors.tags
        );

        if (hasActualErrors) {
          console.error("Error creating guidance:", errors);
          console.error("Full error object:", JSON.stringify(errors, null, 2));
          alert(`Error creating guidance: ${errors.general || 'Unknown error'}`);
        } else {
          console.log("Guidance created successfully:", result.data?.addGuidance);
          alert("Guidance created successfully!");
          // Clear the pending change for this tag
          setPendingTextChanges(prev => {
            const newMap = new Map(prev);
            newMap.delete(tagId);
            return newMap;
          });
        }
      }
    } catch (error) {
      console.error("Error saving guidance:", error);
      console.error("Full error:", JSON.stringify(error, null, 2));
      alert("An error occurred while saving guidance.");
    } finally {
      setSavingGuidanceId(null);
    }
  };

  useEffect(() => {
    if (guidance && guidance.guidanceByGroup.length > 0) {
      const transformedGuidanceTexts = guidance.guidanceByGroup.map((g) => ({
        id: String(g.id),
        guidanceText: g.guidanceText || "",
        lastUpdated: g.modified ? formatDate(g.modified) : "",
        lastUpdatedBy: `${g.user?.givenName} ${g.user?.surName}`,
        url: routePath("admin.guidance.groups.texts.edit", { groupId, guidanceId: Number(g.id) }),
        tags: g.tags?.filter(tag => tag.id !== null).map(tag => ({ id: tag.id!, name: tag.name })) || [],
      }));

      console.log("Transformed Guidance Texts:", transformedGuidanceTexts);
      setGuidanceTexts(transformedGuidanceTexts);
    }
  }, [guidance]);

  // Build the tag-guidance mapping whenever tags or guidance data changes
  useEffect(() => {
    if (tagsData?.tags && guidanceTexts) {
      const tagGuidanceMap: TagGuidanceItem[] = tagsData.tags.map(tag => {
        // Find the guidance that has this tag
        const matchingGuidance = guidanceTexts.find(guidance =>
          guidance.tags.some(t => t.id === tag.id)
        );

        return {
          tag: {
            id: tag.id!,
            name: tag.name,
            description: tag.description || undefined,
          },
          guidance: matchingGuidance || null,
        };
      });

      console.log("Tag-Guidance Map:", tagGuidanceMap);
      setTagGuidanceList(tagGuidanceMap);
    }
  }, [tagsData, guidanceTexts]);


  return (
    <>
      <PageHeader
        title={t("pages.groupIndex.title", { orgName: me?.me?.affiliation?.name || "" })}
        description={guidanceGroup?.description || t("pages.groupIndex.description")}
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
            <Link
              href={TEXT_CREATE_URL}
              className="button-link button--primary"
            >
              {t("pages.groupIndex.createText")}
            </Link>
          </>
        }
        className="page-guidance-group-index"
      />

      <LayoutWithPanel>
        <ContentContainer>
          <Card data-testid='guidance-card'>
            {tagGuidanceList.map((item, index) => (
              <div
                key={item.tag.id}
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
                    content={item.guidance?.guidanceText ?? pendingTextChanges.get(item.tag.id) ?? ""}
                    setContent={(value) => handleGuidanceTextChange(item.tag.id, value)}
                    id={`content-${item.tag.id}`}
                    labelId={`contentLabel-${item.tag.id}`}
                  />
                </div>

                <div className={styles.buttonWrapper}>
                  <Button
                    onPress={() => handleSaveGuidance(item.tag.id)}
                    isDisabled={savingGuidanceId === item.guidance?.id || savingGuidanceId === `new-${item.tag.id}`}
                    className="button--primary"
                  >
                    {(savingGuidanceId === item.guidance?.id || savingGuidanceId === `new-${item.tag.id}`)
                      ? Global("buttons.saving") || "Saving..."
                      : Global("buttons.save") || "Save"}
                  </Button>
                </div>
              </div>
            ))}

            {tagGuidanceList.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>{t("pages.groupIndex.noTags") || "No tags available."}</p>
              </div>
            )}
          </Card>
        </ContentContainer>
        <SidebarPanel>
          <div className={`statusPanelContent sidePanel`}>
            <div className="{`buttonContainer withBorder  mb-5`}">
              <Button
                className={styles.publishButton}
                onPress={() => console.log("Publish clicked")}
              >
                {Global("buttons.publish")}
              </Button>
            </div>
            <div className="sidePanelContent">
              <div className={`panelRow mb-5`}>
                <div>
                  <h3>Publication Status</h3>
                  <p>Published</p>
                </div>
              </div>
            </div>

            <div className={`panelRow mb-5`}>
              <div>
                <h3>Last Published</h3>
                <p>Not yet published</p>
              </div>
            </div>
          </div>
        </SidebarPanel>
      </LayoutWithPanel >
    </>
  );
};

export default GuidanceGroupIndexPage;
