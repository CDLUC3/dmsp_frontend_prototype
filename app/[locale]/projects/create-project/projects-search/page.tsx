'use client';

import React, {useState} from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Input,
  Label,
  Link,
  Text,
  TextField
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import styles from './ProjectsCreateProjectProjectSearch.module.scss';

const ProjectsCreateProjectProjectSearch = () => {
  // States for each search field
  const [projectID, setProjectID] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("Particle");
  const [awardYear, setAwardYear] = useState<string>("");
  const [principalInvestigator, setPrincipalInvestigator] = useState<string>("");

  // State to track if a search has been performed
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Mock project data for search
  const projectsMockData = [
    {
      id: "5R01AI12345-02",
      name: "Particle Physics and Quantum Mechanics",
      year: "2023",
      investigator: "Dr. Smith;12345"
    },
    {
      id: "5R01AI12345-02",
      name: "Particle Mechanics",
      year: "2023",
      investigator: "Dr. Smith;12345"
    },
    {
      id: "5R01BB54321-01",
      name: "Astrophysics Research",
      year: "2022",
      investigator: "Dr. Johnson;67890"
    },
    {
      id: "5R01CC98765-03",
      name: "Nanotechnology in Medicine",
      year: "2021",
      investigator: "Dr. Taylor;11223"
    }
  ];
  const [projects, setProjects] = useState<typeof projectsMockData>([]);

  // Handles the Search button click
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // At least one field must be filled to initiate a search
    if (!projectID.trim() && !projectName.trim() && !awardYear.trim() && !principalInvestigator.trim()) {
      setHasSearched(false);
      setProjects([]);
      return;
    }

    console.log('Search executed for:', {
      projectID,
      projectName,
      awardYear,
      principalInvestigator
    });
    setHasSearched(true);

    const results = projectsMockData.filter((project) => {
      return (
        (!projectID || project.id.toLowerCase().includes(projectID.toLowerCase())) &&
        (!projectName || project.name.toLowerCase().includes(projectName.toLowerCase())) &&
        (!awardYear || project.year.includes(awardYear)) &&
        (!principalInvestigator || project.investigator.toLowerCase().includes(principalInvestigator.toLowerCase()))
      );
    });

    setProjects(results);
  };

  const handleSelectProject = (projectName: string) => {
    console.log('Project selected:', projectName);
    window.location.href = '/projects/proj_2425new';

  };

  const handleAddProjectManually = () => {
    console.log('Add project manually clicked');

  };

  return (
    <>
      <PageHeader
        title="Search for Projects"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-create-project-search"
      />
      <LayoutWithPanel>
        <ContentContainer>
          {/* Search Form */}
          <Form onSubmit={handleSearch} aria-labelledby="search-section">
            <section id="search-section" className={styles.searchSection}>
              {/* Project ID Field */}
              <TextField className={styles.searchField}>
                <Label htmlFor="project-id">Project ID</Label>
                <Input
                  id="project-id"
                  value={projectID}
                  onChange={(e) => setProjectID(e.target.value)}
                  placeholder="Enter Project or Award ID..."
                />
                <Text slot="description" className="help">
                  Project or award ID, for example 5R01AI12345-02
                </Text>
              </TextField>

              {/* Project Name Field */}
              <TextField className={styles.searchField}>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter Project Name/Title..."
                />
                <Text slot="description" className="help">
                  All or part of the project name/title, for example Particle
                  Physics
                </Text>
              </TextField>

              {/* Award Year Field */}
              <TextField className={styles.searchField}>
                <Label htmlFor="award-year">Award Year</Label>
                <Input
                  id="award-year"
                  value={awardYear}
                  onChange={(e) => setAwardYear(e.target.value)}
                  placeholder="Enter Award Year..."
                />
              </TextField>

              {/* Principal Investigator Field */}
              <TextField className={styles.searchField}>
                <Label htmlFor="principal-investigator">Principal
                  Investigator</Label>
                <Input
                  id="principal-investigator"
                  value={principalInvestigator}
                  onChange={(e) => setPrincipalInvestigator(e.target.value)}
                  placeholder="Enter PI Name or Profile ID..."
                />
                <Text slot="description" className="help">
                  PI names or profile IDs. Separate multiple items with
                  semicolons (;).
                </Text>
              </TextField>

              {/* Submit Button */}
              <div className={styles.searchField}>
                <Button type="submit">Search</Button>
              </div>
            </section>
          </Form>

          {/* Search Results */}
          {hasSearched && (
            <>
              {projects.length > 0 ? (
                <section aria-labelledby="projects-section">
                  <h3 id="projects-section">{projects.length} projects
                    found</h3>
                  <div className={styles.projectResultsList}>
                    {projects.map((project, index) => (
                      <div
                        key={index}
                        className={styles.projectResultsListItem}
                        role="group"
                        aria-label={`Project: ${project.name}`}
                      >
                        <div className={styles.projectDetails}>
                          <h4 className={styles.projectName}>
                            {project.name} ({project.year})
                          </h4>
                          <p>Principal Investigator: {project.investigator}</p>
                        </div>
                        <div className={styles.projectSelect}>
                          <Button
                            className="secondary select-button"
                            onPress={() => handleSelectProject(project.name)}
                            aria-label={`Select ${project.name}`}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <section aria-labelledby="no-results-section">
                  <h3 id="no-results-section">No projects found</h3>
                  <p>
                    We couldn’t find any projects matching your search. Try
                    again with different details.
                  </p>
                </section>
              )}

              {/* Add Project Manually */}
              <section aria-labelledby="manual-section" className="mt-8">
                <h3 id="manual-section">Not in this list?</h3>
                <p>If your project isn’t shown, you can add the details
                  manually.</p>
                <Button
                  className="add-project-button"
                  onPress={handleAddProjectManually}
                  aria-label="Add project manually"
                >
                  Add Project Manually
                </Button>
              </section>
            </>
          )}
        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsCreateProjectProjectSearch;
