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
  CustomizableObjectOwnership,
  MoveCustomSectionDocument,
  SectionCustomizationOverview,
  PublishTemplateCustomizationDocument,
  TemplateCustomizationOverviewDocument,
} from "@/generated/graphql";

// Components
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import AddSectionButton from "@/components/AddSectionButton";
import ErrorMessages from "@/components/ErrorMessages";
import CustomizedSectionEdit from "@/components/CustomizedTemplate/CustomizedSectionEdit";
// Hooks
import { useFormatDate } from "@/hooks/useFormatDate";

import { useTemplateStatus } from "../../hooks/useTemplateStatus";

// Utils and other
import logECS from "@/utils/clientLogger";
import { useToast } from "@/context/ToastContext";
import styles from "./templateCustomizationOverview.module.scss";

const TemplateCustomizationOverview: React.FC = () => {
  const formatDate = useFormatDate();

  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const toastState = useToast();

  // Template status hook
  const { getPublishStatusText } = useTemplateStatus();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

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

  //Track local section order - using optimistic rendering
  const [localSections, setLocalSections] = useState<SectionCustomizationOverview[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  // Get templateId param
  const params = useParams();
  const router = useRouter();
  //const { templateId } = params; // From route /template/:templateId
  const templateCustomizationId = String(params.templateCustomizationId); // From route /template/customizations/:templateCustomizationId

  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Run template query to get all templates under the given templateIdx
  const {
    data,
    loading,
    error: templateQueryErrors,
    refetch
  } = useQuery(TemplateCustomizationOverviewDocument, {
    variables: { templateCustomizationId: Number(templateCustomizationId) },
  });

  console.log("***Template Customization Data from query", data);

  const [publishTemplateCustomization] = useMutation(PublishTemplateCustomizationDocument);
  const [moveCustomSectionMutation] = useMutation(MoveCustomSectionDocument);

  const showSuccessToast = () => {
    const successMessage = Messaging("successfullyUpdated");
    toastState.add(successMessage, { type: "success" });
  };

  // Optimistic update function
  const updateLocalSectionOrder = (sectionId: number, direction: 'up' | 'down') => {
    setLocalSections(prevSections => {
      const sorted = [...prevSections].sort((a, b) => a.displayOrder! - b.displayOrder!);
      const index = sorted.findIndex(s => s.id === sectionId);
      const swapIndex = direction === 'up' ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= sorted.length) return prevSections;

      // Swap display orders of the two sections
      const updated = [...sorted];
      const temp = updated[index].displayOrder;
      updated[index] = { ...updated[index], displayOrder: updated[swapIndex].displayOrder };
      updated[swapIndex] = { ...updated[swapIndex], displayOrder: temp };

      return updated.sort((a, b) => a.displayOrder! - b.displayOrder!);
    });
  };

  const validateSectionMove = (sectionId: number, direction: 'up' | 'down'): { isValid: boolean; message?: string } => {
    const sorted = [...localSections].sort((a, b) => a.displayOrder! - b.displayOrder!);
    const index = sorted.findIndex(s => s.id === sectionId);

    if (index === -1) {
      return { isValid: false, message: EditTemplate("errors.updateDisplayOrderError") };
    }
    if (direction === 'up' && index === 0) {
      return { isValid: false, message: EditTemplate("errors.displayOrderAlreadyAtTop") };
    }
    if (direction === 'down' && index === sorted.length - 1) {
      return { isValid: false, message: EditTemplate("errors.cannotMoveFurtherDown") };
    }

    return { isValid: true };
  };

  const getSectionAnchor = (
    sections: SectionCustomizationOverview[],
    sectionId: number,
    direction: 'up' | 'down'
  ): { newSectionId: number | null; newSectionType: CustomizableObjectOwnership } => {
    const sorted = [...sections].sort((a, b) => a.displayOrder! - b.displayOrder!);
    const currentIndex = sorted.findIndex(s => s.id === sectionId);

    if (direction === 'up') {
      // Pin after the section that is two above (index - 2), or null to become first
      const anchorSection = sorted[currentIndex - 2] ?? null;
      return {
        newSectionId: anchorSection?.id ?? null,
        newSectionType: anchorSection?.sectionType ?? null,
      };
    } else {
      // Pin after the section currently below (index + 1)
      const anchorSection = sorted[currentIndex + 1] ?? null;
      return {
        newSectionId: anchorSection?.id ?? null,
        newSectionType: anchorSection?.sectionType as CustomizableObjectOwnership ?? null,
      };
    }
  };

  const handleSectionMove = async (sectionId: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    setErrorMessages([]);

    const { isValid, message } = validateSectionMove(sectionId, direction);
    if (!isValid && message) {
      toastState.add(message, { type: 'error' });
      return;
    }

    // Snapshot before optimistic update
    const previousSections = [...localSections];

    const { newSectionId, newSectionType } = getSectionAnchor(localSections, sectionId, direction);

    // Optimistic update still works on displayOrder locally
    updateLocalSectionOrder(sectionId, direction);
    setIsReordering(true);

    try {
      const response = await moveCustomSectionMutation({
        variables: {
          input: {
            customSectionId: sectionId,
            newSectionId: newSectionId,
            newSectionType: newSectionType,
          }
        }
      });

      const result = response?.data?.moveCustomSection;

      if (!result || result.errors?.general) {
        setLocalSections(previousSections); // revert
        setErrorMessages(prev => [...prev, result?.errors?.general || EditTemplate("errors.updateDisplayOrderError")]);
      } else {
        const accessibleMessage = EditTemplate("messages.sectionMoved");
        setAnnouncement(accessibleMessage);
      }
    } catch (err) {
      setLocalSections(previousSections); // revert
      setErrorMessages(prev => [...prev, EditTemplate("errors.updateDisplayOrderError")]);
    } finally {
      setIsReordering(false);
    }
  };

  // Save either 'DRAFT' or 'PUBLISHED' based on versionType passed into function
  const saveCustomizationTemplate = async () => {
    setErrorMessages([]); // Clear previous errors

    try {
      const response = await publishTemplateCustomization({
        variables: {
          publishTemplateCustomizationTemplateCustomizationId: Number(templateCustomizationId)
        },
      });

      const result = response?.data?.publishTemplateCustomization;

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

    await saveCustomizationTemplate();
  };

  console.log("Template Customization Overview data:", data);


  useEffect(() => {
    if (data?.templateCustomizationOverview?.sections) {
      const sorted = [...data.templateCustomizationOverview.sections]
        .filter((s): s is SectionCustomizationOverview => s !== null)
        .sort((a, b) => a.displayOrder! - b.displayOrder!);
      setLocalSections(sorted);
    }
  }, [data]);


  if (loading) {
    return <div>{Global("messaging.loading")}...</div>;
  }

  if (templateQueryErrors) {
    return <div>{EditTemplate("errors.getTemplatesError")}</div>;
  }

  const template = data?.templateCustomizationOverview;

  console.log("***Template", template);
  if (!template) {
    return <div>{EditTemplate("errors.noTemplateFound")}</div>;
  }

  // Format the latest publish date if it exists
  const formattedPublishDate = template.customizationLastCustomized ? formatDate(template.customizationLastCustomized) : null;

  const description =
    `by ${template.versionedTemplateAffiliationName}` +
    (template.versionedTemplateVersion
      ? ` - ${Global("version")}: ${template.versionedTemplateVersion}`
      : "") +
    (formattedPublishDate
      ? ` - ${Global("lastUpdated")}: ${formattedPublishDate}`
      : "");


  return (
    <div>
      <PageHeader
        title={template.versionedTemplateName}
        description={description}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href="/">{BreadCrumbs("home")}</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href="/template">{BreadCrumbs("templates")}</Link>
            </Breadcrumb>
            <Breadcrumb>Temp Template title</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-template-overview"
      />

      <ErrorMessages
        errors={errorMessages}
        ref={errorRef}
      />

      <LayoutWithPanel>
        <ContentContainer>
          {template.sections && template?.sections?.length > 0 && (
            <div>
              {localSections.map((section) => (
                <CustomizedSectionEdit
                  key={section.id}
                  section={section}
                  displayOrder={section.displayOrder!}
                  templateCustomizationId={templateCustomizationId}
                  setErrorMessages={setErrorMessages}
                  onMoveUp={
                    section.sectionType === 'CUSTOM'
                      ? () => handleSectionMove(section.id!, 'up')
                      : undefined
                  }
                  onMoveDown={
                    section.sectionType === 'CUSTOM'
                      ? () => handleSectionMove(section.id!, 'down')
                      : undefined
                  }

                />
              ))}
            </div>
          )}
          <AddSectionButton href={`/template/customizations/${templateCustomizationId}/section/new`} />

        </ContentContainer>
        <SidebarPanel className="sidebar">
          <div className="status-panel-content side-panel">
            <div className="buttonContainer withBorder mb-5">
              <Button
                data-secondary
                className="secondary"
                onPress={() => console.log("Save as draft")}
              >
                {EditTemplate("button.saveAsDraft")}
              </Button>
              <Button onPress={() => console.log("Publish template")}>{EditTemplate("button.publishTemplate")}</Button>
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

              {(template.customizationIsDirty && !template.customizationLastCustomized) && (
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
                  <p>{getPublishStatusText(template.customizationIsDirty, template?.customizationLastCustomized)}</p>
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
                  href={`/template/customizations/${templateCustomizationId}/access`}
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
                  href={`/template/customizations/${templateCustomizationId}/history`}
                  className="side-panel-link"
                >
                  {EditTemplate("links.templateHistory")}
                </Link>
              </div>
            </div>
          </div>
        </SidebarPanel>
        <div className="template-archive-container">
          <div className="main-content">
            <h2>{EditTemplate("heading.archiveTemplate")}</h2>
            <p>{EditTemplate("description.archiveTemplate")}</p>
            <Form>
              <Button
                className="my-3"
                data-tertiary
                data-testid="archive-template"
                onPress={() => console.log("Archive template")}
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
                  onChange={() => console.log("Visibility changed")} // Optional: Handle visibility change if needed
                  defaultValue="organization"
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
      </LayoutWithPanel>
    </div >
  );
};

export default TemplateCustomizationOverview;