'use client'

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  GuidanceSourcesForPlanDocument,
} from '@/generated/graphql';
import { GuidanceItemInterface } from '@/app/types';

interface UseGuidanceDataProps {
  planId: number;
  versionedSectionId?: number;
  versionedQuestionId?: number;
  sectionType?: string; // Optional, in case we want to conditionally fetch based on section type in the future
}

/**
 * Hook for fetching guidance data only.
 * Mutations are handled in parent components to avoid circular dependencies.
 */
export const useGuidanceData = ({
  planId,
  versionedSectionId,
  versionedQuestionId,
  sectionType,
}: UseGuidanceDataProps) => {

  // Only pass versionedSectionId to the backend when it's actually a base section.
  // Custom section IDs are not versioned section IDs and would return wrong results.
  const resolvedVersionedSectionId = sectionType === 'CUSTOM' ? undefined : versionedSectionId;
  const resolvedCustomSectionId = sectionType === 'CUSTOM' ? versionedSectionId : undefined;

  const resolvedVersionedQuestionId = sectionType === 'CUSTOM' ? undefined : versionedQuestionId;
  const resolvedCustomQuestionId = sectionType === 'CUSTOM' ? versionedQuestionId : undefined;

  // Fetch all guidance sources from backend (includes matched guidance and tags)
  const { data: guidanceData, loading: guidanceLoading, refetch } = useQuery(
    GuidanceSourcesForPlanDocument,
    {
      variables: {
        planId,
        versionedSectionId: resolvedVersionedSectionId,
        versionedQuestionId: resolvedVersionedQuestionId,
        customSectionId: resolvedCustomSectionId,
        customQuestionId: resolvedCustomQuestionId
      },
      skip: !planId,
      notifyOnNetworkStatusChange: true,
    }
  );

  // Extract section tags from guidance items (backend already matched them)
  const sectionTagsMap = useMemo<Record<number, string>>(() => {
    const tagsMap: Record<number, string> = {};

    guidanceData?.guidanceSourcesForPlan?.forEach(source => {
      source.items?.forEach(item => {
        if (item.id != null && item.title) {
          tagsMap[item.id] = item.title;
        }
      });
    });

    return tagsMap;
  }, [guidanceData]);

  // Transform guidance sources to component format
  const guidanceItems = useMemo<GuidanceItemInterface[]>(() => {
    if (!guidanceData?.guidanceSourcesForPlan) {
      return [];
    }

    return guidanceData.guidanceSourcesForPlan.map(source => ({
      orgURI: source.orgURI,
      orgName: source.label,
      orgShortname: source.shortName,
      type: source.type,
      items: source.items.map(item => ({
        id: item.id ?? undefined,
        title: item.title ?? undefined,
        guidanceText: item.guidanceText
      }))
    }));

  }, [guidanceData]);

  return {
    sectionTagsMap,
    guidanceItems,
    guidanceLoading,
    refetchGuidance: refetch, // Expose refetch for manual refresh after mutations
  };
};