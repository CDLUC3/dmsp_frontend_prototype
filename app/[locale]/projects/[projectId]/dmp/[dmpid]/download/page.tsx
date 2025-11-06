'use client';

import React, { ChangeEvent, useRef, useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Checkbox,
  Link,
  Radio,
  RadioGroup
} from "react-aria-components";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import {
  usePlanQuery
} from "@/generated/graphql";

// Components
import PageHeader from "@/components/PageHeader";
import {
  ContentContainer,
  LayoutWithPanel,
  SidebarPanel
} from "@/components/Container";
import ErrorMessages from '@/components/ErrorMessages';

// Other
import { DOI_REGEX } from "@/lib/constants";
import { routePath } from "@/utils/routes";
import logECS from "@/utils/clientLogger";
import styles from './ProjectsProjectPlanDownloadPage.module.scss';

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

type FileFormatType = 'pdf' | 'doc' | 'html' | 'csv' | 'json' | 'text';

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
  const projectId = String(params.projectId);

  //For scrolling to error in page
  const errorRef = useRef<HTMLDivElement | null>(null);
  // Errors returned from download attempt
  const [errors, setErrors] = useState<string[]>([]);
  // State for selected file format
  const [selectedFormat, setSelectedFormat] = useState<FileFormatType>('pdf');

  // Localization keys
  const t = useTranslations("ProjectsProjectPlanDownloadPage");
  const Global = useTranslations("Global");

  // Get Plan using planId
  const {
    data,
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
      setErrors(prev => [...prev, t('messages.errors.downloadFailed')]);
      logECS('error', 'downloading plan', {
        error,
        url: { path: routePath('projects.dmp.download', { projectId, dmpId }) }
      });
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
        title={t('title')}
        description={t('description')}
        showBackButton={true}
        breadcrumbs={
          <Breadcrumbs>
            <Breadcrumb><Link href={routePath("app.home")}>{Global("breadcrumbs.home")}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath("projects.index")}>{Global("breadcrumbs.projects")}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.show', { projectId: String(projectId) })}>{Global('breadcrumbs.projectOverview')}</Link></Breadcrumb>
            <Breadcrumb><Link href={routePath('projects.dmp.show', { projectId, dmpId })}>{Global('breadcrumbs.planOverview')}</Link></Breadcrumb>
            <Breadcrumb>{Global('breadcrumbs.downloadPlan')}</Breadcrumb>
          </Breadcrumbs>
        }
        className="page-project-create-project-funding"
      />

      <ErrorMessages errors={errors} ref={errorRef} />
      <LayoutWithPanel>
        <ContentContainer>
          <section className={"sectionContainer"}>
            <h2 className={`${styles.sectionHeading} h3`}>
              {t('headings.chooseFileFormat')}
            </h2>
            <div>
              <RadioGroup
                className={styles.radioGroup}
                aria-label={t('labels.fileFormat')}
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
            <h2 className={`${styles.sectionHeading} h3`}>
              {t('headings.settings')}
            </h2>
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
                {t('labels.includeCoverSheet')}
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
                {t('labels.includeSectionHeadings')}
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
                {t('labels.includeQuestionText')}
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
                {t('labels.includeUnansweredQuestions')}
              </Checkbox>
            </div>
          </section>

          {selectedFormat === 'pdf' && (
            <section className={"sectionContainer"}>
              <h2 className={`${styles.sectionHeading} h3`}>
                {t('headings.formattingOptions')}
              </h2>

              <div className={styles.formatSection}>
                <h3 className={`${styles.optionHeading} h4`}>{t('headings.font')}</h3>
                <select
                  className={styles.select}
                  value={settings.fontFamily}
                  onChange={handleFontChange}
                  aria-label="Font"
                >
                  <option value="tinos">Tinos, serif</option>
                  <option value="roboto">Roboto, sans-serif</option>
                </select>
              </div>

              <div className={styles.formatSection}>
                <h3 className={`${styles.optionHeading} h4`}>{t('headings.fontSize')}</h3>
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
                <h3 className={`${styles.optionHeading} h4`}>{t('headings.margins')}</h3>
                <div className={styles.marginsContainer}>
                  <div className={styles.marginGroup}>
                    <label className={styles.marginLabel}>{t('labels.top')}</label>
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
                    <label className={styles.marginLabel}>{t('labels.bottom')}</label>
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
                    <label className={styles.marginLabel}>{t('labels.left')}</label>
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
                    <label className={styles.marginLabel}>{t('labels.right')}</label>
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
              {t('download')} &#34;{fileName}.{selectedFormat === 'text' ? 'txt' : selectedFormat}&#34;
            </p>
            <button className={styles.downloadButton} onClick={handleDownload}>
              {t('download')} {selectedFormat.toUpperCase()}
            </button>
          </section>
        </ContentContainer>

        <SidebarPanel>
          <div className={styles.headerWithLogo}>
            <h2 className="h4">{Global('bestPractice')}</h2>
            <Image
              className={styles.Logo}
              src="/images/DMP-logo.svg"
              width="140"
              height="16"
              alt="DMP Tool"
            />
          </div>
          <p>{t('bestPracticep1')}</p>

          <p>{t('bestPracticep2')}</p>
        </SidebarPanel>
      </LayoutWithPanel >
    </>
  );
};

export default ProjectsProjectPlanDownloadPage;