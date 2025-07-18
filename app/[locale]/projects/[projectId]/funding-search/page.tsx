'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { routePath } from '@/utils/routes';

import {
  AffiliationSearch,
  FunderPopularityResult,
  usePopularFundersLazyQuery,
  useAddProjectFundingMutation,
  ProjectFundingErrors,
} from '@/generated/graphql';
import { FunderSearchResults } from '@/app/types';
import logECS from "@/utils/clientLogger";

import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  Link,
} from "react-aria-components";

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutContainer,
} from "@/components/Container";
import FunderSearch from '@/components/FunderSearch';
import ErrorMessages from "@/components/ErrorMessages";

import styles from './ProjectsCreateProjectFundingSearch.module.scss';


const CreateProjectSearchFunder = () => {
  const globalTrans = useTranslations('Global');
  const trans = useTranslations('FunderSearch');
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [moreCounter, setMoreCounter] = useState<number>(0);
  const [funders, setFunders] = useState<AffiliationSearch[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [addProjectFunding] = useAddProjectFundingMutation({});
  const [errors, setErrors] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);

  const [popularFunders, setPopularFunders] = useState<FunderPopularityResult[]>([]);
  const [popularFundersQuery] = usePopularFundersLazyQuery({});

  useEffect(() => {
    // Manually calling the effect because the query specifies that some items
    // can be null, and we need to filter those potential null results out.
    popularFundersQuery().then(({data}) => {
      if (data?.popularFunders && data.popularFunders.length > 0) {
        const cleaned = data.popularFunders.filter((item) => item !== null)
        setPopularFunders(cleaned);
      }
    });
  }, []);

  /**
   * Handle specific errors that we care about in this component.
   * @param {ProjectFunderErrors} errs - The errors from the graphql response
   */
  function checkErrors(errs: ProjectFundingErrors): string[] {
    const noErrors = Object.values(errs).every(val => val === null);
    if (noErrors) return [];

    const typedKeys: (keyof ProjectFundingErrors)[] = [
      "affiliationId",
      "general",
      "projectId",
      "status",
    ];
    const newErrors: string[] = [];

    for (const k of typedKeys) {
      const errVal = errs[k];
      if (errVal) {
        newErrors.push(errVal);
      }
    }

    return newErrors
  }

  async function handleSelectFunder(funder: AffiliationSearch | FunderPopularityResult) {
    const NEXT_URL = routePath('projects.create.projects.search', {
      projectId: projectId as string,
    });
    const input = {
      projectId: Number(projectId),
      affiliationId: funder.uri
    }

    addProjectFunding({ variables: { input } })
      .then((result) => {
        const errs = checkErrors(result?.data?.addProjectFunding?.errors as ProjectFundingErrors);
        if (errs.length > 0) {
          setErrors(errs);
        } else {
          router.push(NEXT_URL);
        }
      })
      .catch((err) => {
        logECS(
          'error',
          'createProjectSearchFunder.addProjectFunding',
          {error: err.message}
        );
        setErrors([...errors, err.message])
      });
  };

  async function handleAddFunderManually() {
    // TODO:: Handle manual addition of funders
    // NOTE:: Reason we didn't implement this is because the template for the
    // target // URL doesn't exist. There is a separate ticket tracking this.
    // TODO:: Remember to update the test when this is finally updated
    console.log('TODO: Navigate to create funder page.');
  };

  function onResults(results: FunderSearchResults, isNew: boolean) {
    let validResults: AffiliationSearch[];
    if (results.items && results.items.length > 0) {
      validResults = results.items.filter((r): r is AffiliationSearch => r !== null)
    } else {
      validResults = [];
    }

    if (isNew) {
      setFunders(validResults);
    } else {
      setFunders(funders.concat(validResults));
    }

    setTotalCount(results.totalCount as number);

    if (results.nextCursor) {
      setNextCursor(results.nextCursor);
    }
    if (!hasSearched) setHasSearched(true);
  }

  /**
   * Checks if the useMore button should display or not.
   */
  function hasMore() {
    if (!nextCursor) return false;
    return (funders.length < totalCount);
  }

  return (
    <>
      <PageHeader
        title={trans('headerTitle')}
        description=""
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{globalTrans('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/projects">{globalTrans('breadcrumbs.projects')}</Link></Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-create-project-funding"
      />

      <LayoutContainer>
        <ContentContainer>
          <ErrorMessages errors={errors} ref={errorRef} />
          <FunderSearch
            onResults={onResults}
            moreTrigger={moreCounter}
          />

          {popularFunders.length > 0 && (
            <section aria-labelledby="popular-funders">
              <h3>{trans('popularTitle')}</h3>
              <div className={styles.popularFunders}>
                {popularFunders.map((funder, index) => (
                  <div
                    key={index}
                    className={styles.fundingResultsListItem}
                    role="group"
                    aria-label={`${trans('funder')}: ${funder.displayName}`}
                  >
                    <p className="funder-name">{funder.displayName}</p>
                    <Button
                      className="secondary select-button"
                      data-funder-uri={funder.uri}
                      onPress={() => handleSelectFunder(funder)}
                      aria-label={`${globalTrans('buttons.select')} ${funder.displayName}`}
                    >
                      {globalTrans('buttons.select')}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {funders.length > 0 && (
            <section aria-labelledby="funders-section">
              <h3 id="funders-section">{trans('found', { count: totalCount })}</h3>
              <div className={styles.fundingResultsList}>
                {funders.map((funder, index) => (
                  <div
                    key={index}
                    className={styles.fundingResultsListItem}
                    role="group"
                    aria-label={`${trans('funder')}: ${funder.displayName}`}
                  >
                    <p className="funder-name">{funder.displayName}</p>
                    <Button
                      className="secondary select-button"
                      data-funder-uri={funder.uri}
                      onPress={() => handleSelectFunder(funder)}
                      aria-label={`${globalTrans('buttons.select')} ${funder.displayName}`}
                    >
                      {globalTrans('buttons.select')}
                    </Button>
                  </div>
                ))}

                {(hasMore()) && (
                  <div className={styles.fundingResultsListMore}>
                    <Button
                      data-testid="load-more-btn"
                      onPress={() => setMoreCounter(moreCounter + 1)}
                      aria-label={globalTrans('buttons.loadMore')}
                    >
                      {globalTrans('buttons.loadMore')}
                    </Button>
                    <p>
                      {trans('showCount', {
                        count: funders.length,
                        total: totalCount,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {funders.length === 0 && hasSearched && (
            <section>
              <p>{trans('noResults')}</p>
            </section>
          )}

          {/* Add Funder Manually (Always Visible After Search) */}
          {hasSearched && (
            <section aria-labelledby="manual-section" className="mt-8">
              <h3 id="manual-section">{trans('addManuallyHeading')}</h3>
              <p>{trans('addManuallyText')}</p>
              <Button
                className="add-funder-button"
                onPress={() => handleAddFunderManually()}
                aria-label={trans('addManuallyLabel')}
              >
                {trans('addManuallyLabel')}
              </Button>
            </section>
          )}

        </ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default CreateProjectSearchFunder;
