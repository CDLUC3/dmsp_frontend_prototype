"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { PublishPlanDocument } from "@/generated/graphql";

export async function publishPlanAction({
  planId,
  visibility
}: {
  planId: number;
  visibility: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ planId, visibility }), "Publishing plan");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: PublishPlanDocument,
      variables: { planId, visibility },
      dataPath: "publishPlan"
    });

  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, visibility, error }), "Publish plan");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}