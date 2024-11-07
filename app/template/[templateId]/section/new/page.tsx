'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import PageHeader from "@/components/PageHeader";
import {Card, CardBody, CardFooter, CardHeading} from "@/components/Card/card";

const SectionTypeSelectPage: React.FC = () => {

  const templates = [
    {
      title: 'Data Collection Methods',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>5 pre-built questions</p>',
    },
    {
      title: 'Data Storage and Security',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>4 pre-built questions</p>',
    },
    {
      title: 'Data Sharing and Access',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>6 pre-built questions</p>',
    },
    {
      title: 'Data Documentation and Metadata',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>3 pre-built questions</p>',
    },
    {
      title: 'Data Preservation and Archiving',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>4 pre-built questions</p>',
    }
  ];

  const templates_others = [
    {
      title: 'Ethics and Privacy Considerations',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>5 pre-built questions</p>',
    },
    {
      title: 'Budget and Resources',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>3 pre-built questions</p>',
    },
    {
      title: 'Roles and Responsibilities',
      link: '/template/353535/section/s_mnopqr',
      text: '<p>This section includes:</p><p>4 pre-built questions</p>',
    }
  ];
  return (
    <>
      <PageHeader
        title="Add new section"
        description="You have three options. You can use a section you created previously, use a DMP Tool best practice section or build a new section. All sections are customizable once selected."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href="/">Home</Link></Breadcrumb>
            <Breadcrumb><Link href="/template">Templates</Link></Breadcrumb>
            <Breadcrumb>Section</Breadcrumb>
          </Breadcrumbs>
        }
        actions={null}
        className=""
      />
      <div>
        <h2>
          Use one of your previously created sections
        </h2>
        <div className="card-grid-list">

          {templates.map((template, index) => (


            <Card>
              <CardHeading>{template.title}</CardHeading>
              <CardBody>
                <div dangerouslySetInnerHTML={{__html: template.text}}/>
              </CardBody>
              <CardFooter>
                <Link href={`/template/353535/section/s_mnopqr`}
                      className="button-link secondary">Select</Link>
              </CardFooter>
            </Card>


          ))}

        </div>

        <h2>
          Use a best practice section created by DMP Tool
        </h2>
        <div className="card-grid-list">

          {templates_others.map((template, index) => (


            <Card>
              <CardHeading>{template.title}</CardHeading>
              <CardBody>
                <div dangerouslySetInnerHTML={{__html: template.text}}/>

              </CardBody>
              <CardFooter>
                <Link href={`/template/353535/q/q_mnopqr`}
                      className="button-link secondary">Select</Link>
              </CardFooter>
            </Card>


          ))}
        </div>


        <h2>
          Build a new section
        </h2>
        <p>
          Build a new section from scratch. You can add questions, instructions,
          and other content to your section, we highly recommend using the best
          practice sections
        </p>
        <Link href="/template/353535/section/new"
              className="button-link secondary">Create new section</Link>
      </div>
    </>
  );
}

export default SectionTypeSelectPage;
