"use server";

import { executeGraphQLMutation } from "@/utils/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdateTemplateDocument, TemplateVisibility } from "@/generated/graphql";

export async function updateTemplateAction({
  templateId,
  name,
  visibility,
  bestPractice
}: {
  templateId: number;
  name: string;
  bestPractice: boolean;
  visibility: TemplateVisibility;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return executeGraphQLMutation({
      document: UpdateTemplateDocument,
      variables: { templateId, name, visibility, bestPractice },
      dataPath: "updateTemplate"
    });

  } catch (error) {
    logger.error(`[Update Template Error]: ${error}`, { error });
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}