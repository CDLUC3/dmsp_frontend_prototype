'use client';

import React, {ChangeEvent, useState} from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Checkbox,
  Link,
  Radio,
  RadioGroup
} from "react-aria-components";

import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import styles from './ProjectsProjectPlanDownloadPage.module.scss';

// Define types
interface SettingsState {
  includeProjectDetails: boolean;
  includeSectionHeadings: boolean;
  includeQuestionText: boolean;
  includeUnansweredQuestions: boolean;
  removeHtmlTags: boolean;
  font: string;
  fontSize: string;
  margins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
}

type FileFormatType = 'pdf' | 'doc' | 'html' | 'csv' | 'json';

interface FileIconProps {
  type?: FileFormatType;
}

// Icons for file formats
const FileIcon: React.FC<FileIconProps> = () => {
  return <span className={styles.icon}></span>;
};

const ProjectsProjectPlanDownloadPage: React.FC = () => {
  // State for form values
  const [settings, setSettings] = useState<SettingsState>({
    includeProjectDetails: false,
    includeSectionHeadings: true,
    includeQuestionText: true,
    includeUnansweredQuestions: false,
    removeHtmlTags: false,
    font: 'Times-serif',
    fontSize: '11pt',
    margins: {
      top: '25mm',
      bottom: '25mm',
      left: '25mm',
      right: '25mm'
    }
  });

  // State for selected file format
  const [selectedFormat, setSelectedFormat] = useState<FileFormatType>('pdf');
  const fileName = 'Coastal Ocean Processes of North Greenland DMP';

  // Handler for font selection
  const handleFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({
      ...prev,
      font: e.target.value
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
                  {/* <FileIcon type="pdf"/> */}
                  PDF
                </Radio>

                <Radio value="doc">
                  {/* <FileIcon type="doc"/> */}
                  DOC
                </Radio>

                <Radio value="html">
                  {/* <FileIcon type="html"/> */}
                  HTML
                </Radio>

                <Radio value="csv">
                  {/* <FileIcon type="csv"/> */}
                  CSV
                </Radio>

                <Radio value="json">
                  {/* <FileIcon type="json"/> */}
                  JSON
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
                isSelected={settings.includeProjectDetails}
                onChange={(isSelected: boolean) => setSettings(prev => ({
                  ...prev,
                  includeProjectDetails: isSelected
                }))}
                className={styles.checkboxItem}
              >
                <div className={"checkbox"}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4"/>
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
                    <polyline points="1 9 7 14 15 4"/>
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
                    <polyline points="1 9 7 14 15 4"/>
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
                    <polyline points="1 9 7 14 15 4"/>
                  </svg>
                </div>
                Include any unanswered questions
              </Checkbox>

              <Checkbox
                isSelected={settings.removeHtmlTags}
                onChange={(isSelected: boolean) => setSettings(prev => ({
                  ...prev,
                  removeHtmlTags: isSelected
                }))}
                className={styles.checkboxItem}
              >
                <div className={"checkbox"}>
                  <svg viewBox="0 0 18 18" aria-hidden="true">
                    <polyline points="1 9 7 14 15 4"/>
                  </svg>
                </div>
                Remove HTML tags
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
                  value={settings.font}
                  onChange={handleFontChange}
                  aria-label="Font"
                >
                  <option value="Times-serif">Times-serif-like Times New Roman
                  </option>
                  <option value="Arial-sans">Arial-sans</option>
                  <option value="Courier-mono">Courier-mono</option>
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
                  <option value="16pt">16pt</option>
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
              Download
              &#34;{fileName}.{selectedFormat}&#34; {selectedFormat === 'pdf' ? '(532kb)' : ''}
            </p>
            <button className={styles.downloadButton}>
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
