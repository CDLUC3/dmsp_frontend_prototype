"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { ResendInviteToProjectCollaboratorDocument } from "@/generated/graphql";
import logger from "@/utils/server/logger";
import { prepareObjectForLogs } from "@/utils/server/loggerUtils";

export async function resendInviteToProjectCollaboratorAction({
  projectCollaboratorId,
}: {
  projectCollaboratorId: number;
}): Promise<ActionResponse> {
  try {
    // Execute the mutation using the shared handler
    return await executeGraphQLMutation({
      document: ResendInviteToProjectCollaboratorDocument,
      variables: { projectCollaboratorId },
      dataPath: "resendInviteToProjectCollaborator"
    });
  } catch (error) {
    logger.error(
        await prepareObjectForLogs({ error, projectCollaboratorId }),
        "Resend project collaborator invitation error"
    );
    return { success: false, errors: ["There was a problem connecting to the server. Please try again."] };
  }
}