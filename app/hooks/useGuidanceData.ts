'use client'

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  VersionedGuidanceDocument,
  PlanQuery
} from '@/generated/graphql';
import { GuidanceItemInterface, VersionedGuidanceQuery } from '@/app/types';

interface UseGuidanceDataProps {
  userAffiliationUri?: string;
  userAffiliationName?: string;
  userAffiliationAcronyms?: string[] | null;
  planData: PlanQuery | undefined;
  versionedSectionId: string;
}

export const useGuidanceData = ({
  userAffiliationUri,
  userAffiliationName,
  userAffiliationAcronyms,
  planData,
  versionedSectionId
}: UseGuidanceDataProps) => {

  // Get section tag info from plan data
  const currentSectionTagIds = useMemo(() => {
    const section = planData?.plan?.versionedSections?.find(s => s.versionedSectionId === Number(versionedSectionId)
    );
    const guidanceTagInfo = section?.tags?.map(t => ({
      tagId: t.id,
      tagName: t.name,
      tagSlug: t.slug,
      tagDescription: t.description
    })) ?? [];
    return guidanceTagInfo;
  }, [planData, versionedSectionId]);

  // Get Guidance Groups for user's affiliation
  const { data: guidanceData, loading: guidanceLoading } = useQuery<VersionedGuidanceQuery>(
    VersionedGuidanceDocument,
    {
      variables: {
        affiliationId: userAffiliationUri || '',
        tagIds: currentSectionTagIds.map(t => t.tagId).filter((id): id is number => id != null)
      },
      skip: !userAffiliationUri
    }
  );

  // Derive the sectionTags map format needed by GuidancePanel
  const sectionTagsMap: Record<number, string> = useMemo(() => {
    return currentSectionTagIds.reduce((acc: Record<number, string>, tag) => {
      if (tag.tagId != null) {
        acc[tag.tagId] = tag.tagName;
      }
      return acc;
    }, {}); // No type assertion needed here
  }, [currentSectionTagIds]);

  // Guidance from user's affiliation that matches current section tags
  const matchedGuidanceByOrg = useMemo<GuidanceItemInterface[]>(() => {
    if (!guidanceData?.versionedGuidance || guidanceData.versionedGuidance.length === 0) {
      return [];
    }

    if (!userAffiliationUri || !userAffiliationName) {
      return [];
    }

    // Group guidance by tagId and combine multiple texts for the same tag
    const itemsByTag = new Map<number, string[]>();

    guidanceData.versionedGuidance.forEach(g => {
      if (g.guidanceText && g.tagId != null) {
        if (!itemsByTag.has(g.tagId)) {
          itemsByTag.set(g.tagId, []);
        }
        itemsByTag.get(g.tagId)!.push(g.guidanceText);
      }
    });

    // Convert to items array
    const items: { id?: number; title?: string; guidanceText: string }[] = [];

    itemsByTag.forEach((texts, tagId) => {
      const matchingTag = currentSectionTagIds.find(t => t.tagId === tagId);
      items.push({
        id: tagId,
        title: matchingTag?.tagName,
        guidanceText: texts.join('')
      });
    });

    // Return single organization with all consolidated guidance
    return [{
      orgURI: userAffiliationUri,
      orgName: userAffiliationName,
      orgShortname: userAffiliationAcronyms?.[0] ?? userAffiliationName,
      items
    }];
  }, [guidanceData, currentSectionTagIds, userAffiliationUri, userAffiliationName, userAffiliationAcronyms]);

  return {
    sectionTagsMap,
    matchedGuidanceByOrg,
    guidanceLoading,
    currentSectionTagIds
  };
};