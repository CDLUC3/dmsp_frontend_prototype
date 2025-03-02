'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { routePath } from '@/utils/routes';

// import {
//   useLanguagesQuery,
//   UserErrors,
// } from '@/generated/graphql';
import {
  AffiliationSearch,
  AffiliationSearchResults,
  useAddProjectFunderMutation,
} from '@/generated/graphql';

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Link,
} from "react-aria-components";

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import FunderSearch from '@/components/FunderSearch';

import styles from './ProjectsCreateProjectFundingSearch.module.scss';


const ProjectsCreateProjectFundingSearch = () => {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [moreCounter, setMoreCounter] = useState<number>(0);
  const [funders, setFunders] = useState<AffiliationSearch[]>([]);
  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [addProjectFunder, {data, loading, error}] = useAddProjectFunderMutation({});

  async function handleSelectFunder(funder: AffiliationSearch) {
    const NEXT_URL = routePath('projects.create.fundingSearch', {
      projectId: projectId,
    });

    const input = {
      projectId: Number(projectId),
      affiliationId: funder.uri
    }

    try {
      const result = await addProjectFunder({variables: { input }})
      router.push(NEXT_URL);
    } catch(err) {
      // TODO:: Proper Error handling
      console.log(err);
    }
  };

  function hasMore() {
    if (!nextCursor) return false;
    if (funders.length < totalCount) return true;
  }

  async function handleAddFunderManually(funderName: string) {
    // TODO:: Handle manual addition of funders
    // FIXME:: What should this do? There is no indication in the wireframes
  };

  function onResults(results: AffiliationSearchResults) {
    if (results) {
      setFunders(funders.concat(results.items));
      setTotalCount(results.totalCount);
      if (results.nextCursor) {
        setNextCursor(results.nextCursor);
      }
      if (!hasSearched) setHasSearched(true);
    }
  }

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
          <FunderSearch
            limit={2}
            onResults={onResults}
            moreTrigger={moreCounter}
          />

          {funders.length > 0 && (
            <section aria-labelledby="funders-section">
              <h3 id="funders-section">{totalCount} funders found</h3>
              <div className={styles.funderResultsList}>
                {funders.map((funder, index) => (
                  <div
                    key={index}
                    className={styles.funderResultsListItem}
                    role="group"
                    aria-label={`Funder: ${funder.displayName}`}
                  >
                    <p className="funder-name">{funder.displayName}</p>
                    <Button
                      className="secondary select-button"
                      data-funder-uri={funder.uri}
                      onPress={() => handleSelectFunder(funder)}
                      aria-label={`Select ${funder.displayName}`}
                    >
                      Select
                    </Button>
                  </div>
                ))}

                {(hasMore()) && (
                  <div className={styles.funderResultsListMore}>
                    <Button
                      onPress={() => setMoreCounter(moreCounter + 1)}
                      aria-label="Load more funders"
                    >
                      Load More
                    </Button>
                  </div>
                )}
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

export default ProjectsCreateProjectFundingSearch;
