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
  SearchField,
  Text
} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import styles from './ProjectsProjectFundingSearch.module.scss';

const ProjectsProjectFundingSearch = () => {
  // State for search field input
  const [searchTerm, setSearchTerm] = useState<string>("NSF");

  // State to track if a search has been performed
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // List of most used funders (shown when no search has been executed)
  const mostUsedFunders = [
    "Bill & Melinda Gates Foundation",
    "Wellcome Trust",
    "National Institutes of Health (NIH)"
  ];

  // Mock funders list (For after search - NSF examples given)
  const fundersMockData = [
    "National Science Foundation (NSF)",
    "National Science Foundation-BSF (NSF-BSF)",
    "NSF-AAA"
  ];
  const [funders, setFunders] = useState<string[]>([]);

  // Handles the Search button click
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // If search is blank, reset back to empty state
    if (!searchTerm.trim()) {
      setHasSearched(false);
      setFunders([]); // Clear funders list as no search is executed
      return;
    }

    console.log('Search executed for:', searchTerm);
    setHasSearched(true);

    // Mock search implementation: Filter for NSF funders
    const results = fundersMockData.filter(funder =>
      funder.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFunders(results);
  };

  const handleSelectFunder = (funder: string) => {
    console.log('Funder selected:', funder);
    // Handle funder selection logic (e.g., save state)
    window.location.href = '/en-US/projects/proj_2425/funder';
  };

  const handleAddFunderManually = () => {
    console.log('Add funder manually clicked');
    // Handle manual addition of funders
    window.location.href = '/projects/proj_2425/funder/edit';
  };

  return (
    <>
      <PageHeader
        title="Search for Funders"
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">Projects</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-create-project-funding"
      />
      <LayoutWithPanel>
        <ContentContainer>
          {/* Search Field */}
          <Form onSubmit={handleSearch} aria-labelledby="search-section">
            <section id="search-section" className={styles.searchSection}>
              <SearchField aria-label="Search funders">
                <Label>Search by funder name</Label>
                <Input
                  aria-describedby="search-help"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter funder name..."
                />
                <Button type={"submit"}>Search</Button>
                <Text slot="description" className="help" id="search-help">
                  Search by research organization, funder name, or related keywords.
                </Text>
              </SearchField>
            </section>
          </Form>

          {/* "Empty State" - Most Used Funders (shown before search is executed) */}
          {!hasSearched && (
            <section aria-labelledby="most-used-section">
              <h3 id="most-used-section">Most popular funders</h3>
              <div className={styles.funderResultsList}>
                {mostUsedFunders.map((funder, index) => (
                  <div
                    key={index}
                    className={styles.funderResultsListItem}
                    role="group"
                    aria-label={`Funder: ${funder}`}
                  >
                    <p className="funder-name">{funder}</p>
                    <Button
                      className="secondary select-button"
                      onPress={() => handleSelectFunder(funder)}
                      aria-label={`Select ${funder}`}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Search Results (3 NSF funders - shown after search is executed) */}
          {hasSearched && (
            <section aria-labelledby="funders-section">
              <h3 id="funders-section">{funders.length} funders found</h3>
              <div className={styles.funderResultsList}>
                {funders.map((funder, index) => (
                  <div
                    key={index}
                    className={styles.funderResultsListItem}
                    role="group"
                    aria-label={`Funder: ${funder}`}
                  >
                    <p className="funder-name">{funder}</p>
                    <Button
                      className="secondary select-button"
                      onPress={() => handleSelectFunder(funder)}
                      aria-label={`Select ${funder}`}
                    >
                      Select
                    </Button>
                  </div>
                ))}

                <div className={styles.funderResultsListMore}>
                  <Button
                    onPress={() => console.log('Load more funders')}
                    aria-label="Load more funders"
                  >
                    Load More
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Add Funder Manually (Always Visible After Search) */}
          {hasSearched && (
            <section aria-labelledby="manual-section" className="mt-8">
              <h3 id="manual-section">Not in this list?</h3>
              <p>If your project isn’t shown, you can add the details manually.</p>
              <Button
                className="add-funder-button"
                onPress={handleAddFunderManually}
                aria-label="Add funder manually"
              >
                Add Funder Manually
              </Button>
            </section>
          )}
        </ContentContainer>
        <SidebarPanel></SidebarPanel>
      </LayoutWithPanel>
    </>
  );
};

export default ProjectsProjectFundingSearch;
