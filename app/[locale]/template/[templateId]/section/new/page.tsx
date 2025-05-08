'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { ApolloError } from "@apollo/client";
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

import logECS from '@/utils/clientLogger';
import { useAddSectionMutation, usePublishedSectionsQuery } from '@/generated/graphql';

// Components
import { ContentContainer, LayoutContainer } from '@/components/Container';
import PageHeader from "@/components/PageHeader";
import { Card, CardBody, CardFooter, CardHeading } from "@/components/Card/card";
import ErrorMessages from '@/components/ErrorMessages';
import styles from './newSectionPage.module.scss';

interface SectionInterface {
  id?: number | null;
  name: string;
  modified?: string | null;
  bestPractice?: boolean | null;
  isDirty?: boolean | null;
  templateName?: string | null;
  questionCount?: number | null;
}


const SectionTypeSelectPage: React.FC = () => {
  const VISIBLE_CARD_COUNT = 6;

  const [errors, setErrors] = useState<string[]>([]);
  const [sections, setSections] = useState<SectionInterface[]>([]);
  const [bestPracticeSections, setBestPracticeSections] = useState<SectionInterface[]>([]);
  const [filteredSections, setFilteredSections] = useState<(SectionInterface)[] | null>([]);
  const [filteredBestPracticeSections, setFilteredBestPracticeSections] = useState<(SectionInterface)[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Visibility counts
  const [visibleCount, setVisibleCount] = useState({
    sections: VISIBLE_CARD_COUNT,
    filteredSections: VISIBLE_CARD_COUNT,
    bestPracticeSections: VISIBLE_CARD_COUNT,
    filteredBestPracticeSections: VISIBLE_CARD_COUNT
  });
  const nextSectionsRef = useRef<HTMLDivElement>(null);
  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Get templateId param
  const params = useParams();
  const toastState = useToast();
  const router = useRouter();
  const { templateId: rawTemplateId } = params; // From route /template/:templateId
  // routePath requires this to be a string but it can be either a string or an array
  const templateId = Array.isArray(rawTemplateId) ? rawTemplateId[0] : rawTemplateId;

  // Initialize user addSection mutation
  const [addSectionMutation] = useAddSectionMutation();

  //Localization keys
  const AddNewSection = useTranslations('SectionTypeSelectPage');
  const createSection = useTranslations('CreateSectionPage');
  const Global = useTranslations('Global');

  // Run template query to get all templates under the given templateId
  const { data, loading, error: templateQueryErrors, refetch } = usePublishedSectionsQuery(
    {
      variables: { term: '' },
      notifyOnNetworkStatusChange: true // To re-render component whenever network status of query changes
    }
  );

  // Show Failure Message
  const showFailureToast = () => {
    const errorMessage = createSection('messages.errorCreatingSection');
    toastState.add(errorMessage, { type: 'error' });
  }

  // Make GraphQL mutation request to clone a section
  const copyPublishedSection = async (section: SectionInterface): Promise<SectionInterface | null> => {
    if (section) {
      try {
        const response = await addSectionMutation({
          variables: {
            input: {
              templateId: Number(templateId),
              copyFromVersionedSectionId: section.id,
              name: section.name,
            }
          }
        });

        if (response.data?.addSection) {
          const errs = Array.isArray(response.data?.addSection?.errors) ? response.data.addSection.errors : {};
          if (errs && Object.values(errs).filter((err) => err && err !== 'SectionErrors').length === 0) {
            // redirect to the edit section page for the newly copied section
            router.push(`/template/${templateId}/section/${response.data.addSection.id}`);
          } else {
            showFailureToast();
          }
        }
      } catch (error) {
        logECS('error', 'copyPublishedSection', {
          error,
          url: { path: '/template/[templateId]/section/new' }
        });
        showFailureToast();
      }
    }
    return section;
  };

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setSearchTerm(term);
    setErrors([]);

    // Filter org sections
    const filteredSectionsList = sections.filter(item =>
      item?.name.toLowerCase().includes(term.toLowerCase())
    );
    const filteredBestPracticeSectionsList = bestPracticeSections.filter(item =>
      item?.name.toLowerCase().includes(term.toLowerCase())
    );

    if (filteredSectionsList.length === 0 && filteredBestPracticeSectionsList.length === 0) {
      const errorMessage = Global('messaging.noItemsFound');
      setErrors(prev => [...prev, errorMessage]);
    }

    setFilteredSections(filteredSectionsList);
    // Filter best practice sections and exclude if they are already in the org sections
    setFilteredBestPracticeSections(filteredBestPracticeSectionsList.filter(
      item => !filteredSectionsList.some(sect => sect.name === item.name)
    ));
  }

  useEffect(() => {
    // When data from backend changes, set template data in state
    if (data && data.publishedSections) {
      const publishedSections = data.publishedSections.items ?? [];
      if (publishedSections.length > 0) {
        const transformedSections = publishedSections?.map(section => {
          return {
            id: section?.id ?? null,
            name: section?.name ?? '',
            modified: section?.modified,
            bestPractice: section?.bestPractice ?? false,
            templateName: section?.versionedTemplateName ?? '',
            questionCount: section?.versionedQuestionCount
          }
        });

        const affiliationSections = transformedSections.filter(section => section?.bestPractice === false);
        const bestPracticeSections = transformedSections.filter(section => section?.bestPractice === true);

        setSections(affiliationSections);
        // Filter best practice sections and exclude if they are already in the org sections
        setBestPracticeSections(bestPracticeSections.filter(
          item => !affiliationSections.some(affiliation => affiliation.name === item.name)
        ));
      }

    }
  }, [data]);

  useEffect(() => {
    if (templateQueryErrors) {
      // Need to refetch on apollo errors to re-render page
      if (templateQueryErrors instanceof ApolloError) {
        refetch();
      } else {
        // Display other errors
        setErrors(prevErrors => [...prevErrors, Global('messaging.somethingWentWrong')]);
        logECS('error', 'templateQueryErrors', {
          error: templateQueryErrors,
          url: { path: '/template/[templateId]/section/new' }
        });
      }
    }
  }, [templateQueryErrors]);

  useEffect(() => {
    // Need this to set list of templates back to original, full list after filtering
    if (searchTerm === '') {
      setFilteredSections(null);
      setFilteredBestPracticeSections(null);
    }
  }, [searchTerm])

  type VisibleCountKeys = keyof typeof visibleCount;
  // When user clicks the 'Load more' button, display more cards
  const handleLoadMore = (listKey: VisibleCountKeys) => {
    setVisibleCount((prevCounts) => ({
      ...prevCounts,
      [listKey]: prevCounts[listKey] + VISIBLE_CARD_COUNT, // Increase the visible count for the specific list
    }));

    setTimeout(() => {
      if (nextSectionsRef.current) {
        nextSectionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const renderLoadMore = (items: SectionInterface[], visibleCountKey: VisibleCountKeys) => {
    if (items.length - visibleCount[visibleCountKey] > 0) {
      const loadMoreNumber = items.length - visibleCount[visibleCountKey]; // Calculate loadMoreNumber
      const currentlyDisplayed = visibleCount[visibleCountKey];
      const totalAvailable = items.length;

      return (
        <>
          <Button onPress={() => handleLoadMore(visibleCountKey)}>
            {loadMoreNumber > VISIBLE_CARD_COUNT
              ? AddNewSection.rich('buttons.load6More', { name: loadMoreNumber })
              : AddNewSection.rich('buttons.loadMore', { name: loadMoreNumber })}
          </Button>
          <div className={styles.remainingText}>
            {AddNewSection('numDisplaying', { num: currentlyDisplayed, total: totalAvailable })}
          </div>
        </>
      );
    }
    return null;
  };

  // Show loading message
  if (loading) {
    return <div>{Global('messaging.loading')}...</div>;
  }

  return (
    <>
      <PageHeader
        title={AddNewSection('headings.addNewSection')}
        description={AddNewSection('intro')}
        showBackButton={false}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">{Global('breadcrumbs.templates')}</Link></Breadcrumb>
            <Breadcrumb><Link href={`/template/${templateId}`}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.addNewSection')}</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />

      <LayoutContainer>
        <ContentContainer>
          <div className="Filters" ref={errorRef}>
            <ErrorMessages errors={errors} ref={errorRef} />
            <SearchField
              onClear={() => {
                setFilteredSections(null);
                setFilteredBestPracticeSections(null);
              }}
            >
              <Label>{AddNewSection('search.label')}</Label>
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
                {AddNewSection('search.helpText')}
              </Text>
            </SearchField>
          </div>

          <div>
            <h2>
              {AddNewSection('headings.previouslyCreatedSections')}
            </h2>

            {/*Organization Sections */}
            <div className="card-grid-list">
              {filteredSections && filteredSections.length > 0 ? (
                <>
                  {
                    filteredSections
                      .slice(0, visibleCount['filteredSections'])
                      .filter(section => section?.bestPractice === false)
                      .map((section, index) => {
                        const isFirstInNextSection = index === visibleCount['filteredSections'] - VISIBLE_CARD_COUNT;
                        return (
                          <div ref={isFirstInNextSection ? nextSectionsRef : null} key={index}>
                            <Card>
                              <CardHeading>{section.name}</CardHeading>
                              <CardBody>
                                <p>Template: {section.templateName}</p>
                                {AddNewSection.rich("questionsCount", {
                                  count: section.questionCount ? section.questionCount : 0,
                                  p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                                })}
                              </CardBody>
                              <CardFooter>
                                <Button
                                  onPress={() => copyPublishedSection(section)}
                                  className="button-link secondary">
                                  {Global('buttons.select')}
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        )
                      })
                  }
                </>
              ) : (
                <>
                  {
                    sections
                      .slice(0, visibleCount['sections'])
                      .filter(section => section?.bestPractice === false)
                      .map((section, index) => {
                        const isFirstInNextSection = index === visibleCount['sections'] - VISIBLE_CARD_COUNT;
                        return (
                          <div ref={isFirstInNextSection ? nextSectionsRef : null} key={index}>
                            <Card>
                              <CardHeading>{section.name}</CardHeading>
                              <CardBody>
                                <p>Template: {section.templateName}</p>
                                {AddNewSection.rich("questionsCount", {
                                  count: section.questionCount ? section.questionCount : 0,
                                  p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                                })}
                              </CardBody>
                              <CardFooter>
                                <Button
                                  onPress={() => copyPublishedSection(section)}
                                  className="button-link secondary">
                                  {Global('buttons.select')}
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        )
                      })
                  }
                </>
              )
             }
            </div>

            {((filteredSections && filteredSections.length > 0) || (sections && sections.length > 0)) && (
              <div className={styles.loadBtnContainer}>
                {filteredSections && filteredSections.length > 0
                  ? renderLoadMore(filteredSections, 'filteredSections')
                  : renderLoadMore(sections, 'sections')}
              </div>
            )}

            <h2>
              {AddNewSection('headings.bestPracticeSections')}
            </h2>

            {/*Best Practice sections */}
            <div className="card-grid-list">
              {filteredBestPracticeSections && filteredBestPracticeSections.length > 0 ? (
                <>
                  {
                    filteredBestPracticeSections
                      .slice(0, visibleCount['filteredBestPracticeSections'])
                      .filter(section => section?.bestPractice === true)
                      .map((section, index) => {
                        const isFirstInNextSection = index === visibleCount['filteredBestPracticeSections'] - VISIBLE_CARD_COUNT;
                        return (
                          <div ref={isFirstInNextSection ? nextSectionsRef : null} key={index}>
                            <Card>
                              <CardHeading>{section.name}</CardHeading>
                              <CardBody>
                                <p>Template: {section.templateName}</p>
                                {AddNewSection.rich("questionsCount", {
                                  count: section.questionCount ? section.questionCount : 0,
                                  p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                                })}
                              </CardBody>
                              <CardFooter>
                                <Button
                                  onPress={() => copyPublishedSection(section)}
                                  className="button-link secondary">
                                  {Global('buttons.select')}
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        )
                      })
                  }
                </>
              ) : (
                <>
                  {
                    bestPracticeSections
                      .slice(0, visibleCount['bestPracticeSections'])
                      .filter(section => section?.bestPractice === true)
                      .map((section, index) => {
                        const isFirstInNextSection = index === visibleCount['bestPracticeSections'] - VISIBLE_CARD_COUNT;
                        return (
                          <div ref={isFirstInNextSection ? nextSectionsRef : null} key={index}>
                            <Card>
                              <CardHeading>{section.name}</CardHeading>
                              <CardBody>
                                <p>Template: {section.templateName}</p>
                                {AddNewSection.rich("questionsCount", {
                                  count: section.questionCount ? section.questionCount : 0,
                                  p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                                })}
                              </CardBody>
                              <CardFooter>
                                <Button
                                  onPress={() => copyPublishedSection(section)}
                                  className="button-link secondary">
                                  {Global('buttons.select')}
                                </Button>
                              </CardFooter>
                            </Card>
                          </div>
                        )
                      })
                  }
                </>
              )
              }
            </div>
            {((filteredBestPracticeSections && filteredBestPracticeSections.length > 0)
              || (bestPracticeSections && bestPracticeSections.length > 0)) && (
              <div className={styles.loadBtnContainer}>
                {filteredBestPracticeSections && filteredBestPracticeSections.length > 0
                  ? renderLoadMore(filteredBestPracticeSections, 'filteredBestPracticeSections')
                  : renderLoadMore(bestPracticeSections, 'bestPracticeSections')}
              </div>
            )}


            <h2>
              {AddNewSection('headings.buildNewSection')}
            </h2>
            <p>
              {AddNewSection('newSectionDescription')}
            </p>
            <Link href={`/template/${templateId}/section/create`}
              className="button-link secondary">{AddNewSection('buttons.createNew')}</Link>
          </div>
        </ContentContainer>
      </LayoutContainer>
    </>
  );
}

export default SectionTypeSelectPage;
