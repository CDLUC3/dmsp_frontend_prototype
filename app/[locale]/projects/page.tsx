import { redirect } from 'next/navigation';
import { MyProjectsDocument, MyProjectsQuery } from '@/generated/graphql';
import { formatProjects } from './utils';
import ProjectListsClientComponent from './ProjectListsClientComponent';
import { executeGraphQLQuery } from '@/utils/serverGraphqlFetch'; // Import the handler

export default async function ProjectsPage() {
  // Extract the query string from the gql document
  const queryString = MyProjectsDocument.loc?.source.body;

  if (!queryString) {
    return (
      <ProjectListsClientComponent
        initialProjects={[]}
        initialErrors={["Could not extract query string from document"]}
      />
    );
  }

  // You can add any additional custom headers if needed
  const additionalHeaders = {
    // Add any custom headers here if needed
  };

  // Use the executeGraphQLQuery function with error handling
  const result: { data?: MyProjectsQuery; errors?: string[]; redirect?: string } =
    await executeGraphQLQuery(queryString, {}, { additionalHeaders });

  if ('redirect' in result && result.redirect) {
    // Use the Next.js redirect function
    redirect(result.redirect);
  }

  const { data, errors } = result;

  if (errors) {
    return (
      <ProjectListsClientComponent
        initialProjects={[]}
        initialErrors={errors}
      />
    );
  }

  const initialProjects = formatProjects(data && data?.myProjects || []);

  return (
    <ProjectListsClientComponent
      initialProjects={initialProjects}
      initialErrors={[]}
    />
  );
}