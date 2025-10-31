'use client';

import React, { ChangeEvent, useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Checkbox,
  Link,
  Radio,
  RadioGroup
} from "react-aria-components";
import { useParams } from "next/navigation";

import {
  usePlanQuery
} from "@/generated/graphql";

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import { DOI_REGEX } from "@/lib/constants";

import styles from './ProjectsProjectPlanDownloadPage.module.scss';
import { text } from 'stream/consumers';

// Define types
interface SettingsState {
  includeCoverPage: boolean;
  includeSectionHeadings: boolean;
  includeQuestionText: boolean;
  includeUnansweredQuestions: boolean;
  includeResearchOutputs: boolean;
  includeRelatedWorks: boolean;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  margins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
}

type FileFormatType = 'pdf' | 'doc' | 'html' | 'csv' | 'json';

const ProjectsProjectPlanDownloadPage: React.FC = () => {
  // State for form values
  const [settings, setSettings] = useState<SettingsState>({
    includeCoverPage: false,
    includeSectionHeadings: true,
    includeQuestionText: true,
    includeUnansweredQuestions: false,
    includeResearchOutputs: false,
    includeRelatedWorks: false,
    fontFamily: 'Tinos, serif',
    fontSize: '11pt',
    lineHeight: '120',
    margins: {
      top: '25mm',
      bottom: '25mm',
      left: '25mm',
      right: '25mm'
    }
  });

  // Get planId params
  const params = useParams();
  const planId = String(params.dmpid);

  // State for selected file format
  const [selectedFormat, setSelectedFormat] = useState<FileFormatType>('pdf');

  // Get Plan using planId
  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = usePlanQuery({
    variables: { planId: Number(planId) },
    skip: isNaN(Number(planId)),
    notifyOnNetworkStatusChange: true,
  });

  const dmpId = data?.plan?.dmpId || '';
  const fileName = data?.plan?.title || 'untitled plan';

  // decode percent-encoding if someone passed a URL-encoded DOI
  const decoded = decodeURIComponent(dmpId);
  const match = DOI_REGEX.exec(decoded);
  const doi = match ? match[0] : decoded;



  const handleDownload = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        dmpId: doi, // Add dmpId as a query param
        includeCoverPage: String(settings.includeCoverPage),
        includeSectionHeadings: String(settings.includeSectionHeadings),
        includeQuestionText: String(settings.includeQuestionText),
        includeUnansweredQuestions: String(settings.includeUnansweredQuestions),
        includeResearchOutputs: String(settings.includeResearchOutputs),
        includeRelatedWorks: String(settings.includeRelatedWorks),
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize.replace('pt', ''),
        lineHeight: settings.lineHeight,
        marginTop: settings.margins.top.replace('mm', ''),
        marginBottom: settings.margins.bottom.replace('mm', ''),
        marginLeft: settings.margins.left.replace('mm', ''),
        marginRight: settings.margins.right.replace('mm', ''),
      });

      // Map format to Accept header
      const formatHeaders = {
        pdf: 'application/pdf',
        doc: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        html: 'text/html',
        csv: 'text/csv',
        json: 'application/json',
        text: 'text/plain',
      };

      // Fetch through the Next.js API route
      const response = await fetch(`/api/download-narrative?${params.toString()}`, {
        headers: {
          Accept: formatHeaders[selectedFormat],
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      // Handle error (show user notification, etc.)
    }
  };

  // Handler for font selection
  const handleFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      fontFamily: e.target.value
    }));
  };

  // Handler for font size selection
  const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      fontSize: e.target.value
    }));
  };

  // Handler for margin changes
  const handleMarginChange = (position: 'top' | 'bottom' | 'left' | 'right', value: string) => {
    setSettings(prev => ({
      ...prev,
      margins: {
        ...prev.margins,
        [position]: value
      }
    }));
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
          <section className={"sectionContainer"}>
            <h3 className={styles.sectionHeading}>
              Choose file format
            </h3>
            <div>
              <RadioGroup
                className={styles.radioGroup}
                aria-label="File format"
                value={selectedFormat}
                onChange={(value: string) => setSelectedFormat(value as FileFormatType)}
              >
                <Radio value="pdf">
                  PDF
                </Radio>
                <Radio value="doc">
                  DOC
                </Radio>
                <Radio value="html">
                  HTML
                </Radio>
                <Radio value="csv">
                  CSV
                </Radio>
                <Radio value="json">
                  JSON
                </Radio>
                <Radio value="text">
                  TEXT
                </Radio>
              </RadioGroup>
            </div>
          </section>

          <section className={"sectionContainer"}>
            <h3 className={styles.sectionHeading}>
              Settings
            </h3>
            <div className={styles.checkboxGroup}>
              <Checkbox
                isSelected={settings.includeCoverPage}
                onChange={(isSelected: boolean) => setSettings(prev => ({
                  ...prev,
                  includeCoverPage: isSelected
                }))}
                className={styles.checkboxItem}
              >
                <div className={"checkbox"}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                Include a project details coversheet
              </Checkbox>

              <Checkbox
                isSelected={settings.includeSectionHeadings}
                onChange={(isSelected: boolean) => setSettings(prev => ({
                  ...prev,
                  includeSectionHeadings: isSelected
                }))}
                className={styles.checkboxItem}
              >
                <div className={"checkbox"}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                Include the section headings
              </Checkbox>

              <Checkbox
                isSelected={settings.includeQuestionText}
                onChange={(isSelected: boolean) => setSettings(prev => ({
                  ...prev,
                  includeQuestionText: isSelected
                }))}
                className={styles.checkboxItem}
              >
                <div className={"checkbox"}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                Include the question text
              </Checkbox>

              <Checkbox
                isSelected={settings.includeUnansweredQuestions}
                onChange={(isSelected: boolean) => setSettings(prev => ({
                  ...prev,
                  includeUnansweredQuestions: isSelected
                }))}
                className={styles.checkboxItem}
              >
                <div className={"checkbox"}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4" />
                  </svg>
                </div>
                Include any unanswered questions
              </Checkbox>
            </div>
          </section>

          {selectedFormat === 'pdf' && (
            <section className={"sectionContainer"}>
              <h3 className={styles.sectionHeading}>
                Formatting options (PDF only)
              </h3>

              <div className={styles.formatSection}>
                <h4 className={styles.optionHeading}>Font</h4>
                <select
                  className={styles.select}
                  value={settings.fontFamily}
                  onChange={handleFontChange}
                  aria-label="Font"
                >
                  <option value="Tinos, serif">Tinos, serif</option>
                  <option value="Roboto, sans-serif">Roboto, sans-serif</option>
                </select>
              </div>

              <div className={styles.formatSection}>
                <h4 className={styles.optionHeading}>Font size</h4>
                <select
                  className={styles.select}
                  value={settings.fontSize}
                  onChange={handleFontSizeChange}
                  aria-label="Font size"
                >
                  <option value="8pt">8pt</option>
                  <option value="9pt">9pt</option>
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt</option>
                  <option value="14pt">14pt</option>
                </select>
              </div>

              <div className={styles.formatSection}>
                <h4 className={styles.optionHeading}>Margins</h4>
                <div className={styles.marginsContainer}>
                  <div className={styles.marginGroup}>
                    <label className={styles.marginLabel}>Top</label>
                    <select
                      className={styles.marginSelect}
                      value={settings.margins.top}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMarginChange('top', e.target.value)}
                      aria-label="Top margin"
                    >
                      <option value="15mm">15mm</option>
                      <option value="20mm">20mm</option>
                      <option value="25mm">25mm</option>
                      <option value="30mm">30mm</option>
                    </select>
                  </div>

                  <div className={styles.marginGroup}>
                    <label className={styles.marginLabel}>Bottom</label>
                    <select
                      className={styles.marginSelect}
                      value={settings.margins.bottom}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMarginChange('bottom', e.target.value)}
                      aria-label="Bottom margin"
                    >
                      <option value="15mm">15mm</option>
                      <option value="20mm">20mm</option>
                      <option value="25mm">25mm</option>
                      <option value="30mm">30mm</option>
                    </select>
                  </div>

                  <div className={styles.marginGroup}>
                    <label className={styles.marginLabel}>Left</label>
                    <select
                      className={styles.marginSelect}
                      value={settings.margins.left}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMarginChange('left', e.target.value)}
                      aria-label="Left margin"
                    >
                      <option value="15mm">15mm</option>
                      <option value="20mm">20mm</option>
                      <option value="25mm">25mm</option>
                      <option value="30mm">30mm</option>
                    </select>
                  </div>

                  <div className={styles.marginGroup}>
                    <label className={styles.marginLabel}>Right</label>
                    <select
                      className={styles.marginSelect}
                      value={settings.margins.right}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMarginChange('right', e.target.value)}
                      aria-label="Right margin"
                    >
                      <option value="15mm">15mm</option>
                      <option value="20mm">20mm</option>
                      <option value="25mm">25mm</option>
                      <option value="30mm">30mm</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className={styles.downloadSection}>
            <p className={styles.downloadText}>
              Download &#34;{fileName}.{selectedFormat}&#34; {selectedFormat === 'pdf' ? '(532kb)' : ''}
            </p>
            <button className={styles.downloadButton} onClick={handleDownload}>
              Download {selectedFormat.toUpperCase()}
            </button>
          </section>
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