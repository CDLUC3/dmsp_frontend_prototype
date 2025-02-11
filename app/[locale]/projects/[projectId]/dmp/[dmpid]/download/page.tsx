'use client';

import React, {useState} from 'react';
import {Breadcrumb, Breadcrumbs, Link} from "react-aria-components";
import type {DropEvent, FileDropItem} from 'react-aria';


import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";


const ProjectsProjectPlanDownloadPage = () => {
  const [fileName, setFileName] = useState<string | null>(null); // Holds uploaded file name
  const [error, setError] = useState<string | null>(null); // Tracks any upload errors
  //const [isDragging, setIsDragging] = useState<boolean>(false); // State for drag-hover effect

  const validExtensions = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Called when a file is dropped or selected
  const handleFileSelect = (file: File) => {
    setError(null); // Clear previous errors

    // Validate file type
    if (!validExtensions.includes(file.type)) {
      setError('Only PDF, DOC, or DOCX files are allowed.');
      setFileName(null);
      return;
    }

    // Set valid file name
    setFileName(file.name);
  };

  const handleDrop = (e: DropEvent) => {
    const files = e.items.filter((file) =>
      file.kind === 'file'
    ) as FileDropItem[];

    if (files.length > 0) {
      const file = files[0];
      setFileName(file.name);

      file.getFile().then((actualFile) => {
        handleFileSelect(actualFile);
      });
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName) {
      setError('Please upload a valid file before submitting.');
      return;
    }

    console.log('Form submitted with file:', fileName);
    // Perform further actions or navigation here
    window.location.href = '/projects/proj_2425new';
  };

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
