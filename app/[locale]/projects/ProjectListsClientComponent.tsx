'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// Components
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import ProjectListItem from "@/components/ProjectListItem";
import { ContentContainer, LayoutContainer } from '@/components/Container';
import ErrorMessages from '@/components/ErrorMessages';

//GraphQL
import { useMyProjectsQuery, } from '@/generated/graphql';

import { formatProjects } from './utils';
import { ProjectItemProps } from '@/app/types';

interface ProjectsListClientComponentProps {
  initialProjects: ProjectItemProps[];
  initialErrors?: string[];
}

const ProjectsListClientComponent: React.FC<ProjectsListClientComponentProps> = ({
  initialProjects
}) => {
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [projects, setProjects] = useState<ProjectItemProps[]>(initialProjects);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchButtonClicked, setSearchButtonClicked] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<(ProjectItemProps)[] | null>([]);

  // Translation keys
  const Global = useTranslations('Global');
  const Project = useTranslations('ProjectsListPage');

  // Query for projects, only if needed
  const { data, loading } = useMyProjectsQuery({
    skip: initialProjects.length > 0,
    onCompleted: (data) => {
      if (data?.myProjects) {
        const formattedProjects = formatProjects(data.myProjects);
        setProjects(formattedProjects);
      }
    }
  });


  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  /* Filter results when a user enters a search term and clicks "Search" button.
  Searches through title, content, description, and collaborator fields*/
  const handleFiltering = (term: string) => {
    setSearchButtonClicked(true);
    setErrors([]);

    const lowerCaseTerm = term.toLowerCase();

    const filteredList = projects.filter(proj =>
      [
        proj.title,
        proj.description,
        // Ensure all collaborator fields (name, orcid, roles) are included in the search
        proj.collaborators
          .map(collab =>
            [
              collab.name.toLowerCase(),
              collab.orcid?.toLowerCase() || "",
              collab.roles.join(" ").toLowerCase() // Convert roles array to a string
            ].join(" ")
          )
          .join(" ") // Join all collaborators into one searchable string
      ]
        .filter(Boolean) // Remove any undefined/null values
        .some(field => field?.toLowerCase().includes(lowerCaseTerm))
    );

    if (filteredList.length >= 1) {
      setSearchTerm(term);
      setFilteredProjects(filteredList);
    }
  };

  useEffect(() => {
    // Need this to set list of projects back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredProjects(null);
      setSearchButtonClicked(false);
    }
  }, [searchTerm])

  // If page-level errors, scroll them into view
  useEffect(() => {
    if (errors.length > 0 && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [errors]);

  useEffect(() => {
    if (data?.myProjects) {
      const projectErrors = data.myProjects
        .filter((project) => project?.errors?.general || project?.errors?.title)
        .map((project) => project?.errors?.general || Project('messages.errors.errorRetrievingProjects'));

      if (projectErrors.length > 0) {
        setErrors(projectErrors);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // TODO: Implement shared loading spinner
  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <PageHeader
        title={Global('breadcrumbs.projects')}
        description={Project('intro')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{Global('breadcrumbs.projects')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.projects')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={
          <>
            <Link href="/projects/create-project"
              className={"button-link button--primary"}>{Project('buttons.createProject')}</Link>
          </>
        }
        className="page-project-list"
      />

      <ErrorMessages errors={errors} ref={errorRef} />

      <LayoutContainer>
        <ContentContainer>
          <div className="Filters">
            <SearchField
              onClear={() => { setFilteredProjects(null) }}
            >
              <Label>{Global('labels.searchByKeyword')}</Label>
              <Input value={searchTerm} onChange={e => handleSearchInput(e.target.value)} />
              <Button
                onPress={() => {
                  // Call your filtering function without changing the input value
                  handleFiltering(searchTerm);
                }}
              >
                {Global('buttons.search')}
              </Button>
              <FieldError />
              <Text slot="description" className="help">
                {Global('helpText.searchHelpText')}
              </Text>
            </SearchField>
          </div>


          {filteredProjects && filteredProjects.length > 0 ? (
            <div className="template-list" aria-label="Template list" role="list">
              {
                filteredProjects.map((project, index) => (
                  <ProjectListItem
                    key={index}
                    item={project} />
                ))
              }
            </div>
          ) : (
            <>
              <div className="template-list" aria-label="Template list" role="list">
                {(searchTerm.length > 0 && searchButtonClicked) ? (
                  <>
                    <p>{Global('messaging.noItemsFound')}</p>
                  </>
                ) : (
                  <>
                    {
                      projects.map((project, index) => (
                        <ProjectListItem
                          key={index}
                          item={project} />
                      ))
                    }
                  </>
                )
                }
              </div>
            </>
          )
          }


        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default ProjectsListClientComponent;
