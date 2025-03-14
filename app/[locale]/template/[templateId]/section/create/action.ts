"use server";

import { getClient } from "@/lib/graphql/apollo-server";
import { AddSectionDocument } from "@/generated/graphql";

export async function createSectionOnServer(input: {
  templateId: number;
  name: string;
  introduction: string;
  requirements: string;
  guidance: string;
  displayOrder: number;
  tags: { id: number }[];
}) {
  try {
    const client = getClient(); // Ensure getClient() is properly set up for server-side Apollo Client usage

    const { data, errors } = await client.mutate({
      mutation: AddSectionDocument,
      variables: { input },
    });

    if (errors || data?.addSection?.errors) {
      return { success: false, errors: data?.addSection?.errors || errors };
    }

    return { success: true, section: data?.addSection?.section };
  } catch (error) {
    console.error("Error creating section:", error);
    return { success: false, errors: ["An unexpected error occurred"] };
  }
}