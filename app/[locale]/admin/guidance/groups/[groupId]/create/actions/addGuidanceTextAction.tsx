"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse, TagsInterface } from "@/app/types";
import { AddGuidanceDocument } from "@/generated/graphql";

export async function addGuidanceTextAction({
  guidanceGroupId,
  guidanceText,
  tags
}: {
  guidanceGroupId: number;
  guidanceText: string;
  tags: TagsInterface[];
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddGuidanceDocument,
    variables: {
      input: {
        guidanceGroupId,
        guidanceText,
        tags
      }
    },
    dataPath: "addGuidanceText"
  });
}