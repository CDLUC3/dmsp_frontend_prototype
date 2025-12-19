"use server";

import { executeGraphQLMutation } from "@/utils/server/graphqlServerActionHandler";
import { updateQuestionActionResponse } from "@/app/types";
import { UpdateQuestionDocument } from "@/generated/graphql";

export async function updateQuestionAction({
  questionId,
  displayOrder,
  json,
  questionText,
  requirementText,
  guidanceText,
  sampleText,
  useSampleTextAsDefault,
  required
}: {
  questionId: number;
  displayOrder: number;
  json: string;
  questionText: string;
  requirementText: string;
  guidanceText: string;
  sampleText: string;
  useSampleTextAsDefault: boolean;
  required: boolean;
}): Promise<updateQuestionActionResponse> {
  // Execute the mutation using the shared handler
  return await executeGraphQLMutation({
    document: UpdateQuestionDocument,
    variables: {
      input: {
        questionId,
        displayOrder,
        json,
        questionText,
        requirementText,
        guidanceText,
        sampleText,
        useSampleTextAsDefault,
        required
      }
    },
    dataPath: "updateQuestion"
  });
}