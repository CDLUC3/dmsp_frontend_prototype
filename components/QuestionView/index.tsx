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
import {
  BOOLEAN_QUESTION_TYPE,
  CHECKBOXES_QUESTION_TYPE,
  CURRENCY_QUESTION_TYPE,
  DATE_QUESTION_TYPE,
  DATE_RANGE_QUESTION_TYPE,
  EMAIL_QUESTION_TYPE,
  NUMBER_QUESTION_TYPE,
  NUMBER_RANGE_QUESTION_TYPE,
  RADIOBUTTONS_QUESTION_TYPE,
  SELECTBOX_QUESTION_TYPE,
  TEXT_AREA_QUESTION_TYPE,
  TEXT_FIELD_QUESTION_TYPE,
  TYPEAHEAD_QUESTION_TYPE,
  URL_QUESTION_TYPE,
} from '@/lib/constants';
import { getParsedQuestionJSON } from '@/components/hooks/getParsedQuestionJSON';
import styles from './QuestionView.module.scss';


interface QuestionViewProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  className?: string;
  isPreview: boolean,
  question: Question | null | undefined,
  path: string;
  /**
   * NOTE: We pass this explicitly, as we cannot predict or infer if the
   * templateId will be available in the question object.
   */
  templateId: number,
}

//This component is meant to work with the QuestionAdd and QuestionEdit components, to display
// just a preview of the one question type being edited or added
const QuestionView: React.FC<QuestionViewProps> = ({
  id = '',
  className = '',
  isPreview = false,
  question,
  templateId,
  path = ''
}) => {

  const trans = useTranslations('QuestionView');

  const { data: qtData } = useQuestionTypesQuery();
  const { data: templateData } = useTemplateQuery({
    variables: {
      templateId,
    },
    notifyOnNetworkStatusChange: true
  });

  // State was added so that users can change or interact with the question types in the Question Preview
  const [questionType, setQuestionType] = useState<string>('');
  const [otherField, setOtherField] = useState(false);
  const [affiliationData, setAffiliationData] = useState<{ affiliationName: string, affiliationId: string }>({ affiliationName: '', affiliationId: '' });
  const [otherAffiliationName, setOtherAffiliationName] = useState<string>('');
  const [selectedRadioValue, setSelectedRadioValue] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState<number | null>(null);
  const [urlValue, setUrlValue] = useState<string | null>(null);
  const [emailValue, setEmailValue] = useState<string | null>(null);
  const [textValue, setTextValue] = useState<string | number | null>(null);
  const [inputCurrencyValue, setInputCurrencyValue] = useState<number | null>(null);
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<string[]>([]);
  const [yesNoValue, setYesNoValue] = useState<string>('no');
  // Add local state for multiSelect values
  const [selectedMultiSelectValues, setSelectedMultiSelectValues] = useState<Set<string>>(new Set());

  // Add local state to track if user has interacted with MultiSelect
  const [multiSelectTouched, setMultiSelectTouched] = useState(false);

  // Add local state for selected select value
  const [selectedSelectValue, setSelectedSelectValue] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ startDate: string | DateValue | CalendarDate | null, endDate: string | DateValue | CalendarDate | null }>({
    startDate: '',
    endDate: '',
  });
  const [numberRange, setNumberRange] = useState<{ startNumber: number | null, endNumber: number | null }>({
    startNumber: 0,
    endNumber: 0,
  });

  // These handlers are here so that users can interact with the different question types in the Question Preview
  // However, their changes are not saved anywhere. It's just so they can see how the questions will look and behave
  const handleAffiliationChange = async (id: string, value: string) => {
    console.log("handle affiliation called")
    return setAffiliationData({ affiliationName: value, affiliationId: id })
  }

  const handleOtherAffiliationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherAffiliationName(value);
  };

  // Update the selected radio value when user selects different option
  const handleRadioChange = (value: string) => {
    setSelectedRadioValue(value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlValue(value);
  };


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailValue(value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextValue(value);
  };

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    setSelectedCheckboxValues(values);
  };

  const handleBooleanChange = (values: string) => {
    setYesNoValue(values);
  };

  // Handler for MultiSelect changes
  const handleMultiSelectChange = (values: Set<string>) => {
    setSelectedMultiSelectValues(values);
    setMultiSelectTouched(true);
  };

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

    const { parsed } = getParsedQuestionJSON(question, path);
    if (!parsed) {
      return;
    }
    const type = parsed.type;

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

  const { parsed } = getParsedQuestionJSON(question, path);

  const renderQuestionField = () => {
    if (!parsed) {
      return;
    }
    console.log("PARSED", parsed);

    switch (questionType) {
      case RADIOBUTTONS_QUESTION_TYPE: {
        // Type guard to ensure this is actually a radioButtons question
        if (parsed.type === 'radioButtons' && 'options' in parsed) {
          return (
            <RadioButtonsQuestionComponent
              parsedQuestion={parsed}
              selectedRadioValue={selectedRadioValue}
              name='radio-buttons'
              handleRadioChange={handleRadioChange}
            />
          )
        }
      }
      case CHECKBOXES_QUESTION_TYPE: {
        if (parsed.type === 'checkBoxes' && 'options' in parsed) {
          return (
            <CheckboxesQuestionComponent
              parsedQuestion={parsed}
              selectedCheckboxValues={selectedCheckboxValues}
              handleCheckboxGroupChange={handleCheckboxGroupChange}
            />
          )
        }
      }
      case SELECTBOX_QUESTION_TYPE: {
        if (parsed.type === 'selectBox' && 'options' in parsed) {
          const isMultiSelect = parsed.attributes?.multiple || false;

          return (
            <>
              {isMultiSelect ? (
                <MultiSelectQuestionComponent
                  parsedQuestion={parsed}
                  multiSelectTouched={multiSelectTouched}
                  selectedMultiSelectValues={selectedMultiSelectValues}
                  handleMultiSelectChange={handleMultiSelectChange}
                />
              ) : (
                <SelectboxQuestionComponent
                  parsedQuestion={parsed}
                  selectedSelectValue={selectedSelectValue}
                  setSelectedSelectValue={setSelectedSelectValue}
                />
              )}

            </>
          );
        }
      }
      case TEXT_FIELD_QUESTION_TYPE:
        if (parsed.type === 'text') {

          const minLength = parsed?.attributes?.minLength;
          const maxLength = parsed?.attributes?.maxLength;
          return (
            <FormInput
              name="textField"
              type="text"
              label="text"
              placeholder="Enter text"
              value={textValue ?? ''}
              onChange={e => handleTextChange(e)}
              minLength={minLength}
              maxLength={maxLength}
            />
          )
        }
      case TEXT_AREA_QUESTION_TYPE:
        if (parsed.type === 'textArea') {
          return (
            <TinyMCEEditor
              id="question-text-editor"
              content={question?.useSampleTextAsDefault ? question.sampleText as string : ''}
              setContent={() => { }}
            />
          );
        }
      case DATE_QUESTION_TYPE:
        if (parsed.type === 'date') {
          const dateMinValue = parsed?.attributes?.min;
          const dateMaxValue = parsed?.attributes?.max;
          return (
            <DateComponent
              name="startDate"
              value={getCalendarDateValue(dateRange.startDate)}
              onChange={newDate => handleDateChange('startDate', newDate)}
              label="Date"
              minValue={dateMinValue}
              maxValue={dateMaxValue}

            />
          )
        }
      case DATE_RANGE_QUESTION_TYPE:
        if (parsed.type === 'dateRange') {
          return (
            <DateRangeQuestionComponent
              parsedQuestion={parsed}
              dateRange={dateRange}
              handleDateChange={handleDateChange}
            />
          )
        }
      case NUMBER_QUESTION_TYPE:
        if (parsed.type === 'number') {
          const minValue = parsed?.attributes?.min;
          const maxValue = parsed?.attributes?.max;
          const step = parsed?.attributes?.step;
          return (
            <NumberComponent
              label="number"
              value={inputValue === null ? undefined : inputValue}
              onChange={value => setInputValue(value)}
              placeholder="number"
              minValue={minValue}
              {...(typeof maxValue === 'number' ? { maxValue } : {})} //if maxValue is null, we don't want to set it
              step={step}
            />
          )
        }

      case NUMBER_RANGE_QUESTION_TYPE:
        if (parsed.type === 'numberRange') {
          return (
            <NumberRangeQuestionComponent
              parsedQuestion={parsed}
              numberRange={numberRange}
              handleNumberChange={handleNumberChange}
              startPlaceholder="start"
              endPlaceholder="end"
            />
          )
        }
      case CURRENCY_QUESTION_TYPE:
        if (parsed.type === 'currency') {
          return (
            <CurrencyQuestionComponent
              parsedQuestion={parsed}
              inputCurrencyValue={inputCurrencyValue}
              setInputCurrencyValue={setInputCurrencyValue}
            />
          )
        }
      case URL_QUESTION_TYPE:
        if (parsed.type === 'url') {
          const urlMinLength = parsed?.attributes?.minLength;
          const urlMaxLength = parsed?.attributes?.maxLength;
          const urlPattern = parsed?.attributes?.pattern;
          return (
            <FormInput
              name="urlInput"
              type="url"
              label="url"
              placeholder="url"
              value={urlValue ?? ''}
              onChange={e => handleUrlChange(e)}
              minLength={urlMinLength}
              maxLength={urlMaxLength}
              pattern={urlPattern}
            />
          )
        }
      case EMAIL_QUESTION_TYPE:
        if (parsed.type === 'email') {
          const emailMinLength = parsed?.attributes?.minLength;
          const emailMaxLength = parsed?.attributes?.maxLength;
          const emailPattern = parsed?.attributes?.pattern;
          return (
            <FormInput
              name="emailInput"
              type="email"
              label="email"
              placeholder="email"
              value={emailValue ?? ''}
              onChange={e => handleEmailChange(e)}
              minLength={emailMinLength}
              maxLength={emailMaxLength}
              pattern={emailPattern}
            />
          )
        }

      case BOOLEAN_QUESTION_TYPE:
        if (parsed.type === 'boolean') {
          return (
            <BooleanQuestionComponent
              parsedQuestion={parsed}
              selectedValue={yesNoValue}
              handleRadioChange={handleBooleanChange}
            />
          )
        }

      case TYPEAHEAD_QUESTION_TYPE:
        if (parsed.type === 'typeaheadSearch') {
          return (
            <AffiliationSearchQuestionComponent
              parsedQuestion={parsed}
              affiliationData={affiliationData}
              otherAffiliationName={otherAffiliationName}
              otherField={otherField}
              setOtherField={setOtherField}
              handleAffiliationChange={(handleAffiliationChange)}
              handleOtherAffiliationChange={handleOtherAffiliationChange}
            />
          )
        }
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
