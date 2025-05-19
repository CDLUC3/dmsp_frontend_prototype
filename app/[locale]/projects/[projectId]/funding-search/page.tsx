'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { routePath } from '@/utils/routes';

import { scrollToTop } from '@/utils/general';
import { LoggedError } from "@/utils/exceptions";

import {
  AffiliationSearch,
  AffiliationSearchResults,
  useAddProjectFunderMutation,
  ProjectFunderErrors,
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
import ErrorMessages from "@/components/ErrorMessages";

import styles from './ProjectsCreateProjectFundingSearch.module.scss';


const CreateProjectSearchFunder = () => {
  const trans = useTranslations('Global');
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [moreCounter, setMoreCounter] = useState<number>(0);
  const [funders, setFunders] = useState<AffiliationSearch[]>([]);
  const [nextCursor, setNextCursor] = useState<string|null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [addProjectFunder] = useAddProjectFunderMutation({});
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  /**
   * Handle specific errors that we care about in this component.
   * @param {ProjectFunderErrors} errs - The errors from the graphql response
   */
  function checkErrors(errs: ProjectFunderErrors) {
    if (!errs) return;

    const typedKeys: (keyof ProjectFunderErrors)[] = [
      "affiliationId",
      "general",
      "projectId",
      "status",
    ];
    const newErrors = [];

    for (const k of typedKeys) {
      const errVal = errs[k];
      if (errVal) {
        newErrors.push(errVal);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
  }

  async function handleSelectFunder(funder: AffiliationSearch) {
    const NEXT_URL = routePath('projects.create.projectSearch', {projectId});

    const input = {
      projectId: Number(projectId),
      affiliationId: funder.uri
    }

    addProjectFunder({variables: { input }})
      .then((result) => {
        checkErrors(result.data.addProjectFunder?.errors as ProjectFunderErrors);
        router.push(NEXT_URL);
      })
      .catch((err) => {
        throw new LoggedError(err.message);
      });
  };

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

  /**
   * Checks if the useMore button should display or not.
   */
  function hasMore() {
    if (!nextCursor) return false;
    if (funders.length < totalCount) return true;
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
          <ErrorMessages errors={errors} ref={errorRef} />
          <FunderSearch
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
                      {trans('General.Select')}
                    </Button>
                  </div>
                ))}

                {(hasMore()) && (
                  <div className={styles.funderResultsListMore}>
                    <Button
                      data-testid="load-more-btn"
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

export default CreateProjectSearchFunder;
