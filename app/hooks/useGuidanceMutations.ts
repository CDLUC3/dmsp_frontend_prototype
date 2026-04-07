'use client'

import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslations } from "next-intl";
import {
  AddPlanGuidanceDocument,
  RemovePlanGuidanceDocument,
  AffiliationSearch,
  GuidanceSourcesForPlanDocument
} from '@/generated/graphql';
import logECS from "@/utils/clientLogger";

interface UseGuidanceMutationsProps {
  planId: number;
  versionedSectionId?: number;
  versionedQuestionId?: number;
  customSectionId?: number;
  customQuestionId?: number;
}

/**
 * Hook for guidance add/remove mutations.
 * Separated from data fetching to avoid circular dependencies.
 */
export const useGuidanceMutations = ({
  planId,
  versionedSectionId,
  versionedQuestionId,
  customSectionId,
  customQuestionId
}: UseGuidanceMutationsProps) => {

  const Guidance = useTranslations('Guidance');

  // Local error state
  const [guidanceError, setGuidanceError] = useState<string | null>(null);

  const resolvedVersionedSectionId = customSectionId ? undefined : versionedSectionId;
  const resolvedCustomSectionId = customSectionId ?? undefined;
  const resolvedVersionedQuestionId = customQuestionId ? undefined : versionedQuestionId;
  const resolvedCustomQuestionId = customQuestionId ?? undefined;

  const refetchVariables = {
    planId,
    versionedSectionId: resolvedVersionedSectionId ? Number(resolvedVersionedSectionId) : undefined,
    versionedQuestionId: resolvedVersionedQuestionId ? Number(resolvedVersionedQuestionId) : undefined,
    customSectionId: resolvedCustomSectionId ? Number(resolvedCustomSectionId) : undefined,
    customQuestionId: resolvedCustomQuestionId ? Number(resolvedCustomQuestionId) : undefined,
  };

  // Mutation for adding guidance organizations
  const [addPlanGuidanceMutation, { loading: isAdding }] = useMutation(AddPlanGuidanceDocument, {
    refetchQueries: [
      {
        query: GuidanceSourcesForPlanDocument,
        variables: refetchVariables
      }
    ],
    awaitRefetchQueries: true, // Wait for refetch to complete
  });

  // Mutation for removing guidance organizations
  const [removePlanGuidanceMutation, { loading: isRemoving }] = useMutation(RemovePlanGuidanceDocument, {
    refetchQueries: [
      {
        query: GuidanceSourcesForPlanDocument,
        variables: refetchVariables
      }
    ],
    awaitRefetchQueries: true, // Wait for refetch to complete
  });

  // Handler to add guidance organization
  const addGuidanceOrganization = useCallback(async (affiliation: AffiliationSearch) => {
    if (!affiliation.uri) {
      const errorMsg = Guidance('messages.errors.unableToAddOrganization');
      setGuidanceError(errorMsg);
      logECS("error", "No URI for affiliation when attempting to add guidance organization", {
        source: "addGuidanceOrganization: useGuidanceMutations hook",
        affiliationId: affiliation.uri
      });
      return;
    }

    // Clear any existing errors
    setGuidanceError(null);

    try {
      await addPlanGuidanceMutation({
        variables: {
          planId,
          affiliationId: affiliation.uri
        }
      });

      logECS("info", `Successfully added guidance organization: ${affiliation.displayName}`, {
        source: "addGuidanceOrganization: useGuidanceMutations hook",
        planId,
        affiliationId: affiliation.uri
      });
    } catch (error) {
      const errorMsg = Guidance('messages.errors.unableToAddOrganization');
      setGuidanceError(errorMsg);
      logECS("error", "Error adding guidance organization in useGuidanceMutations hook", {
        errors: error,
        source: "addGuidanceOrganization: useGuidanceMutations hook",
        planId,
        affiliationId: affiliation.uri
      });
    }
  }, [addPlanGuidanceMutation, Guidance, planId]);

  // Handler to remove guidance organization
  const removeGuidanceOrganization = useCallback(async (affiliationUri: string) => {
    // Clear any existing errors
    setGuidanceError(null);

    try {
      await removePlanGuidanceMutation({
        variables: {
          planId,
          affiliationId: affiliationUri
        }
      });

      logECS("info", `Successfully removed guidance organization: ${affiliationUri}`, {
        source: "removeGuidanceOrganization: useGuidanceMutations hook",
        planId,
        affiliationId: affiliationUri
      });
    } catch (error) {
      const errorMsg = Guidance('messages.errors.unableToRemoveOrganization');
      setGuidanceError(errorMsg);
      logECS("error", "Error removing guidance organization in useGuidanceMutations hook", {
        source: "removeGuidanceOrganization: useGuidanceMutations hook",
        errors: error,
        planId,
        affiliationId: affiliationUri
      });
    }
  }, [removePlanGuidanceMutation, Guidance, planId]);

  // Clear error handler
  const clearError = useCallback(() => {
    setGuidanceError(null);
  }, []);

  return {
    addGuidanceOrganization,
    removeGuidanceOrganization,
    clearError,
    guidanceError,
    isAdding,
    isRemoving,
    isMutating: isAdding || isRemoving,
  };
};