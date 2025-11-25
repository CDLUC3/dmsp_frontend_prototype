"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse, TagsInterface } from "@/app/types";
import { AddGuidanceDocument } from "@/generated/graphql";

export async function addGuidanceTextAction({
  guidanceGroupId,
  title,
  guidanceText,
  tags
}: {
  guidanceGroupId: number;
  title: string;
  guidanceText: string;
  tags: TagsInterface[];
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: AddGuidanceDocument,
    variables: {
      input: {
        guidanceGroupId,
        title,
        guidanceText,
        tags
      }
    },
    dataPath: "addGuidanceText"
  });
}