"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import logger, {prepareObjectForLogs} from "@/utils/server/logger";
import { ActionResponse } from "@/app/types";
import { UpdatePlanStatusDocument } from "@/generated/graphql";

export async function updatePlanStatusAction({
  planId,
  status
}: {
  planId: number;
  status: string;
}): Promise<ActionResponse> {
  try {
    logger.debug(await prepareObjectForLogs({ planId, status }), "Updating plan status");

    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: UpdatePlanStatusDocument,
      variables: { planId, status },
      dataPath: "updatePlanStatus"
    });

  } catch (error) {
    logger.error(await prepareObjectForLogs({ planId, status, error }), "Update plan status");
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}