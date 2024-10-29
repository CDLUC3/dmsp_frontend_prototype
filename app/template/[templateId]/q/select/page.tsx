'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {Card, CardBody, CardFooter, CardHeading} from "@/components/Card/card";

const QuestionTypeSelectPage: React.FC = () => {

  const templates = [
    {
      title: 'Long text question',
      link: '/template/tpl_2525235',
      text: 'For questions that require long answers, you can select formatting options too.',
      image: "https://via.placeholder.com/150",
    },
    {
      title: 'Short text question',
      link: '/template/short-text',
      text: 'For questions that require short, simple answers.',
      type: 'Text',
    },
    {
      title: 'URL field',
      link: '/template/url',
      text: 'When you need the user to supply a URL. Includes validation for proper URL format.',
      type: 'URL',
    },
    {
      title: 'Radio selection',
      link: '/template/radio',
      text: 'For simple questions with only valid answer. Perfect for multiple choice questions.',
      type: 'Choice',
    },
    {
      title: 'Checkbox group',
      link: '/template/checkbox',
      text: 'For questions with multiple valid answers. Allows users to select multiple options.',
      type: 'Choice',
    }];

  const  templates_others = [
    {
      title: 'ORCID search',
      link: '/template/orcid',
      text: 'Search and select a researcher using their ORCID identifier.',
      type: 'Lookup',
    },
    {
      title: 'Repository select',
      link: '/template/repository',
      text: 'When users need to select or create a repository for their data.',
      type: 'Lookup',
    },
    {
      title: 'License selection',
      link: '/template/license',
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
      <div>
        <h2>
          Standard
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>

          {templates.map((template, index) => (


            <Card>
              <CardHeading>{template.title}</CardHeading>
              <CardBody>
                <p>{template.text}</p>
              </CardBody>
              <CardFooter>
                <Link  href={`/template/353535/q/new`} className="button-link secondary">Select</Link>
              </CardFooter>
            </Card>


          ))}

        </div>

        <h2>
          Other types of questions
        </h2>
        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>

          {templates_others.map((template, index) => (


            <Card>
              <CardHeading>{template.title}</CardHeading>
              <CardBody>
                <p>{template.text}</p>
              </CardBody>
              <CardFooter>
                <Link  href={`/template/353535/q/new`} className="button-link secondary">Select</Link>
              </CardFooter>
            </Card>


          ))}
        </div>
      </div>
    </>
  );
}

export default QuestionTypeSelectPage;
