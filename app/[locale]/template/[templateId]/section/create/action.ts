"use server";

import { AddSectionDocument } from "@/generated/graphql";
import { cookies } from "next/headers";

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
    // Extract mutation string from the generated document
    const mutationString = AddSectionDocument.loc?.source.body;

    if (!mutationString) {
      throw new Error("Could not extract mutation string from document");
    }

    // Get authentication token if needed
    const cookieStore = cookies();
    const authToken = cookieStore.get('authToken')?.value;

    // Make the fetch request
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: JSON.stringify({
        query: mutationString,
        variables: { input }
      })
    });

    const result = await response.json();

    // Handle errors
    if (result.errors || result.data?.addSection?.errors) {
      return {
        success: false,
        errors: result.data?.addSection?.errors || result.errors
      };
    }

    return {
      success: true,
      section: result.data?.addSection?.section
    };
  } catch (error) {
    console.error("Error creating section:", error);
    return { success: false, errors: ["An unexpected error occurred"] };
  }
}