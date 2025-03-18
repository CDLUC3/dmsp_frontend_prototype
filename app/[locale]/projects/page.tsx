import { MyProjectsDocument } from '@/generated/graphql';
import { formatProjects } from './utils';
import ProjectListsClientComponent from './ProjectListsClientComponent';
import { cookies } from 'next/headers';

export default async function ProjectsPage() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    // Extract the query string from the gql document
    // This accesses the actual query string within the gql tagged template literal
    const queryString = MyProjectsDocument.loc?.source.body;

    if (!queryString) {
      throw new Error("Could not extract query string from document");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: JSON.stringify({
        query: queryString
      }),
      cache: 'no-store'
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const initialProjects = formatProjects(result.data?.myProjects || []);

    return (
      <ProjectListsClientComponent
        initialProjects={initialProjects}
        initialErrors={[]}
      />
    );
  } catch (error) {
    console.error("GraphQL query error:", error);

    return (
      <ProjectListsClientComponent
        initialProjects={[]}
        initialErrors={["Failed to load projects. Please try again."]}
      />
    );
  }
}