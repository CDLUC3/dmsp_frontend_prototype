'use client'

import { useTranslations } from "next-intl";

export type CustomizationStatus = 'NOT_STARTED' | 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED_CHANGES';

/**
 * Hook for determining template publish status text.
 * Used across template pages to display consistent status information.
 */
export const useTemplateStatus = () => {
  const Global = useTranslations("Global");

  const getCustomizationStatus = (
    isDirty: boolean,
    latestPublishDate: string | null | undefined
  ): CustomizationStatus => {
    if (!isDirty && !latestPublishDate) return 'NOT_STARTED';
    if (isDirty && !latestPublishDate) return 'DRAFT';
    if (isDirty && latestPublishDate) return 'UNPUBLISHED_CHANGES';
    return 'PUBLISHED';
  };

  const getPublishStatusText = (
    isDirty: boolean,
    latestPublishDate: string | null | undefined
  ): string => {
    const status = getCustomizationStatus(isDirty, latestPublishDate);
    if (status === 'UNPUBLISHED_CHANGES') return Global("status.unpublishedChanges");
    if (status === 'DRAFT') return Global("status.draft");
    if (status === 'PUBLISHED') return Global("status.published");
    return Global("status.notStarted");
  };

  return { getPublishStatusText, getCustomizationStatus };

};
