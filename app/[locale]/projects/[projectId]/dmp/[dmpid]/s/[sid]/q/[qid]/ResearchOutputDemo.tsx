'use client';

import React, { useMemo, useState } from 'react';
import { Checkbox, Label } from 'react-aria-components';
import { useTranslations } from "next-intl";
import { ListBoxItem } from 'react-aria-components';
import { type DateValue } from '@internationalized/date';

// Components 
import { Card } from '@/components/Card/card';
import RepositorySelectionSystem from '@/components/QuestionAdd/ReposSelector';
import MetaDataStandardsSelector from '@/components/QuestionAdd/MetaDataStandards';
import {
  CheckboxGroupComponent,
  FormInput,
  FormSelect,
  FormTextArea,
  DateComponent
} from '@/components/Form';

// Other
import {
  MetaDataStandardInterface,
  MetaDataStandardFieldInterface,
  RepositoryFieldInterface,
  RepositoryInterface,
} from '@/app/types';
import styles from './PlanOverviewQuestionPage.module.scss';

// Mock data for research output question
export const MOCK_RESEARCH_OUTPUT_QUESTION = {
  questionText: 'What research outputs do you plan to produce?',
  requirementText:
    '<p>Describe all research outputs that will be generated from this project, including datasets, publications, software, and other materials.</p>',
  guidanceText:
    '<p>List all anticipated research outputs such as data files, code repositories, publications, presentations, and other scholarly products. For each output, specify the format, size, and any relevant metadata standards.</p>',
  required: true,
  sampleText: null,
};

type OutputType =
  | 'audiovisual'
  | 'collection'
  | 'data_paper'
  | 'dataset'
  | 'event'
  | 'image'
  | 'interactive_resource'
  | 'model_representation'
  | 'physical_object'
  | 'service'
  | 'software'
  | 'sound'
  | 'text'
  | 'workflow'
  | 'other';

interface CustomTextField {
  id: string;
  label: string;
}

interface ResearchOutputForm {
  outputType: OutputType | '';
  outputTypeDescription: string;
  title: string;
  abbreviation: string;
  description: string;
  sensitiveData: boolean;
  personalData: boolean;
  repositories: RepositoryInterface[];
  metadataStandards: MetaDataStandardInterface[];
  access: 'open' | 'restricted' | 'closed' | '';
  releaseDate: DateValue | null;
  licenseId: string; // demo only
  fileSize?: string;
  fileSizeUnit?: 'mb' | 'gb' | 'tb' | 'pb' | 'bytes' | 'kb';
  customFields?: Record<string, string>;
}

interface ResearchOutputDemoProps {
  onBack: () => void;
}

// Mock custom text fields (will come from backend in production)
const MOCK_CUSTOM_TEXT_FIELDS: CustomTextField[] = [
  { id: 'custom_field_1', label: 'Custom Field 1' },
  { id: 'custom_field_2', label: 'Custom Field 2' },
  { id: 'custom_field_3', label: 'Custom Field 3' },
];

const fileSizeOptions = [
  { id: 'bytes', name: 'bytes' },
  { id: 'kb', name: 'KB' },
  { id: 'mb', name: 'MB' },
  { id: 'gb', name: 'GB' },
  { id: 'tb', name: 'TB' },
  { id: 'pb', name: 'PB' },
];

const typeOptions = [
  { id: 'audiovisual', name: 'Audiovisual' },
  { id: 'collection', name: 'Collection' },
  { id: 'data_paper', name: 'Data paper' },
  { id: 'dataset', name: 'Dataset' },
  { id: 'event', name: 'Event' },
  { id: 'image', name: 'Image' },
  { id: 'interactive_resource', name: 'Interactive resource' },
  { id: 'model_representation', name: 'Model representation' },
  { id: 'physical_object', name: 'Physical object' },
  { id: 'service', name: 'Service' },
  { id: 'software', name: 'Software' },
  { id: 'sound', name: 'Sound' },
  { id: 'text', name: 'Text' },
  { id: 'workflow', name: 'Workflow' },
  { id: 'other', name: 'Other' },
];

const accessLevelOptions = [
  { id: 'open', name: 'Unrestricted Access' },
  { id: 'restricted', name: 'Controlled Access' },
  { id: 'closed', name: 'Other' },
];

const licenseOptions = [
  { id: '75', name: 'CC-BY-4.0 (Creative Commons Attribution 4.0 International)' },
  { id: '103', name: 'CC-BY-SA-4.0 (Creative Commons Attribution Share Alike 4.0 International)' },
  { id: '80', name: 'CC-BY-NC-4.0 (Creative Commons Attribution Non Commercial 4.0 International)' },
  { id: '91', name: 'CC-BY-NC-SA-4.0 (Creative Commons Attribution Non Commercial Share Alike 4.0 International)' },
  { id: '96', name: 'CC-BY-ND-4.0 (Creative Commons Attribution No Derivatives 4.0 International)' },
  { id: '86', name: 'CC-BY-NC-ND-4.0 (Creative Commons Attribution Non Commercial No Derivatives 4.0 International)' },
  { id: '105', name: 'CC0-1.0 (Creative Commons Zero v1.0 Universal)' },
  { id: '546', name: 'OTHER (Custom Data Use Agreements/Terms of Use)' },
];

export const ResearchOutputDemo: React.FC<ResearchOutputDemoProps> = ({ onBack }) => {

  const [form, setForm] = useState<ResearchOutputForm>({
    outputType: 'dataset',
    outputTypeDescription: '',
    title: '',
    abbreviation: '',
    description: '',
    sensitiveData: false,
    personalData: false,
    repositories: [],
    metadataStandards: [],
    access: '',
    releaseDate: null,
    licenseId: '75',
    fileSize: '',
    fileSizeUnit: 'mb',
    customFields: {},
  });

  // Output types that should show the file size field
  const typeOptionsWithFileSize = ['dataset', 'data_paper', 'image', 'audiovisual', 'sound', 'model_representation', 'software', 'text'];

  // Repo selector config
  const [hasCustomRepos, setHasCustomRepos] = useState<boolean>(false);
  const repoField: RepositoryFieldInterface = useMemo(
    () => ({ id: 'repoSelector', label: 'Intended repositories', enabled: true, repoConfig: { hasCustomRepos, customRepos: [] } }),
    [hasCustomRepos]
  );

  // Metadata standards selector config
  const [hasCustomStandards, setHasCustomStandards] = useState<boolean>(true);
  const mdField: MetaDataStandardFieldInterface = useMemo(
    () => ({ id: 'metadataStandards', label: 'Metadata standards', enabled: true, metaDataConfig: { hasCustomStandards, customStandards: [] } }),
    [hasCustomStandards]
  );

  // Localization
  const t = useTranslations('PlanOverviewQuestionPage');

  return (
    <div>
      <Card data-testid="research-output-card">
        <span>Question</span>
        <h2 id="question-title" className="h3">What research outputs do you plan to produce?</h2>

        {/* Output Type + Description */}
        <div>
          <FormSelect
            name="research_output_type"
            ariaLabel={t('labels.researchOutputType')}
            isRequired={false}
            isRequiredVisualOnly={true}
            label="Type"
            items={typeOptions}
            selectedKey={form.outputType}
            includeEmptyOption={true}
            emptyOptionLabel={`--${t('pleaseSelectOne')}--`}
            onChange={(value) => setForm((f) => ({ ...f, outputType: (value as OutputType) }))}
          >
            {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
          </FormSelect>
        </div>

        {/* Title + Abbreviation */}
        <div className={styles.titleRow} >
          <div className={styles.title}>
            <FormInput
              label="Title"
              name="research_output_title"
              type="text"
              isRequired={false}
              isRequiredVisualOnly={true}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className={styles.abbreviation}>
            <FormInput
              label="Abbreviation"
              name="research_output_abbreviation"
              type="text"
              isRequired={false}
              value={form.abbreviation}
              onChange={(e) => setForm((f) => ({ ...f, abbreviation: e.target.value.slice(0, 10) }))}
              maxLength={10}
              tooltip={t('tooltips.abbreviation')}
              tooltipPlacement="bottom"
            />
          </div>
        </div>

        {/* Description (Rich text) */}
        <div>

          <FormTextArea
            name="research_output_description"
            isRequired={false}
            richText={true}
            label="Description"
            value={form.description}
            onChange={(newContent) => setForm((f) => ({ ...f, description: newContent }))}
          />
        </div>

        {/* Sensitive/Personal data flags */}
        <div>
          <CheckboxGroupComponent
            name="privacyFlags"
            value={[
              form.sensitiveData ? 'sensitive' : null,
              form.personalData ? 'personal' : null,
            ].filter(Boolean) as string[]}
            onChange={(values) =>
              setForm((f) => ({
                ...f,
                sensitiveData: values.includes('sensitive'),
                personalData: values.includes('personal'),
              }))
            }
            checkboxGroupLabel="Data flags"
            checkboxGroupDescription=""
          >
            <Checkbox value="sensitive">
              <div className="checkbox">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              </div>
              May contain sensitive data?
            </Checkbox>

            <Checkbox value="personal">
              <div className="checkbox">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <polyline points="1 9 7 14 15 4" />
                </svg>
              </div>
              May contain personally identifiable information?
            </Checkbox>
          </CheckboxGroupComponent>
        </div>

        {/* Intended repositories */}
        <div>
          <div>
            <h3>
              <Label htmlFor="Intended_repositories">Intended repositories</Label>
            </h3>
          </div>
          <div>
            <RepositorySelectionSystem
              field={repoField}
              handleTogglePreferredRepositories={(val) => setHasCustomRepos(val)}
              onRepositoriesChange={(repos) => setForm((f) => ({ ...f, repositories: repos }))}
              noPreferredCheckbox={true}
            />
          </div>
        </div>

        {/* Metadata standards */}
        <div>
          <div>
            <h3>
              <Label htmlFor="research_output_metadata_standard">Metadata standards</Label>
            </h3>
          </div>
          <div>
            <MetaDataStandardsSelector
              field={mdField}
              handleToggleMetaDataStandards={(val) => setHasCustomStandards(val)}
              onMetaDataStandardsChange={(standards) => setForm((f) => ({ ...f, metadataStandards: standards }))}
              noPreferredCheckbox={true}
            />
          </div>
        </div>

        {/* Access */}
        <div>
          <FormSelect
            name="research_output_access"
            ariaLabel="Research output access level"
            isRequired={false}
            description="Data in controlled access databases are available to investigators only after review of their proposed research use. Data in unrestricted access databases are publicly available to anyone."
            label="Initial access level"
            items={accessLevelOptions}
            selectedKey={form.access}
            includeEmptyOption={true}
            emptyOptionLabel="--Please select one--"
            onChange={(value) => setForm((f) => ({ ...f, access: value as ResearchOutputForm['access'] }))}
          >
            {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
          </FormSelect>
        </div>

        {/* Release date */}
        <div>
          <div>
            <DateComponent
              name="research_output_release_date"
              label="Anticipated release date"
              value={form.releaseDate}
              onChange={(value) => setForm((f) => ({ ...f, releaseDate: value }))}
            />
          </div>
        </div>

        {/* License */}
        <div>
          <FormSelect
            name="research_output_license_id"
            ariaLabel="Initial license"
            isRequired={false}
            label="Initial license"
            items={licenseOptions}
            selectClasses={styles.licenseSelect}
            selectedKey={form.licenseId}
            description={t.rich('licenseGuidance', {
              link: (chunks) => (
                <a
                  href="https://creativecommons.org/about/cclicenses/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
            onChange={(value) => setForm((f) => ({ ...f, licenseId: String(value) }))}
          >
            {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
          </FormSelect>
        </div>

        {/* File size - only display when certain output types are selected */}
        {form.outputType && typeOptionsWithFileSize.includes(form.outputType) && (
          <div className={styles.fileSizeRow} >
            <FormInput
              label="Anticipated file size"
              name="research_output_file_size"
              type="text"
              isRequired={false}
              value={form.fileSize || ''}
              onChange={(e) => setForm((f) => ({ ...f, fileSize: e.target.value }))}
              maxLength={10}
            />

            <FormSelect
              name="research_output_file_size_unit"
              ariaLabel="File size"
              isRequired={false}
              label=" Unit"
              items={fileSizeOptions}
              selectClasses={styles.fileSizeSelect}
              selectedKey={form.fileSizeUnit}
              includeEmptyOption={false}
              placeholder={form.fileSizeUnit || 'mb'}
              onChange={(value) => setForm((f) => ({ ...f, fileSizeUnit: value as ResearchOutputForm['fileSizeUnit'] }))}
            >
              {(item) => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
            </FormSelect>
          </div>
        )}


        {/* Custom Text Fields */}
        {
          MOCK_CUSTOM_TEXT_FIELDS.map((field) => (
            <div key={field.id}>
              <FormInput
                label={field.label}
                name={`custom_field_${field.id}`}
                type="text"
                isRequired={false}
                value={form.customFields?.[field.id] || ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    customFields: {
                      ...f.customFields,
                      [field.id]: e.target.value,
                    },
                  }))
                }
              />
            </div>
          ))
        }
      </Card >
    </div >
  );
};