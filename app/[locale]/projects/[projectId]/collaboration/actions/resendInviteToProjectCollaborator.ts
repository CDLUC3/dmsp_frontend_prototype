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
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: ResendInviteToProjectCollaboratorDocument,
    variables: { projectCollaboratorId },
    dataPath: "resendInviteToProjectCollaborator"
  });
}