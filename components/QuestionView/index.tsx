'use client'

import React, { useEffect, useState } from 'react';
import { gql } from 'graphql-tag'; // or from '@apollo/client' if using Apollo

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CalendarDate, DateValue } from "@internationalized/date";

import {
  Button,
  ListBoxItem,
} from "react-aria-components";
import {
  AffiliationsDocument,
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
  CheckboxGroupComponent,
  DateComponent,
  FormInput,
  FormSelect,
  MultiSelect,
  NumberComponent,
  RadioGroupComponent,
  TypeAheadWithOther
} from '@/components/Form';
import { getCalendarDateValue } from "@/utils/dateUtils";
import styles from './QuestionView.module.scss';

type Option = {
  type: "option";
  attributes: {
    label: string;
    value: string;
    selected?: boolean;
    checked?: boolean;
    description?: string;
  };
};

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
  const Signup = useTranslations('SignupPage');
  const Global = useTranslations('Global');

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

  const [inputValue, setInputValue] = useState<string | number | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const [inputCurrencyValue, setInputCurrencyValue] = useState<number | null>(null);
  const handleInputCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputCurrencyValue(Number(value));
  };

  // Add local state for selected checkboxes
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<string[]>([]);

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    console.log('Checkbox values changed:', values);
    setSelectedCheckboxValues(values);
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

  const [dateRange, setDateRange] = useState<{ startDate: string | CalendarDate | null, endDate: string | CalendarDate | null }>({
    startDate: '',
    endDate: '',
  });

  // Handler for date range changes
  const handleDateChange = (
    key: string,
    value: string | DateValue | boolean | number | CalendarDate | null
  ) => {
    setDateRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const [numberRange, setNumberRange] = useState<{ startDate: string | number | null, endDate: string | number | null }>({
    startDate: '',
    endDate: '',
  });

  // Handler for number range changes
  const handleNumberChange = (
    key: string,
    value: string | number | null
  ) => {
    console.log("***VALUE", value);
    setNumberRange(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    console.log("Number range", numberRange);
  }, [numberRange]);

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

  // Add this function inside your component, before the return statement
  const renderQuestionInput = () => {
    if (!parsedQuestion) return null;

    switch (questionType) {
      case 'radioButtons': {
        const radioButtonData = parsedQuestion.options?.map((opt: Option) => ({
          label: opt.attributes.label,
          value: opt.attributes.value,
        }));
        const selectedOption = parsedQuestion.options?.find((opt: Option) => opt.attributes.selected);
        const initialValue = selectedOption ? selectedOption.attributes.value : undefined;
        const value = selectedRadioValue !== undefined ? selectedRadioValue : initialValue;
        return (
          <RadioGroupComponent
            name="visibility"
            value={value}
            radioGroupLabel=""
            radioButtonData={radioButtonData}
            onChange={handleRadioChange}
          />
        );
      }
      case 'checkBoxes': {
        const checkboxData = parsedQuestion.options?.map((opt: Option) => ({
          label: opt.attributes.label,
          value: opt.attributes.value,
          description: opt.attributes.description || "",
        })) || [];
        const initialChecked = parsedQuestion.options
          ?.filter((opt: Option) => opt.attributes.checked)
          .map((opt: Option) => opt.attributes.value) || [];
        const value = selectedCheckboxValues.length >= 0 ? selectedCheckboxValues : initialChecked;
        return (
          <CheckboxGroupComponent
            name="checkboxes"
            value={value}
            onChange={handleCheckboxGroupChange}
            checkboxGroupLabel=""
            checkboxGroupDescription={""}
            checkboxData={checkboxData}
          />
        );
      }
      case 'selectBox': {
        // Transform options to items for FormSelect/MultiSelect
        const items = parsedQuestion.options?.map((opt: Option) => ({
          id: opt.attributes.value,
          name: opt.attributes.label,
          selected: opt.attributes.selected || false,
        })) || [];
        // Find initial selected value(s)
        const selectedOption = parsedQuestion.options?.find((opt: Option) => opt.attributes.selected);
        const initialValue = selectedOption ? selectedOption.attributes.value : '';
        const value = selectedSelectValue !== undefined ? selectedSelectValue : initialValue;

        const isMultiSelect = parsedQuestion.attributes?.multiple || false;

        // Extract selected values for MultiSelect
        const defaultSelected = parsedQuestion.options
          ?.filter((opt: Option) => opt.attributes.selected)
          .map((opt: Option) => opt.attributes.value) || [];

        return (
          <>
            {isMultiSelect ? (
              <MultiSelect
                options={items}
                selectedKeys={multiSelectTouched ? selectedMultiSelectValues : new Set(defaultSelected)}
                onSelectionChange={handleMultiSelectChange}
                label="Choose Options"
                maxWidth="250px"
              />
            ) : (
              <FormSelect
                label=""
                name="select"
                items={items}
                selectedKey={value}
                onSelectionChange={selected => setSelectedSelectValue(selected as string)}
                errorMessage=""
                helpMessage=""
              >
                {items.map((item: { id: string; name: string }) => (
                  <ListBoxItem key={item.id}>{item.name}</ListBoxItem>
                ))}
              </FormSelect>
            )}

          </>
        );
      }

      case 'text':
        return <input type="text" />;
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
            headingClassName=""
          />
        )
      case 'dateRange':
        // Extract labels from JSON if available
        const startLabel = parsedQuestion?.columns?.start?.attributes?.label || Global('labels.startDate');
        const endLabel = parsedQuestion?.columns?.end?.attributes?.label || Global('labels.endDate');
        return (
          <div className="input-range-group">
            <DateComponent
              name="startDate"
              value={getCalendarDateValue(dateRange.startDate)}
              onChange={newDate => handleDateChange('startDate', newDate)}
              label={startLabel}
              headingClassName=""
            />
            <DateComponent
              name="endDate"
              value={getCalendarDateValue(dateRange.endDate)}
              onChange={newDate => handleDateChange('endDate', newDate)}
              label={endLabel}
              headingClassName="text-sm"
            />
          </div>
        )
      case 'number':
        return (
          <NumberComponent
            label="number"
            value={inputValue === null ? undefined : inputValue}
            onChange={value => setInputValue(value)}
            placeholder="number"
            minValue={parsedQuestion?.attributes?.minValue}
            maxValue={parsedQuestion?.attributes?.maxValue}
            step={parsedQuestion?.attributes?.step}
            disabled={parsedQuestion?.attributes?.disabled || false}
          />
        )

      case 'numberRange':
        const startNumberLabel = parsedQuestion?.columns?.start?.attributes?.label || "start";
        const endNumberLabel = parsedQuestion?.columns?.end?.attributes?.label || "end";
        return (
          <div className="input-range-group">
            <NumberComponent
              label={startNumberLabel}
              value={numberRange.startDate ?? undefined}
              onChange={num => handleNumberChange('startDate', num)}
              placeholder="start"
              minValue={parsedQuestion?.attributes?.minValue}
              maxValue={parsedQuestion?.attributes?.maxValue}
              step={parsedQuestion?.attributes?.step}
              disabled={parsedQuestion?.attributes?.disabled || false}
            />

            <NumberComponent
              label={endNumberLabel}
              value={numberRange.endDate ?? undefined}
              onChange={num => handleNumberChange('endDate', num)}
              placeholder="end"
              minValue={parsedQuestion?.attributes?.minValue}
              maxValue={parsedQuestion?.attributes?.maxValue}
              step={parsedQuestion?.attributes?.step}
              disabled={parsedQuestion?.attributes?.disabled || false}
            />
          </div>
        )
      case 'currency':
        return (
          <NumberComponent
            label="amount"
            value={inputCurrencyValue === null ? undefined : inputCurrencyValue}
            onChange={value => setInputCurrencyValue(value)}
            placeholder="number"
            minValue={parsedQuestion?.attributes?.minValue}
            maxValue={parsedQuestion?.attributes?.maxValue}
            step={parsedQuestion?.attributes?.step}
            disabled={parsedQuestion?.attributes?.disabled || false}
            formatOptions={{
              style: 'currency',
              currency: parsedQuestion?.attributes?.denomination || 'USD',
              currencyDisplay: 'symbol',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }}
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

      case 'typeaheadSearch':
        return (
          <>
            <TypeAheadWithOther
              label={parsedQuestion?.graphQL?.displayFields?.[0].label || Signup('institution')}
              fieldName="institution"
              graphqlQuery={
                typeof parsedQuestion?.graphQL?.query === 'string'
                  ? gql`${parsedQuestion.graphQL.query}`
                  : AffiliationsDocument
              }
              resultsKey={parsedQuestion?.graphQL?.responseField}
              setOtherField={setOtherField}
              required={true}
              error=""
              helpText={parsedQuestion?.graphQL?.variables?.label || Signup('institutionHelp')}
              updateFormData={handleAffiliationChange}
              value={affiliationData?.affiliationName || ''}
            />
            {otherField && (
              <div className={`${styles.formRow} ${styles.oneItemRow}`}>
                <FormInput
                  name="otherAffiliationName"
                  type="text"
                  label="Other institution"
                  placeholder="Enter other institution name"
                  value={otherAffiliationName}
                  onChange={handleOtherAffiliationChange}
                />
              </div >
            )}
          </>
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
            {/* {questionType} */}
            {renderQuestionInput()}
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
