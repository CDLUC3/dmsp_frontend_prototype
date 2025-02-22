'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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

// Components
import PageHeader from "@/components/PageHeader";
import { ContentContainer, LayoutContainer, } from '@/components/Container';
import QuestionAdd from '@/components/QuestionAdd';
import QuestionTypeCard from '@/components/QuestionTypeCard';
import ErrorMessages from '@/components/ErrorMessages';

//GraphQL
import { useQuestionTypesQuery } from '@/generated/graphql';

//Other
import { useQueryStep } from '@/app/[locale]/template/[templateId]/q/new/utils';
import { QuestionTypesInterface } from '@/app/types';
import styles from './newQuestion.module.scss';


const QuestionTypeSelectPage: React.FC = () => {
    // Get templateId param
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const topRef = useRef<HTMLDivElement>(null);
    //For scrolling to error in page
    const errorRef = useRef<HTMLDivElement | null>(null);
    const { templateId } = params; // From route /template/:templateId
    const sectionId = searchParams.get('section_id');
    const questionId = searchParams.get('questionId');// if user is switching their question type while editing an existing question

    // State management
    const [step, setStep] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredQuestionTypes, setFilteredQuestionTypes] = useState<QuestionTypesInterface[] | null>([]);
    const [questionTypes, setQuestionTypes] = useState<QuestionTypesInterface[]>([]);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);
    const [selectedQuestionType, setSelectedQuestionType] = useState<{ questionTypeId: number, questionTypeName: string }>();
    const [errors, setErrors] = useState<string[]>([]);

    const stepQueryValue = useQueryStep();

    //Localization keys
    const Global = useTranslations('Global');
    const QuestionTypeSelect = useTranslations('QuestionTypeSelectPage');

    // Make graphql request for question types
    const { data, loading, error: queryError } = useQuestionTypesQuery();

    const handleSelect = (questionTypeId: number, questionTypeName: string) => {
        if (questionId) {
            //If the user came from editing an existing question, we want to return them to that page with the new questionTypeId
            router.push(`/template/${templateId}/q/${questionId}?questionTypeId=${questionTypeId}`)
        } else {
            // redirect to the Question Edit page if a user is adding a new question
            if (questionTypeId) {
                setSelectedQuestionType({ questionTypeId, questionTypeName })
                setStep(2);
                router.push(`/template/${templateId}/q/new?section_id=${sectionId}&step=2`)
            }
        }
    }

    const scrollToTop = useCallback(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth' });
            topRef.current.focus();
        }
    }, []);


    const resetSearch = useCallback(() => {
        setSearchTerm('');
        setFilteredQuestionTypes(null);
        scrollToTop();
    }, [scrollToTop]);


    const filterQuestionTypes = (
        questionTypes: QuestionTypesInterface[],
        term: string
    ): QuestionTypesInterface[] =>
        questionTypes.filter(qt =>
            [qt.name, qt.usageDescription].some(field =>
                field?.toLowerCase().includes(term.toLowerCase())
            )
        );

    // Filter results when a user enters a search term and clicks "Search" button
    const handleFiltering = (term: string) => {
        setSearchButtonClicked(true);
        setErrors([]);

        // Search title, funder and description fields for terms
        const filteredQuestionTypes = filterQuestionTypes(questionTypes, term);

        if (filteredQuestionTypes.length > 0) {
            setFilteredQuestionTypes(filteredQuestionTypes.length > 0 ? filteredQuestionTypes : null);
        }
    }

    useEffect(() => {
        // When data from backend changes, set template data in state
        if (data?.questionTypes) {
            // filter out any null values
            const filteredQuestionTypes = data.questionTypes.filter((qt): qt is QuestionTypesInterface => qt !== null);
            if (data.questionTypes.length > 0) {
                setQuestionTypes(filteredQuestionTypes);
            }
        }
    }, [data]);

    useEffect(() => {
        if (queryError) {
            setErrors(prev => [...prev, queryError.message]);
        }
    }, [queryError])

    useEffect(() => {
        // Need this to set list of templates back to original, full list after filtering
        if (searchTerm === '') {
            resetSearch();
            setSearchButtonClicked(false);
        }
    }, [searchTerm, resetSearch])

    useEffect(() => {
        // If a step was specified in a query param, then set that step
        if (step !== stepQueryValue) {
            setStep(stepQueryValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepQueryValue])

    // TODO: Implement shared loading
    if (loading) {
        return <div>{Global('messaging.loading')}...</div>;
    }

    return (
        <>
            {step === 1 && (
                <>
                    <PageHeader
                        title={QuestionTypeSelect('title')}
                        description={QuestionTypeSelect('description')}
                        showBackButton={false}
                        breadcrumbs={
                            <Breadcrumbs>
                                <Breadcrumb><Link href="/">{Global('breadcrumbs.home')}</Link></Breadcrumb>
                                <Breadcrumb><Link href={`/template/${templateId}`}>{Global('breadcrumbs.editTemplate')}</Link></Breadcrumb>
                                <Breadcrumb>{Global('breadcrumbs.question')}</Breadcrumb>
                            </Breadcrumbs>
                        }
                        actions={null}
                        className=""
                    />

                    <LayoutContainer>
                        <ContentContainer>
                            <ErrorMessages errors={errors} ref={errorRef} />
                            <div className="Filters" ref={topRef}>
                                <SearchField>
                                    <Label>{Global('labels.searchByKeyword')}</Label>
                                    <Input
                                        aria-describedby="search-help"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)} />
                                    <Button
                                        onPress={() => {
                                            handleFiltering(searchTerm);
                                        }}
                                    >
                                        {Global('buttons.search')}
                                    </Button>
                                    <FieldError />
                                    <Text slot="description" className="help">
                                        {QuestionTypeSelect('searchHelpText')}
                                    </Text>
                                </SearchField>
                            </div>
                            <div>
                                {/*Show # of results with clear filter link*/}
                                {(searchTerm.length > 0 && searchButtonClicked) && (
                                    <div className={styles.searchMatchText}> {Global('messaging.resultsText', { name: filteredQuestionTypes?.length })} - <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>{QuestionTypeSelect('links.clearFilter')}</Link></div>
                                )}
                                <div className="card-grid-list">
                                    {filteredQuestionTypes && filteredQuestionTypes.length > 0 ? (
                                        <>
                                            {filteredQuestionTypes.map((questionType) => (
                                                <QuestionTypeCard
                                                    key={questionType.id}
                                                    questionType={questionType}
                                                    handleSelect={handleSelect}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {/**If the user is searching, and there were no results from the search
                                 * then display the message 'no results found
                                 */}
                                            {(searchTerm.length > 0 && searchButtonClicked) ? (
                                                <>
                                                    {Global('messaging.noItemsFound')}
                                                </>
                                            ) : (
                                                <>
                                                    {questionTypes.map((questionType) => (
                                                        <QuestionTypeCard
                                                            key={questionType.id}
                                                            questionType={questionType}
                                                            handleSelect={handleSelect}
                                                        />
                                                    ))}
                                                </>
                                            )
                                            }
                                        </>
                                    )

                                    }
                                </div>
                                {/*Show # of results with clear filter link*/}
                                {(searchTerm.length > 0 && searchButtonClicked) && (
                                    <div className={styles.clearFilter}>
                                        <div className={styles.searchMatchText}> {Global('messaging.resultsText', { name: filteredQuestionTypes?.length })} - <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>{QuestionTypeSelect('links.clearFilter')}</Link></div>
                                    </div>
                                )}
                            </div>
                        </ContentContainer>
                    </LayoutContainer>
                </>
            )}
            {step === 2 && (
                <>
                    {/*Show Edit Question form*/}
                    <QuestionAdd
                        questionTypeId={selectedQuestionType?.questionTypeId ?? null}
                        questionTypeName={selectedQuestionType?.questionTypeName ?? null}
                        sectionId={sectionId ? sectionId : ''}
                    />
                </>
            )}
        </>
    );
}

export default QuestionTypeSelectPage;
