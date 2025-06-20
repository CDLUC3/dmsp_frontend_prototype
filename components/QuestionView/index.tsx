'use client'

import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CalendarDate, DateValue } from "@internationalized/date";

import {
  Button,
} from "react-aria-components";
import {
  useQuestionTypesQuery,
  useTemplateQuery,
} from '@/generated/graphql';

import { Question } from '@/app/types';

import {
  LayoutWithPanel,
  SidebarPanel,
  ContentContainer,
  ToolbarContainer,
} from '@/components/Container';

import {
  Card,
  CardBody,
  CardEyebrow,
  CardHeading,
} from "@/components/Card/card";

import TinyMCEEditor from '@/components/TinyMCEEditor';
import {
  DateComponent,
  FormInput,
  NumberComponent,
} from '@/components/Form';
import {
  RadioButtonsQuestionComponent,
  CheckboxesQuestionComponent,
  SelectboxQuestionComponent,
  MultiSelectQuestionComponent,
  DateRangeQuestionComponent,
  NumberRangeQuestionComponent,
  CurrencyQuestionComponent,
  AffiliationSearchQuestionComponent,
  BooleanQuestionComponent
} from '@/components/Form/QuestionComponents';
import { getCalendarDateValue } from "@/utils/dateUtils";
import styles from './QuestionView.module.scss';


interface QuestionViewProps extends React.HTMLAttributes<HTMLDivElement> {
  isPreview: boolean,
  question: Question | null | undefined,

  /**
   * NOTE: We pass this explicitly, as we cannot predict or infer if the
   * templateId will be available in the question object.
   */
  templateId: number,
}

const getParsedQuestionJSON = (question: Question | null) => {
  if (question) {
    const parsedJSON = question?.json ? JSON.parse(question.json) : null;
    return parsedJSON;
  }
  return null;
}

const QuestionView: React.FC<QuestionViewProps> = ({
  id = '',
  className = '',
  isPreview = false,
  question,
  templateId,
}) => {

  const trans = useTranslations('QuestionView');

  const { data: qtData } = useQuestionTypesQuery();
  const { data: templateData } = useTemplateQuery({
    variables: {
      templateId,
    },
    notifyOnNetworkStatusChange: true
  });
  const [questionType, setQuestionType] = useState<string>('');
  const [otherField, setOtherField] = useState(false);
  const [affiliationData, setAffiliationData] = useState<{ affiliationName: string, affiliationId: string }>({ affiliationName: '', affiliationId: '' });
  const [otherAffiliationName, setOtherAffiliationName] = useState<string>('');

  const handleAffiliationChange = async (id: string, value: string) => {
    return setAffiliationData({ affiliationName: value, affiliationId: id })
  }

  const handleOtherAffiliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherAffiliationName(value);
  };
  // selected radio value
  const [selectedRadioValue, setSelectedRadioValue] = useState<string | undefined>(undefined);

  // Update the selected radio value when user selects different option
  const handleRadioChange = (value: string) => {
    setSelectedRadioValue(value);
  };

  const [inputValue, setInputValue] = useState<number | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setInputValue(value);
  };

  const [textValue, setTextValue] = useState<string | number | null>(null);
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextValue(value);
  };

  const [inputCurrencyValue, setInputCurrencyValue] = useState<number | null>(null);

  // Add local state for selected checkboxes
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<string[]>([]);

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    setSelectedCheckboxValues(values);
  };

  const [yesNoValue, setYesNoValue] = useState<string>('no');
  const handleBooleanChange = (values: string) => {
    setYesNoValue(values);
  };

  // Add local state for multiSelect values
  const [selectedMultiSelectValues, setSelectedMultiSelectValues] = useState<Set<string>>(new Set());

  // Add local state to track if user has interacted with MultiSelect
  const [multiSelectTouched, setMultiSelectTouched] = useState(false);

  // Handler for MultiSelect changes
  const handleMultiSelectChange = (values: Set<string>) => {
    setSelectedMultiSelectValues(values);
    setMultiSelectTouched(true);
  };

  // Add local state for selected select value
  const [selectedSelectValue, setSelectedSelectValue] = useState<string | undefined>(undefined);

  const [dateRange, setDateRange] = useState<{ startDate: string | DateValue | CalendarDate | null, endDate: string | DateValue | CalendarDate | null }>({
    startDate: '',
    endDate: '',
  });

  // Handler for date range changes
  const handleDateChange = (
    key: string,
    value: string | DateValue | CalendarDate | null
  ) => {
    setDateRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const [numberRange, setNumberRange] = useState<{ startNumber: number | null, endNumber: number | null }>({
    startNumber: 0,
    endNumber: 0,
  });

  // Handler for number range changes
  const handleNumberChange = (
    key: string,
    value: string | number | null
  ) => {
    setNumberRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (!question || !qtData?.questionTypes) return;

    const parsedQuestion = getParsedQuestionJSON(question);
    if (!parsedQuestion) return;
    const type = parsedQuestion.type;

    for (const qt of qtData.questionTypes) {
      if (!qt || !qt.json) continue; // null check
      const qtJson = JSON.parse(qt.json);
      if (qtJson?.type === type) {
        setQuestionType(type);
        break;
      }
    }
  })

  if (!question) return null;

  const parsedQuestion = getParsedQuestionJSON(question);

  const renderQuestionField = () => {
    if (!parsedQuestion) return null;

    switch (questionType) {
      case 'radioButtons': {
        return (
          <RadioButtonsQuestionComponent
            parsedQuestion={parsedQuestion}
            selectedRadioValue={selectedRadioValue}
            name='radio-buttons'
            handleRadioChange={handleRadioChange}
          />
        )
      }
      case 'checkBoxes': {
        return (
          <CheckboxesQuestionComponent
            parsedQuestion={parsedQuestion}
            selectedCheckboxValues={selectedCheckboxValues}
            handleCheckboxGroupChange={handleCheckboxGroupChange}
          />
        )
      }
      case 'selectBox': {
        const isMultiSelect = parsedQuestion.attributes?.multiple || false;

        return (
          <>
            {isMultiSelect ? (
              <MultiSelectQuestionComponent
                parsedQuestion={parsedQuestion}
                multiSelectTouched={multiSelectTouched}
                selectedMultiSelectValues={selectedMultiSelectValues}
                handleMultiSelectChange={handleMultiSelectChange}
              />
            ) : (
              <SelectboxQuestionComponent
                parsedQuestion={parsedQuestion}
                selectedSelectValue={selectedSelectValue}
                setSelectedSelectValue={setSelectedSelectValue}
              />
            )}

          </>
        );
      }
      case 'text':
        return (
          <FormInput
            name="textField"
            type="text"
            label="text"
            placeholder="Enter text"
            value={textValue === null ? undefined : textValue}
            onChange={e => handleTextChange(e)}
          />
        )
      case 'textArea':
        return (
          <TinyMCEEditor
            id="question-text-editor"
            content={question?.useSampleTextAsDefault ? question.sampleText as string : ''}
            setContent={() => { }}
          />
        );
      case 'date':
        return (
          <DateComponent
            name="startDate"
            value={getCalendarDateValue(dateRange.startDate)}
            onChange={newDate => handleDateChange('startDate', newDate)}
            label="Date"
          />
        )
      case 'dateRange':
        return (
          <DateRangeQuestionComponent
            parsedQuestion={parsedQuestion}
            dateRange={dateRange}
            handleDateChange={handleDateChange}
          />
        )
      case 'number':
        return (
          <NumberComponent
            label="number"
            value={inputValue === null ? undefined : inputValue}
            onChange={value => setInputValue(value)}
            placeholder="number"
          />
        )

      case 'numberRange':
        return (
          <NumberRangeQuestionComponent
            parsedQuestion={parsedQuestion}
            numberRange={numberRange}
            handleNumberChange={handleNumberChange}
            startPlaceholder="start"
            endPlaceholder="end"
          />
        )
      case 'currency':
        return (
          <CurrencyQuestionComponent
            parsedQuestion={parsedQuestion}
            inputCurrencyValue={inputCurrencyValue}
            setInputCurrencyValue={setInputCurrencyValue}
          />
        )
      case 'url':
        return (
          <FormInput
            name="urlInput"
            type="url"
            label="url"
            placeholder="url"
            value={inputValue === null ? undefined : inputValue}
            onChange={e => handleInputChange(e)}
          />
        )
      case 'email':
        return (
          <FormInput
            name="emailInput"
            type="email"
            label="email"
            placeholder="email"
            value={inputValue === null ? undefined : inputValue}
            onChange={e => handleInputChange(e)}
          />
        )

      case 'boolean':
        return (
          <BooleanQuestionComponent
            parsedQuestion={parsedQuestion}
            selectedValue={yesNoValue}
            handleRadioChange={handleBooleanChange}
          />
        )

      case 'typeaheadSearch':
        return (
          <AffiliationSearchQuestionComponent
            parsedQuestion={parsedQuestion}
            affiliationData={affiliationData}
            otherAffiliationName={otherAffiliationName}
            otherField={otherField}
            setOtherField={setOtherField}
            handleAffiliationChange={handleAffiliationChange}
            handleOtherAffiliationChange={handleOtherAffiliationChange}
          />
        )
      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <LayoutWithPanel
      id={id}
      className={`${styles.QuestionView} ${className}`}
    >
      <ContentContainer className={`${styles.QuestionView}__content-container`}>
        <h2>{question?.questionText}</h2>

        {(question?.requirementText) && (
          <div className={styles.Requirements}>
            <p className={styles.ByLine}>
              {trans('requirements', { orgName: templateData?.template?.owner?.displayName || '' })}
            </p>
            <div dangerouslySetInnerHTML={{ __html: question.requirementText || '' }}></div>
          </div>
        )}

        <p>
          <a className={styles.JumpLink} href="#_guidance">
            &darr; {trans('guidanceLink')}
          </a>
        </p>

        <Card data-testid='question-card'>
          <CardEyebrow>{trans('cardType')}</CardEyebrow>
          <CardHeading>{question?.questionText}</CardHeading>
          <CardBody data-testid="card-body">
            {renderQuestionField()}
          </CardBody>
        </Card>

        {(question?.guidanceText) && (
          <div className="guidance">
            <p className={styles.ByLine}>
              {trans('guidanceBy', { orgName: templateData?.template?.owner?.displayName ?? '' })}
            </p>
            <div dangerouslySetInnerHTML={{ __html: question.guidanceText }}></div>
          </div>
        )}

        {(!isPreview) && (
          <ToolbarContainer className={styles.QuestionActions}>
            <Button>{trans('backToSection')}</Button>
            <div>
              <Button>{trans('saveButton')}</Button>
              <span className={styles.Modified}>{trans('lastSaved')}: {question?.modified}</span>
            </div>
          </ToolbarContainer>
        )}
      </ContentContainer>

      <SidebarPanel>
        <p>
          {trans('bestPractice')}
          <Image
            className={styles.Logo}
            src="/images/DMP-logo.svg"
            width="140"
            height="16"
            alt="DMP Tool"
          />
        </p>

        <h3>{trans('dataSharingTitle')}</h3>
        <p>
          Give a summary of the data you will collect or create, noting the
          content, coverage and data type, for example tabular data, survey
          data, experimental measurements, models, software, audiovisual data,
          physical samples, etc.
        </p>
        <p><a href="#">{trans('expandLink')}</a></p>

        <h3>{trans('dataPreservationTitle')}</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          imperdiet tempor mi, in fringilla lectus viverra et. Suspendisse
          erat dolor, rutrum et tempor eu, ultricies quis nunc.
        </p>
        <p><a href="#">{trans('expandLink')}</a></p>

        <h3>{trans('dataProtection')}</h3>
        <p>
          Quisque sit amet ex volutpat, imperdiet risus sit amet, malesuada
          enim.
        </p>
        <p><a href="#">{trans('expandLink')}</a></p>
      </SidebarPanel>
    </LayoutWithPanel>
  )
}

export default QuestionView;
