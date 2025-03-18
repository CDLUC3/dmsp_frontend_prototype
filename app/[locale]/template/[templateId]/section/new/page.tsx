'use client';

import React, {useEffect, useRef, useState} from 'react';
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
import {ApolloError} from "@apollo/client";
import {useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';

import logECS from '@/utils/clientLogger';
import {Question, Section, useTemplateQuery} from '@/generated/graphql';

// Components
import {ContentContainer, LayoutContainer,} from '@/components/Container';
import PageHeader from "@/components/PageHeader";
import {Card, CardBody, CardFooter, CardHeading} from "@/components/Card/card";
import ErrorMessages from '@/components/ErrorMessages';

interface SectionInterface {
  id?: number | null;
  name: string;
  displayOrder?: number | null;
  bestPractice?: boolean | null;
  questions?: Question[] | undefined | null;
}


const SectionTypeSelectPage: React.FC = () => {
  const [errors, setErrors] = useState<string[]>([]);
  const [sections, setSections] = useState<SectionInterface[]>([]);
  const [filteredSections, setFilteredSections] = useState<(SectionInterface)[] | null>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  //For scrolling to error in modal window
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Get templateId param
  const params = useParams();
  const { templateId } = params; // From route /template/:templateId


  //Localization keys
  const AddNewSection = useTranslations('SectionTypeSelectPage');
  const Global = useTranslations('Global');


  // Run template query to get all templates under the given templateId
  const { data, loading, error: templateQueryErrors, refetch } = useTemplateQuery(
    {
      variables: { templateId: Number(templateId) },
      notifyOnNetworkStatusChange: true // To re-render component whenever network status of query changes
    }
  );

  function sortSectionsByDisplayOrder(sections: (Section | null)[]): Section[] {
    // Filter out null values and ensure type safety
    const validSections = sections.filter((section): section is Section => {
      return section !== null && section !== undefined;
    });

    return validSections.sort((a, b) => {
      const orderA = a.displayOrder ?? Infinity;
      const orderB = b.displayOrder ?? Infinity;

      return orderA - orderB;
    });
  }

  //Update searchTerm state whenever entry in the search field changes
  const handleSearchInput = (value: string) => {
    setSearchTerm(value);
  }

  // Filter results when a user enters a search term and clicks "Search" button
  const handleFiltering = (term: string) => {
    setSearchTerm(term);
    setErrors([]);
    // Filter org sections
    const filteredList = sections.filter(item =>
      item?.name.toLowerCase().includes(term.toLowerCase())
    );

    if (filteredList.length === 0) {
      const errorMessage = Global('messaging.noItemsFound');
      setErrors(prev => [...prev, errorMessage]);
    }

    setFilteredSections(filteredList);
  }

  useEffect(() => {
    // When data from backend changes, set template data in state
    if (data && data.template) {
      if (data.template?.sections) {
        const sectionsArray = data.template.sections ?? [];

        const sortedOrgSections = sortSectionsByDisplayOrder(sectionsArray);
        sortedOrgSections?.map(section => {
          const sectionObj = {
            id: section?.id ?? null,
            name: section?.name ?? '',
            displayOrder: section?.displayOrder,
            bestPractice: section?.bestPractice,
            questions: section?.questions
          }

          setSections(prev => prev.concat(sectionObj));
        })
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
    }
  }, [searchTerm])

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
              onClear={() => { setFilteredSections(null) }}
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
                      .filter(section => section?.bestPractice === false)
                      .map((section, index) => (
                        <Card key={index}>
                          <CardHeading>{section.name}</CardHeading>
                          <CardBody>
                            {AddNewSection.rich("questionsCount", {
                              count: section.questions ? section.questions.length : 0, // Inject the dynamic questions count
                              p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                            })}
                          </CardBody>
                          <CardFooter>
                            <Link href={`/template/${templateId}/section/${section.id}`}
                              className="button-link secondary">{Global('buttons.select')}</Link>
                          </CardFooter>
                        </Card>
                      ))
                  }
                </>
              ) : (
                <>
                  {
                    sections
                      .filter(section => section?.bestPractice === false)
                      .map((section, index) => (
                        <Card key={index}>
                          <CardHeading>{section.name}</CardHeading>
                          <CardBody>
                            {AddNewSection.rich("questionsCount", {
                              count: section.questions ? section.questions.length : 0, // Inject the dynamic questions count
                              p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                            })}
                          </CardBody>
                          <CardFooter>
                            <Link href={`/template/${templateId}/section/${section.id}`}
                              className="button-link secondary">Select</Link>
                          </CardFooter>
                        </Card>
                      ))
                  }
                </>
              )
              }
            </div>

            <h2>
              {AddNewSection('headings.bestPracticeSections')}
            </h2>

            {/*Best Practice sections */}
            <div className="card-grid-list">
              {filteredSections && filteredSections.length > 0 ? (
                <>
                  {
                    filteredSections
                      .filter(section => section?.bestPractice === true)
                      .map((section, index) => (
                        <Card key={index}>
                          <CardHeading>{section.name}</CardHeading>
                          <CardBody>
                            {AddNewSection.rich("questionsCount", {
                              count: section.questions ? section.questions.length : 0, // Inject the dynamic questions count
                              p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                            })}
                          </CardBody>
                          <CardFooter>
                            <Link href={`/template/${templateId}/section/${section.id}`}
                              className="button-link secondary">{Global('buttons.select')}</Link>
                          </CardFooter>
                        </Card>
                      ))
                  }
                </>
              ) : (
                <>
                  {
                    sections
                      .filter(section => section?.bestPractice === true)
                      .map((section, index) => (
                        <Card key={index}>
                          <CardHeading>{section.name}</CardHeading>
                          <CardBody>
                            {AddNewSection.rich("questionsCount", {
                              count: section.questions ? section.questions.length : 0, // Inject the dynamic questions count
                              p: (chunks) => <p>{chunks}</p>, // Replace <p> with React <p>
                            })}
                          </CardBody>
                          <CardFooter>
                            <Link href={`/template/${templateId}/section/${section.id}`}
                              className="button-link secondary">Select</Link>
                          </CardFooter>
                        </Card>
                      ))
                  }
                </>
              )
              }
            </div>


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
