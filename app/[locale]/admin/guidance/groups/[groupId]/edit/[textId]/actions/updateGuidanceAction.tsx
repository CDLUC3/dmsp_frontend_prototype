"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { ActionResponse, TagsInterface } from "@/app/types";
import { UpdateGuidanceDocument } from "@/generated/graphql";

export async function updateGuidanceAction({
  guidanceId,
  guidanceText,
  tags,
  title
}: {
  guidanceId: number;
  guidanceText: string;
  tags: TagsInterface[];
  title: string;
}): Promise<ActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateGuidanceDocument,
    variables: {
      input: {
        guidanceId,
        title,
        tags,
        guidanceText
      }
    },
    dataPath: "updateGuidance"
  });
}