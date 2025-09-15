"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger from "@/utils/server/logger";
import { prepareObjectForLogs } from "@/utils/server/loggerUtils";
import { ActionResponse } from "@/app/types";
import { UpdateTemplateDocument } from "@/generated/graphql";

export async function updateTemplateAction({
  templateId,
  name,
}: {
  templateId: number;
  name: string;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateTemplateDocument,
      variables: { templateId, name },
      dataPath: "updateTemplate"
    });

  } catch (error) {
    logger.error({ error }, `[Update Template Error]: ${error}`);
    logger.error(
      await prepareObjectForLogs({ error, templateId, name }),
      "Update template error"
    )
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}