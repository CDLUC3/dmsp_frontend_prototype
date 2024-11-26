'use client';

import React from 'react';
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
import PageHeader from "@/components/PageHeader";
import {Card, CardBody, CardFooter, CardHeading} from "@/components/Card/card";

const QuestionTypeSelectPage: React.FC = () => {

    const templates = [
        {
            title: 'Long text question',
            link: '/template/353535/q/q_mnopqr',
            text: 'For questions that require long answers, you can select formatting options too.',
            type: 'Text',
        },
        {
            title: 'Short text question',
            link: '/template/353535/q/q_mnopqr',
            text: 'For questions that require short, simple answers.',
            type: 'Text',
        },
        {
            title: 'URL field',
            link: '/template/353535/q/q_mnopqr',
            text: 'When you need the user to supply a URL. Includes validation for proper URL format.',
            type: 'URL',
        },
        {
            title: 'Radio selection',
            link: '/template/353535/q/q_mnopqr',
            text: 'For simple questions with only valid answer. Perfect for multiple choice questions.',
            type: 'Choice',
        },
        {
            title: 'Checkbox group',
            link: '/template/353535/q/q_mnopqr',
            text: 'For questions with multiple valid answers. Allows users to select multiple options.',
            type: 'Choice',
        }];

    const templates_others = [
        {
            title: 'ORCID search',
            link: '/template/353535/q/q_mnopqr',
            text: 'Search and select a researcher using their ORCID identifier.',
            type: 'Lookup',
        },
        {
            title: 'Repository select',
            link: '/template/353535/q/q_mnopqr',
            text: 'When users need to select or create a repository for their data.',
            type: 'Lookup',
        },
        {
            title: 'License selection',
            link: '/template/353535/q/q_mnopqr',
            text: 'For when users need to select a license for their content.',
            type: 'Lookup',
        },
    ];

    return (
        <>
            <PageHeader
                title="What type of question would you like to add?"
                description="As you create your template, you can choose different types of questions to add to it, depending on the type of information you require from the plan creator. "
                showBackButton={true}
                breadcrumbs={
                    <Breadcrumbs>
                        <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
                        <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
                        <Breadcrumb>Question</Breadcrumb>
                    </Breadcrumbs>
                }
                actions={null}
                className=""
            />
            <div className="Filters">
                <SearchField>
                    <Label>Search by keyword</Label>
                    <Input/>
                    <Button>Search</Button>
                    <FieldError/>
                    <Text slot="description" className="help">
                        Search by field type or description.
                    </Text>
                </SearchField>
            </div>
            <div>
                <h2>
                    Standard
                </h2>
                <div className="card-grid-list">
                    {templates.map((template, index) => (
                        <Card key={index}>
                            <CardHeading>{template.title}</CardHeading>
                            <CardBody>
                                <p>{template.text}</p>
                            </CardBody>
                            <CardFooter>
                                <Link
                                    href={template.link}
                                    className="button-link secondary"
                                    data-type={template.type}
                                >
                                    Select
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <h2>
                    Other types of questions
                </h2>
                <div className="card-grid-list">
                    {templates_others.map((template, index) => (
                        <Card key={index}>
                            <CardHeading>{template.title}</CardHeading>
                            <CardBody>
                                <p>{template.text}</p>
                            </CardBody>
                            <CardFooter>
                                <Link
                                    href={template.link}
                                    className="button-link secondary"
                                    data-type={template.type}
                                >
                                    Select
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

export default QuestionTypeSelectPage;
