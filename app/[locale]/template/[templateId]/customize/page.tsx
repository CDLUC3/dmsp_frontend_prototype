"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Dialog,
  FieldError,
  Form,
  Heading,
  Label,
  Link,
  Modal,
  Radio,
  RadioGroup,
  Text,
  TextArea,
  TextField,
} from "react-aria-components";

// GraphQL
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Section,
  TemplateVersionType,
  TemplateVisibility,
  ArchiveTemplateDocument,
  CreateTemplateVersionDocument,
  TemplateDocument,
} from "@/generated/graphql";
import { updateTemplateAction, updateSectionDisplayOrderAction } from "./actions";

// Components
import PageHeaderWithTitleChange from "@/components/PageHeaderWithTitleChange";
import AddSectionButton from "@/components/AddSectionButton";
import ErrorMessages from "@/components/ErrorMessages";
import SectionEditContainer from "@/components/SectionEditContainer";

// Hooks
import { useFormatDate } from "@/hooks/useFormatDate";

// Utils and other
import logECS from "@/utils/clientLogger";
import { useToast } from "@/context/ToastContext";
import { routePath } from "@/utils/routes";
import { extractErrors } from "@/utils/errorHandler";
import styles from "./customizeTemplate.module.scss";
interface TemplateInfoInterface {
  templateId: number | null;
  name: string;
}

type UpdateTemplateErrors = {
  general?: string;
  name?: string;
  description?: string;
};

const TemplateCustomizePage: React.FC = () => {
  const formatDate = useFormatDate();

  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const toastState = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [templateInfo, setTemplateInfoState] = useState<TemplateInfoInterface>({
    templateId: null,
    name: "",
  });
  //Track local section order - using optimistic rendering
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  // Added for accessibility
  const [announcement, setAnnouncement] = useState("");

  // localization keys
  const BreadCrumbs = useTranslations("Breadcrumbs");
  const EditTemplate = useTranslations("EditTemplates");
  const PublishTemplate = useTranslations("PublishTemplate");
  const Messaging = useTranslations("Messaging");
  const Global = useTranslations("Global");

  // Used to set the translated visibility text, based on the
  // public/private choice.
  const [visibilityText, setVisibilityText] = useState<string>("");

  // Get templateId param
  const params = useParams();
  const router = useRouter();
  //const { templateId } = params; // From route /template/:templateId
  const templateId = String(params.templateId);

  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Initialize publish mutation
  const [createTemplateVersionMutation] = useMutation(CreateTemplateVersionDocument);
  const [archiveTemplateMutation] = useMutation(ArchiveTemplateDocument);

  // Run template query to get all templates under the given templateIdx
  const {
    data,
    loading,
    error: templateQueryErrors,
    refetch,
  } = useQuery(TemplateDocument, {
    variables: { templateId: Number(templateId) },
  });

  const sortSections = (sections: Section[]) => {
    // Create a new array with the spread operator before sorting
    return [...sections].sort((a, b) => a.displayOrder! - b.displayOrder!);
  };

  const showSuccessToast = () => {
    const successMessage = Messaging("successfullyUpdated");
    toastState.add(successMessage, { type: "success" });
  };

  const showSuccessArchiveToast = () => {
    const successMessage = EditTemplate("messages.successfullyArchived");
    toastState.add(successMessage, { type: "success" });
  };

  const handleArchiveTemplate = async () => {
    try {
      const response = await archiveTemplateMutation({
        variables: {
          templateId: Number(templateId),
        },
      });

      const responseErrors = response.data?.archiveTemplate?.errors;
      if (responseErrors && typeof responseErrors.general === "string") {
        if (responseErrors.general) {
          const message = responseErrors.general;
          setErrorMessages((prev) => [...prev, message]);
        }
      } else {
        showSuccessArchiveToast();
        router.push(routePath("template.show", { templateId }));
      }
    } catch (err) {
      setErrorMessages((prevErrors) => [...prevErrors, EditTemplate("errors.archiveTemplateError")]);
      logECS("error", "handleArchiveTemplate", {
        error: err,
        url: { path: "/template/[templateId]" },
      });
    }
  };

  // Save either 'DRAFT' or 'PUBLISHED' based on versionType passed into function
  const saveTemplate = async (
    versionType: TemplateVersionType,
    comment: string | undefined,
    latestPublishVisibility: TemplateVisibility,
  ) => {
    setErrorMessages([]); // Clear previous errors

    if (!latestPublishVisibility) {
      setErrorMessages([EditTemplate("errors.saveTemplateError")]);
      return;
    }

    try {
      const response = await createTemplateVersionMutation({
        variables: {
          templateId: Number(templateId),
          comment: comment?.length ? comment : null,
          versionType,
          latestPublishVisibility,
        },
      });

      const result = response?.data?.createTemplateVersion;

      if (!result) {
        setErrorMessages([EditTemplate("errors.saveTemplateError")]);
        return;
      }

      if (result.errors?.general) {
        setErrorMessages([result.errors.general]);
        return;
      }

      // Success: Close modal and show toast
      setPublishModalOpen(false);
      showSuccessToast();
      await refetch();
    } catch (err) {
      setErrorMessages([EditTemplate("errors.saveTemplateError")]);

      logECS("error", "saveTemplate", {
        error: err,
        url: { path: "/template/[templateId]" },
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the selected radio button value, and make it upper case to match TemplateVisibility enum values
    const latestPublishVisibility = formData.get("visibility")?.toString().toUpperCase() as TemplateVisibility;
    const changeLog = formData.get("change_log")?.toString();

    await saveTemplate(TemplateVersionType.Published, changeLog, latestPublishVisibility);
  };

  const handlePressPublishTemplate = () => {
    setPublishModalOpen(true);
  };

  // Call Server Action updateTemplateAction
  const updateTemplate = async (templateInfo: TemplateInfoInterface) => {
    if (templateInfo.templateId === null) {
      // Handle the case where templateId is null (e.g., log an error or return early)
      logECS("error", "updateTemplate", {
        error: "templateId is null",
        url: {
          path: routePath("template.show", { templateId: "unknown" }),
        },
      });
      return {
        success: false,
        errors: [EditTemplate("errors.updateTemplateError")],
        data: null,
      };
    }

    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await updateTemplateAction({
      templateId: templateInfo.templateId,
      name: templateInfo.name,
    });

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    };
  };

  const handleTitleChange = async (newTitle: string) => {
    const result = await updateTemplate({
      ...templateInfo,
      name: newTitle,
    });

    if (!result.success) {
      setErrorMessages([EditTemplate("errors.updateTitleError")]);
    } else {
      if (result.data?.errors) {
        // Handle errors as an object with general or field-level errors
        const errs = extractErrors<UpdateTemplateErrors>(result?.data?.errors, ["general", "name", "description"]);
        if (errs.length > 0) {
          setErrorMessages(errs);
          return;
        }
        setTemplateInfoState({
          ...templateInfo,
          name: newTitle,
        });

        const successMessage = EditTemplate("messages.successfullyUpdatedTitle");
        toastState.add(successMessage, { type: "success" });
      }
    }
  };

  function handleVisibilityChange(value: string) {
    if (value == "public") {
      setVisibilityText(PublishTemplate("bullet.publishingTemplate3"));
    } else if (value == "organization") {
      setVisibilityText(PublishTemplate("bullet.publishingTemplate3Private"));
    }
  }

  // Call Server Action updateSectionDisplayOrderAction
  const updateSectionDisplayOrder = async (sectionId: number, newDisplayOrder: number) => {
    if (!sectionId) {
      logECS("error", "updateSectionDisplayOrder", {
        error: "No sectionId",
        url: {
          path: routePath("template.show", { templateId }),
        },
      });
      return {
        success: false,
        errors: [EditTemplate("errors.updateDisplayOrderError")],
        data: null,
      };
    }

    // Don't need a try-catch block here, as the error is handled in the server action
    const response = await updateSectionDisplayOrderAction({
      sectionId,
      newDisplayOrder,
    });

    if (response.redirect) {
      router.push(response.redirect);
    }

    return {
      success: response.success,
      errors: response.errors,
      data: response.data,
    };
  };

  // Optimistic update function
  const updateLocalSectionOrder = (sectionId: number, newDisplayOrder: number) => {
    setLocalSections((prevSections) => {
      const oldSections = [...prevSections];
      const movedSection = oldSections.find((s) => s.id === sectionId);
      if (!movedSection || movedSection.displayOrder == null) return prevSections;

      const oldOrder = movedSection.displayOrder;

      const updatedSections = oldSections.map((section) => {
        if (section.id === sectionId) {
          // The moved section gets the new displayOrder
          return { ...section, displayOrder: newDisplayOrder };
        }

        if (section.displayOrder == null) return section;

        // Shift other sections' displayOrders based on direction
        if (newDisplayOrder > oldOrder) {
          // Moving down: shift up sections in between
          if (section.displayOrder > oldOrder && section.displayOrder <= newDisplayOrder) {
            return { ...section, displayOrder: section.displayOrder - 1 };
          }
        } else if (newDisplayOrder < oldOrder) {
          // Moving up: shift down sections in between
          if (section.displayOrder >= newDisplayOrder && section.displayOrder < oldOrder) {
            return { ...section, displayOrder: section.displayOrder + 1 };
          }
        }

        return section;
      });

      return sortSections(updatedSections);
    });
  };

  const validateSectionMove = (sectionId: number, newDisplayOrder: number): { isValid: boolean; message?: string } => {
    const currentSection = localSections.find((s) => s.id === sectionId);

    // If current section doesn't exist in localSections
    if (!currentSection || currentSection.displayOrder == null) {
      const errorMsg = EditTemplate("errors.updateDisplayOrderError");
      return { isValid: false, message: errorMsg };
    }

    // If new display order is zero
    const maxDisplayOrder = Math.max(...localSections.map((s) => s.displayOrder || 0));
    if (newDisplayOrder < 1) {
      const errorMsg = EditTemplate("errors.displayOrderAlreadyAtTop");
      return { isValid: false, message: errorMsg };
    }

    // If new display order exceeds max number of sections
    if (newDisplayOrder > maxDisplayOrder) {
      const errorMsg = EditTemplate("errors.cannotMoveFurtherDown");
      return { isValid: false, message: errorMsg };
    }

    // If new display order is same as current display order
    if (currentSection.displayOrder === newDisplayOrder) {
      const errorMsg = EditTemplate("errors.cannotMoveFurtherUpOrDown");
      return { isValid: false, message: errorMsg };
    }

    return { isValid: true };
  };

  const handleSectionMove = async (sectionId: number, newDisplayOrder: number) => {
    if (isReordering) return; // Prevent concurrent operations

    // Remove all current errors
    setErrorMessages([]);

    const { isValid, message } = validateSectionMove(sectionId, newDisplayOrder);
    if (!isValid && message) {
      // Deliver toast error messages
      toastState.add(message, { type: "error" });
      return;
    }

    // First, optimistically update the UI immediately for smoother reshuffling
    updateLocalSectionOrder(sectionId, newDisplayOrder);
    setIsReordering(true);

    const result = await updateSectionDisplayOrder(sectionId, newDisplayOrder);

    if (!result.success) {
      // Revert optimistic update on failure
      await refetch();
      const errors = result.errors;
      if (Array.isArray(errors)) {
        setErrorMessages((prev) => [...prev, ...errors]);
      }
    } else if (result.data?.errors?.general) {
      // Revert on server errors
      await refetch();
      setErrorMessages((prev) => [...prev, result.data?.errors?.general || ""]);
    }
    // After successful update

    // Scroll user to the reordered section
    const focusedElement = document.activeElement;

    // Check if an element is actually focused
    if (focusedElement) {
      // Scroll the focused element into view
      focusedElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
    // Set accessible announcement
    const accessibleMessage = EditTemplate("messages.sectionMoved", { displayOrder: newDisplayOrder });
    setAnnouncement(accessibleMessage);
    setIsReordering(false);
  };

  const getPublishStatusText = (isDirty: boolean, latestPublishDate: string | null | undefined) => {
    if (isDirty && latestPublishDate) {
      return Global("status.unpublishedChanges");
    } else if (!latestPublishDate) {
      return Global("status.draft");
    } else {
      return Global("status.published");
    }
  };

  // Need to set this info to update template title
  useEffect(() => {
    if (data?.template) {
      setTemplateInfoState({
        templateId: data.template.id ? Number(data.template.id) : null,
        name: data.template.name || "",
      });
    }

    if (data?.template?.sections) {
      const sorted = sortSections(data.template.sections.filter((section): section is Section => section !== null));
      setLocalSections(sorted);
    }
  }, [data]);

  if (loading) {
    return <div>{Global("messaging.loading")}...</div>;
  }

  if (templateQueryErrors) {
    return <div>{EditTemplate("errors.getTemplatesError")}</div>;
  }

  const template = data?.template;

  if (!template) {
    return <div>{EditTemplate("errors.noTemplateFound")}</div>;
  }

  // Format the latest publish date if it exists
  const formattedPublishDate = template.latestPublishDate ? formatDate(template.latestPublishDate) : null;

  // Use localSections instead of sortedSections in render
  const sectionsToRender =
    localSections.length > 0
      ? localSections
      : template.sections
        ? sortSections(template.sections.filter((section): section is Section => section !== null))
        : [];

  const description =
    `by ${template?.owner?.displayName}` +
    (template?.latestPublishVersion ? ` - ${Global("version")}: ${template.latestPublishVersion}` : "") +
    (formattedPublishDate ? ` - ${Global("lastUpdated")}: ${formattedPublishDate}` : "");

  return (
    <div>
      <PageHeaderWithTitleChange
        title={templateInfo.name}
        description={description}
        descriptionAppend={
          <>
            -{" "}
            <Link
              className={styles.templateHistoryLink}
              href={routePath("template.history", { templateId })}
            >
              {Global("links.viewHistory")}
            </Link>
          </>
        }
        linkText={EditTemplate("links.editTemplateTitle")}
        labelText={EditTemplate("templateTitleLabel")}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href="/">{BreadCrumbs("home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href="/template">{BreadCrumbs("templates")}</Link>
            </Breadcrumb>
            <Breadcrumb>{template.name}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
        onTitleChange={handleTitleChange}
      />

      <ErrorMessages
        errors={errorMessages}
        ref={errorRef}
      />

      <div className="template-editor-container">
        <div className="main-content">
          {sectionsToRender.length > 0 && (
            <div>
              {sectionsToRender
                .filter((section) => section.id != null)
                .map((section) => (
                  <SectionEditContainer
                    key={section.id}
                    sectionId={section.id as number}
                    displayOrder={section.displayOrder!}
                    templateId={templateId}
                    setErrorMessages={setErrorMessages}
                    onMoveUp={
                      section.displayOrder != null
                        ? () => handleSectionMove(section.id!, section.displayOrder! - 1)
                        : undefined
                    }
                    onMoveDown={
                      section.displayOrder != null
                        ? () => handleSectionMove(section.id!, section.displayOrder! + 1)
                        : undefined
                    }
                  />
                ))}
            </div>
          )}
          <AddSectionButton href={`/template/${templateId}/section/new`} />
        </div>
        <aside className="sidebar">
          <div className="status-panel-content side-panel">
            <div className="buttonContainer withBorder mb-5">
              <Button
                data-secondary
                className="secondary"
                onPress={() => saveTemplate(TemplateVersionType.Draft, "", TemplateVisibility.Organization)}
              >
                {EditTemplate("button.saveAsDraft")}
              </Button>
              <Button onPress={() => handlePressPublishTemplate()}>{EditTemplate("button.publishTemplate")}</Button>
            </div>

            <div className="side-panel-content">
              <div className="panelRow mb-5">
                <div>
                  <h3>{EditTemplate("button.previewTemplate")}</h3>
                </div>
                <Link
                  href="#"
                  onPress={() => console.log("Preview")}
                  className="side-panel-link"
                >
                  {Global('buttons.preview')}
                </Link>
              </div>

              {(template.isDirty && !template.latestPublishDate) && (
                <div className="panelRow mb-5">
                  <div>
                    <h3>{EditTemplate("button.publishTemplate")}</h3>
                    <p>{EditTemplate("draft")}</p>
                  </div>
                  <Link
                    href="#"
                    onPress={() => setPublishModalOpen(true)}
                    className="side-panel-link"
                  >
                    {EditTemplate("links.edit")}
                  </Link>
                </div>
              )}

              <div className="panelRow mb-5">
                <div>
                  <h3>{EditTemplate("heading.visibilitySettings")}</h3>
                  <p>{getPublishStatusText(template.isDirty, template?.latestPublishDate)}</p>
                </div>
                <Link
                  href="#"
                  onPress={() => setPublishModalOpen(true)}
                  className="side-panel-link"
                >
                  {EditTemplate("links.edit")}
                </Link>
              </div>

              <div className="panelRow mb-5">
                <div>
                  <h3>{EditTemplate("heading.feedbackAndCollaboration")}</h3>
                  <p>{EditTemplate("allowAccess")}</p>
                </div>
                <Link
                  href={`/template/${templateId}/access`}
                  className="side-panel-link"
                >
                  {EditTemplate("links.manageAccess")}
                </Link>
              </div>

              <div className="panelRow mb-5">
                <div>
                  <h3>{EditTemplate("heading.history")}</h3>
                </div>
                <Link
                  href={`/template/${templateId}/history`}
                  className="side-panel-link"
                >
                  {EditTemplate("links.templateHistory")}
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
      <div className="template-archive-container">
        <div className="main-content">
          <h2>{EditTemplate("heading.archiveTemplate")}</h2>
          <p>{EditTemplate("description.archiveTemplate")}</p>
          <Form>
            <Button
              className="my-3"
              data-tertiary
              data-testid="archive-template"
              onPress={handleArchiveTemplate}
            >
              {EditTemplate("button.archiveTemplate")}
            </Button>
          </Form>
        </div>
      </div>

      <Modal
        isDismissable
        onOpenChange={setPublishModalOpen}
        isOpen={isPublishModalOpen}
        data-testid="modal"
      >
        <Dialog>
          <div>
            <Form
              onSubmit={(e) => handleSubmit(e)}
              data-testid="publishForm"
            >
              <Heading slot="title">{PublishTemplate("heading.publish")}</Heading>

              <RadioGroup
                name="visibility"
                onChange={handleVisibilityChange}
                defaultValue={
                  template.latestPublishDate
                    ? template.latestPublishVisibility === "PUBLIC"
                      ? "public"
                      : template.latestPublishVisibility === "ORGANIZATION"
                        ? "organization"
                        : undefined
                    : undefined
                }
              >
                <Label>{PublishTemplate("heading.visibilitySettings")}</Label>
                <Text
                  slot="description"
                  className="help"
                >
                  {PublishTemplate("descPublishedTemplate")}
                </Text>
                <Radio
                  data-testid="visPublic"
                  value="public"
                  className={`${styles.radioBtn} react-aria-Radio`}
                >
                  <div>
                    <span>{PublishTemplate("radioBtn.public")}</span>
                    <p className="text-gray-600 text-sm">{PublishTemplate("radioBtn.publicHelpText")}</p>
                  </div>
                </Radio>
                <Radio
                  data-testid="visPrivate"
                  value="organization"
                  className={`${styles.radioBtn} react-aria-Radio`}
                >
                  <div>
                    <span>{PublishTemplate("radioBtn.organizationOnly")}</span>
                    <p className="text-gray-600 text-sm">{PublishTemplate("radioBtn.orgOnlyHelpText")}</p>
                  </div>
                </Radio>
              </RadioGroup>

              <p>
                <strong>{PublishTemplate("heading.publishingThisTemplate")}</strong>
              </p>

              <ul>
                <li>{PublishTemplate("bullet.publishingTemplate")}</li>
                <li>{PublishTemplate("bullet.publishingTemplate2")}</li>
                {visibilityText && <li data-testid="visText">{visibilityText}</li>}
              </ul>
              <div className="">
                <TextField
                  name="change_log"
                  isRequired
                >
                  <Label>{PublishTemplate("heading.changeLog")}</Label>
                  <Text
                    slot="description"
                    className="help"
                  >
                    {PublishTemplate("descChangeLog")}
                  </Text>
                  <TextArea
                    data-testid="changeLog"
                    style={{ height: "100px" }}
                  />
                  <FieldError />
                </TextField>
              </div>

              <div className="modal-actions">
                <div className="">
                  <Button
                    data-secondary
                    onPress={() => setPublishModalOpen(false)}
                  >
                    {PublishTemplate("button.close")}
                  </Button>
                </div>
                <div className="">
                  <Button type="submit">{PublishTemplate("button.saveAndPublish")}</Button>
                </div>
              </div>
            </Form>
          </div>
        </Dialog>
      </Modal>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="hidden-accessibly"
      >
        {announcement}
      </div>
    </div>
  );
};

export default TemplateCustomizePage;
