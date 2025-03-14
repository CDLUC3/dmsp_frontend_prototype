import { getClient } from "@/lib/graphql/apollo-server";
import { MyProjectsDocument } from '@/generated/graphql';
import { formatProjects } from './utils';
import ProjectListsClientComponent from './ProjectListsClientComponent'

export default async function ProjectsPage() {
  try {
    const { data } = await getClient().query({
      query: MyProjectsDocument,
    });

    const initialProjects = formatProjects(data?.myProjects || []);

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