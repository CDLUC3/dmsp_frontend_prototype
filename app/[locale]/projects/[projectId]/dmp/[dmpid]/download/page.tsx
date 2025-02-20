'use client';

import React from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";


import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";


const ProjectsProjectPlanDownloadPage = () => {




  return (
    <>
      <PageHeader
        title="Download a plan"
        description="You can download your Data Management Plan (DMP) in any of the formats listed below."
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb>
              <Link href="/">Home</Link>
            </Breadcrumb>
            <Breadcrumb>
              <Link href="/projects">Projects</Link>
            </Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-create-project-funding"
      />
      <LayoutWithPanel>
        <ContentContainer>

          <h3>
            Choose file format
          </h3>

          <h3>
            Settings
          </h3>

          <h3>
            Formatting options (PDF only)
          </h3>

        </ContentContainer>

        <SidebarPanel>
          <h2>Best Practice by DMP Tool</h2>
          <p>
            <strong>Downloading plans</strong>
          </p>
          <p>
            PDFs offer universal compatibility and preserve formatting across
            all devices and platforms, ensuring your document looks perfect
            every time - unlike Word documents. Choose PDF to guarantee a
            consistent, professional, and secure presentation for your
            documents. Plus, most Funders require that DMPs be submitted in PDF
            format.
          </p>

          <p>
            If your organization, funder or project have specific requirements,
            you can also download your DMP in HTML, CSV or JSON formats.
          </p>
        </SidebarPanel>
      </LayoutWithPanel>


    </>
  );
};

export default ProjectsProjectPlanDownloadPage;
