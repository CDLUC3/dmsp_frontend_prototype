'use client';

import { useEffect, useRef, useState } from 'react';
import { ApolloError } from "@apollo/client";
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
import {
    Card,
    CardBody,
    CardFooter,
    CardHeading
} from "@/components/Card/card";

import {
    ContentContainer,
    LayoutContainer,
} from '@/components/Container';

import QuestionEdit from '@/components/QuestionEdit';

//GraphQL
import {
    useQuestionTypesQuery,
    useQuestionsDisplayOrderQuery,
    useAddQuestionMutation,
} from '@/generated/graphql';

//Other
import logECS from '@/utils/clientLogger';
import { useToast } from '@/context/ToastContext';
import { useQueryStep } from '@/app/[locale]/template/[templateId]/q/new/utils';
import styles from './newQuestion.module.scss';

interface QuestionTypesInterface {
    id: number;
    errors: string[];
    name: string;
    usageDescription: string;
}

const QuestionTypeSelectPage: React.FC = () => {
    // Get templateId param
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const topRef = useRef<HTMLDivElement>(null);
    const toastState = useToast();
    const sectionId = searchParams.get("section_id"); // from query param
    const { templateId } = params; // From route /template/:templateId

    // State management
    const [step, setStep] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredQuestionTypes, setFilteredQuestionTypes] = useState<QuestionTypesInterface[] | null>([]);
    const [questionTypes, setQuestionTypes] = useState<QuestionTypesInterface[]>([]);
    const [maxDisplayOrderNum, setMaxDisplayOrderNum] = useState<number>(0);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);
    const [questionTypeId, setQuestionTypeId] = useState<number | null>(null);
    const [errors, setErrors] = useState<string[]>([]);

    const stepQueryValue = useQueryStep();

    //Localization keys
    const Global = useTranslations('Global');


    // Make graphql request for question types
    const { data, loading, error: queryError } = useQuestionTypesQuery({
        /* Force Apollo to notify React of changes. This was needed for when refreshTokens needs to be called on a 401 error*/
        notifyOnNetworkStatusChange: true,
    });

    // GraphQL mutation for adding new question
    const [addQuestionMutation] = useAddQuestionMutation({
        notifyOnNetworkStatusChange: true,
    });

    // Query for all questions for the given section in order to determine the correct displayOrder for the new question
    const { data: questionsDisplayOrder } = useQuestionsDisplayOrderQuery({
        variables: {
            sectionId: Number(sectionId)
        }
    })

    const resetSearch = () => {
        setSearchTerm('');
        setFilteredQuestionTypes(null);
        scrollToTop();
    }

    const scrollToTop = () => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth' });
            topRef.current.focus();
        }
    }

    // Get the current max display order number + 1
    const getNewDisplayOrder = () => {
        return maxDisplayOrderNum + 1;
    }

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
        } else {
            //If there are no matching results, then display an error
            setErrors(prev => [...prev, Global('messaging.noItemsFound')]);
        }
    }

    const clearErrors = () => {
        setErrors([]);
    }

    const onSelect = async (questionTypeId: number) => {
        let newQuestionId;
        const newDisplayOrder = getNewDisplayOrder();
        //Add the new template
        try {
            const response = await addQuestionMutation({
                variables: {
                    input: {
                        displayOrder: newDisplayOrder,
                        questionTypeId: questionTypeId,
                        sectionId: Number(sectionId),
                        templateId: Number(templateId),
                        questionText: ' ',//Needed to add this because questionText is required to add a new question
                        required: false
                    }
                },
            });
            if (response?.data) {
                const responseData = response?.data?.addQuestion;
                if (responseData && responseData.errors && responseData.errors.length > 0) {
                    // Use the nullish coalescing operator to ensure `setErrors` receives a `string[]`
                    setErrors(responseData.errors ?? []);
                }
                clearErrors();

                newQuestionId = response?.data?.addQuestion?.id;
            }
        } catch (err) {
            if (err instanceof ApolloError) {
                if (err.message === 'Forbidden') {
                    toastState.add('Your session has timed out. Please log in', { type: 'error' })
                    router.push(`/login`);
                }
            } else {
                logECS('error', 'handleClick', {
                    error: err,
                    url: { path: '/template/create' }
                });
            }

        }

        // Redirect to the newly created template
        if (newQuestionId) {
            router.push(`/template/${templateId}/q/${newQuestionId}`)
        }
    }

    useEffect(() => {
        // When data from backend changes, set template data in state
        if (data && data?.questionTypes) {
            if (data.questionTypes.length > 0) {
                setQuestionTypes(data.questionTypes);
            }
        }
    }, [data]);

    useEffect(() => {
        if (questionsDisplayOrder?.questions && questionsDisplayOrder.questions.length > 0) {
            const questions = questionsDisplayOrder.questions;

            // Find the maximum displayOrder
            const maxDisplayOrder = questions.reduce(
                (max: number, question) => (question?.displayOrder ?? -Infinity) > max ? question?.displayOrder ?? max : max,
                0
            );

            setMaxDisplayOrderNum(maxDisplayOrder);
        }
    }, [questionsDisplayOrder])

    useEffect(() => {
        // Need this to set list of templates back to original, full list after filtering
        if (searchTerm === '') {
            resetSearch();
            setSearchButtonClicked(false);
        }
    }, [searchTerm])

    useEffect(() => {
        // If a step was specified in a query param, then set that step
        if (step !== stepQueryValue) {
            setStep(stepQueryValue);
        }
    }, [stepQueryValue])

    return (
        <>
            {step === 1 && (
                <>
                    <PageHeader
                        title="What type of question would you like to add?"
                        description="As you create your template, you can choose different types of questions to add to it, depending on the type of information you require from the plan creator. "
                        showBackButton={false}
                        breadcrumbs={
                            <Breadcrumbs>
                                <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
                                <Breadcrumb><Link href={`/template/${templateId}`}>Edit Template</Link></Breadcrumb>
                                <Breadcrumb>Question</Breadcrumb>
                            </Breadcrumbs>
                        }
                        actions={null}
                        className=""
                    />

                    <LayoutContainer>
                        <ContentContainer>
                            {errors && errors.length > 0 &&
                                <div className="error">
                                    {errors.map((error, index) => (
                                        <p key={index}>{error}</p>
                                    ))}
                                </div>
                            }
                            <div className="Filters" ref={topRef}>
                                <SearchField>
                                    <Label>Search by keyword</Label>
                                    <Input
                                        aria-describedby="search-help"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)} />
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
                                        Search by field type or description.
                                    </Text>
                                </SearchField>
                            </div>
                            <div>
                                {(searchTerm.length > 0 && searchButtonClicked) && (
                                    <div className={styles.searchMatchText}> {Global('messaging.resultsText', { name: filteredQuestionTypes?.length })} - <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>clear filter</Link></div>
                                )}
                                <div className="card-grid-list">
                                    {filteredQuestionTypes && filteredQuestionTypes.length > 0 ? (
                                        <>
                                            {filteredQuestionTypes.map((questionType, index) => (
                                                <Card key={index}>
                                                    <CardHeading>{questionType.name}</CardHeading>
                                                    <CardBody>
                                                        <p>{questionType.usageDescription}</p>
                                                    </CardBody>
                                                    <CardFooter>
                                                        <Button
                                                            className="button-link secondary"
                                                            data-type={questionType.id}
                                                            onPress={e => onSelect(questionType.id)}
                                                        >
                                                            Select
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
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
                                                    {questionTypes.map((questionType, index) => (
                                                        <Card key={index}>
                                                            <CardHeading>{questionType.name}</CardHeading>
                                                            <CardBody>
                                                                <p>{questionType.usageDescription}</p>
                                                            </CardBody>
                                                            <CardFooter>
                                                                <Button
                                                                    className="button-link secondary"
                                                                    data-type={questionType.id}
                                                                    onPress={e => onSelect(questionType.id)}
                                                                >
                                                                    Select
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    ))}
                                                </>
                                            )
                                            }
                                        </>
                                    )

                                    }
                                </div>
                                {(searchTerm.length > 0 && searchButtonClicked) && (
                                    <div className={styles.clearFilter}>
                                        <div className={styles.searchMatchText}> {Global('messaging.resultsText', { name: filteredQuestionTypes?.length })} - <Link onPress={resetSearch} href="/" className={styles.searchMatchText}>clear filter</Link></div>
                                    </div>
                                )}
                            </div>

                        </ContentContainer>
                    </LayoutContainer>
                </>
            )}
            {step === 2 && (
                <QuestionEdit questionTypeId={questionTypeId} />
            )}
        </>
    );
}

export default QuestionTypeSelectPage;
