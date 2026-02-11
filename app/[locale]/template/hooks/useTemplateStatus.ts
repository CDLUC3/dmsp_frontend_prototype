'use client'

import { useTranslations } from "next-intl";

/**
 * Hook for determining template publish status text.
 * Used across template pages to display consistent status information.
 */
export const useTemplateStatus = () => {
  const Global = useTranslations("Global");

  const getPublishStatusText = (
    isDirty: boolean,
    latestPublishDate: string | null | undefined
  ): string => {
    if (isDirty && latestPublishDate) {
      return Global("status.unpublishedChanges");
    } else if (!latestPublishDate) {
      return Global("status.draft");
    } else {
      return Global("status.published");
    }
  };

  return { getPublishStatusText };
};
