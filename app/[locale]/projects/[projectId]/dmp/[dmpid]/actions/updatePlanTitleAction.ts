"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdatePlanTitleDocument } from "@/generated/graphql";

export async function updatePlanTitleAction({
  planId,
  title
}: {
  planId: number;
  title: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ planId, title }), "Updating plan title");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdatePlanTitleDocument,
      variables: { planId, title },
      dataPath: "updatePlanTitle"
    });

  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, title, error }), "Update plan title");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}