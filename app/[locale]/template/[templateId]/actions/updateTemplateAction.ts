"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
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
    logger.debug(await prepareObjectForLogs({ templateId, name }), "Updating template name");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdateTemplateDocument,
      variables: { templateId, name },
      dataPath: "updateTemplate"
    });

  } catch (error) {
    logger.error(await prepareObjectForLogs({ templateId, name, error }), "Update template name error");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}