"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse } from "@/app/types";
import { UpdateTemplateDocument } from "@/generated/graphql";

export async function updateTemplateAction({
  templateId,
  name,
}: {
  templateId: number;
  name: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateTemplateDocument,
    variables: { templateId, name },
    dataPath: "updateTemplate"
  });
}