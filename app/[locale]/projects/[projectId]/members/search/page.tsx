'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Form,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
} from "@/components/Container";
import { OrcidIcon } from '@/components/Icons/orcid/';
import { routePath } from '@/utils/routes';

import styles from './ProjectsProjectMembersSearch.module.scss';

interface SearchResult {
  name: string;
  organization: string;
  orcid?: string;
  affiliation?: string;
}

const ProjectsProjectMembersSearch = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("Fred");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      name: "Frederick Cook",
      organization: "Kansas State University",
      orcid: "0000-0001-2603-0427",
      affiliation: "and 2 others"
    },
    {
      name: "Fred Cook",
      organization: "New Jersey City University",
      orcid: "0000-0003-1234-5678",
      affiliation: "and 2 others"
    },
    {
      name: "Fred Andes",
      organization: "New Jersey City University",
      orcid: "0000-0003-9999-4321",
      affiliation: "and 3 more"
    }
  ];
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }

    setHasSearched(true);
    setSearchResults(mockResults);
  };

  const handleAdd = (result: SearchResult) => {
    console.log('Adding member:', result);
    // Handle adding member logic
    router.push(routePath('projects.members.index', { projectId: 'proj_2425' }))

  };

  const handleCreateMember = () => {
    console.log('Creating new member');
    // Navigate to create member page
    router.push(routePath('projects.members.edit', { projectId: 'proj_2425', memberId: '123' }))
  };

  return (
    <>
      <PageHeader
        title="Who are the project members?"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-members-search"
      />
      <LayoutWithPanel>
        <ContentContainer>
          <Form onSubmit={handleSearch} aria-labelledby="search-section">
            <section id="search-section" className={styles.searchSection}>
              <SearchField aria-label="Search collaborators">
                <Label>Search by name, organization or ORCID</Label>
                <Input
                  aria-describedby="search-help"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}

                />
                <Button type="submit">Search</Button>
                <Text slot="description" className="help" id="search-help">
                  Search by a person&apos;s name, organization and/or ORCiD. Entering
                  more information will help narrow the search, for example
                  Frederick Cook 0427.
                </Text>
              </SearchField>
            </section>
          </Form>

          {hasSearched && (
            <section aria-labelledby="results-section">
              <h2 id="results-section" className="heading-3">Showing 1-3 of 124 results</h2>
              <div className={styles.memberResultsList}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={styles.memberResultsListItem}
                    role="group"
                    aria-label={`Member: ${result.name}`}
                  >
                    <div className={styles.memberInfo}>
                      <div className={styles.nameAndOrcid}>
                        <p className={styles.name}>{result.name}</p>
                      </div>
                      <p className={styles.organization}>
                        {result.organization} {result.affiliation}

                        <br />
                        {result.orcid && (
                          <span className={styles.orcid}>
                            <OrcidIcon icon="orcid" classes={styles.orcidLogo} />
                            {result.orcid}
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      className="secondary"
                      onPress={() => handleAdd(result)}
                      aria-label={`Add ${result.name}`}
                    >
                      Add
                    </Button>
                  </div>
                ))}

                <div className={styles.memberResultsListMore}>
                  <Button
                    className="secondary"
                    onPress={() => console.log('Load more')}
                    aria-label="Load more results"
                  >
                    Load more
                  </Button>
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="manual-section"
            className={styles.createNew}>
            <h2 id="manual-section" className="heading-3">Not in the list?</h2>
            <p>If your collaborator isn&apos;t shown you can add their details
              manually</p>
            <Button
              className="secondary"
              onPress={handleCreateMember}
              aria-label="Create member"
            >
              Create member
            </Button>
          </section>
        </ContentContainer>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectMembersSearch;
