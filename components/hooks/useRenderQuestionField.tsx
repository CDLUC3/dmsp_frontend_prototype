// hooks/useRenderQuestionField.ts
import { CalendarDate, DateValue } from "@internationalized/date";


import {
  RADIOBUTTONS_QUESTION_TYPE,
  CHECKBOXES_QUESTION_TYPE,
  SELECTBOX_QUESTION_TYPE,
  TEXT_FIELD_QUESTION_TYPE,
  TEXT_AREA_QUESTION_TYPE,
  DATE_QUESTION_TYPE,
  DATE_RANGE_QUESTION_TYPE,
  NUMBER_QUESTION_TYPE,
  NUMBER_RANGE_QUESTION_TYPE,
  CURRENCY_QUESTION_TYPE,
  URL_QUESTION_TYPE,
  EMAIL_QUESTION_TYPE,
  BOOLEAN_QUESTION_TYPE,
  TYPEAHEAD_QUESTION_TYPE,
} from '@/lib/constants';

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

import {
  DateComponent,
  FormInput,
  NumberComponent,
} from '@/components/Form';

import {
  Question
} from '@/app/types';

import TinyMCEEditor from '@/components/TinyMCEEditor';

import { getCalendarDateValue } from "@/utils/dateUtils";

import { QuestionTypeMap } from '@/utils/questionTypeHandlers';

export type QuestionType = keyof QuestionTypeMap;

export type ParsedQuestion = QuestionTypeMap[QuestionType];

export interface RadioProps {
  selectedRadioValue: string | undefined;
  handleRadioChange: (val: string) => void;
}

export interface CheckboxProps {
  selectedCheckboxValues: string[];
  handleCheckboxGroupChange: (vals: string[]) => void;
}

export interface MultiSelectBoxProps {
  multiSelectTouched?: boolean;
  selectedMultiSelectValues?: Set<string>;
  handleMultiSelectChange?: (values: Set<string>) => void;
}

export interface SelectBoxProps {
  selectedSelectValue?: string;
  setSelectedSelectValue?: (val: string) => void;
}

export interface TextFieldProps {
  textValue: string;
  handleTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


export interface DateProps {
  dateRange: { startDate: string | DateValue | CalendarDate | null, endDate: string | DateValue | CalendarDate | null };
  handleDateChange: (field: string, value: string) => void;
}

export interface DateRangeProps {
  dateRange: { startDate: string | DateValue | CalendarDate | null, endDate: string | DateValue | CalendarDate | null };
  handleDateChange: (key: string,
    value: string | DateValue | CalendarDate | null) => void;
}

export interface NumberProps {
  inputValue: number | null;
  setInputValue: (val: number | null) => void;
}


export interface NumberRangeProps {
  numberRange: { startNumber: number | null, endNumber: number | null }
  handleNumberChange: (key: string, value: string | number | null) => void;
}

export interface CurrencyProps {
  inputCurrencyValue: (number | null);
  setInputCurrencyValue: (value: number | null) => void;
}

export interface UrlProps {
  urlValue: string;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface EmailProps {
  emailValue: string;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface BooleanProps {
  yesNoValue: string;
  handleBooleanChange: (values: string) => void;
}

export interface RenderQuestionFieldProps {
  questionType: string;
  parsed: ParsedQuestion | undefined;
  question?: Question;

  radioProps?: {
    selectedRadioValue: string;
    handleRadioChange: (val: string) => void;
  };

  textFieldProps?: {
    textValue?: string;
    handleTextChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };

  selectBoxProps?: {
    selectedSelectValue?: string | undefined;
    setSelectedSelectValue?: (val: string | undefined) => void;
  };

  multiSelectBoxProps?: {
    multiSelectTouched: boolean;
    selectedMultiSelectValues: Set<string>;
    handleMultiSelectChange: (val: Set<string>) => void;
  };

  dateProps?: {
    dateRange: { startDate: string | DateValue | CalendarDate | null, endDate: string | DateValue | CalendarDate | null };
    handleDateChange: (key: string, val: DateValue | null) => void;
  };

  dateRangeProps?: {
    dateRange: {
      startDate: string | DateValue | CalendarDate | null,
      endDate: string | DateValue | CalendarDate | null
    };
    handleDateChange: (key: string,
      value: string | DateValue | CalendarDate | null) => void;
  };

  numberProps?: {
    inputValue: number | null;
    setInputValue: (val: number | null) => void
  };

  numberRangeProps?: {
    numberRange: { startNumber: number | null; endNumber: number | null };
    handleNumberChange: (key: string, val: number | null) => void
  };

  checkBoxProps?: {
    selectedCheckboxValues: string[];
    handleCheckboxGroupChange: (val: string[]) => void;
  };

  currencyProps?: {
    inputCurrencyValue: number | null;
    setInputCurrencyValue: (val: number | null) => void
  };

  booleanProps?: {
    yesNoValue: string;
    handleBooleanChange: (val: string) => void
  };

  urlProps?: {
    urlValue: string | null;
    handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  };

  emailProps?: {
    emailValue: string | null;
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  };

  typeaheadSearchProps?: {
    affiliationData: { affiliationName: string; affiliationId: string };
    otherAffiliationName: string;
    otherField: boolean;
    setOtherField: (val: boolean) => void;
    handleAffiliationChange: (id: string, value: string) => Promise<void>
    handleOtherAffiliationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export function useRenderQuestionField({
  parsed,
  questionType,
  question,
  radioProps,
  checkBoxProps,
  multiSelectBoxProps,
  selectBoxProps,
  textFieldProps,
  dateProps,
  dateRangeProps,
  numberProps,
  numberRangeProps,
  currencyProps,
  urlProps,
  emailProps,
  booleanProps,
  typeaheadSearchProps

}: RenderQuestionFieldProps) {
  if (!parsed) return null;

  switch (questionType) {
    case RADIOBUTTONS_QUESTION_TYPE:
      if (parsed.type === 'radioButtons' && 'options' in parsed && radioProps) {
        return (
          <RadioButtonsQuestionComponent
            parsedQuestion={parsed}
            selectedRadioValue={radioProps?.selectedRadioValue}
            name="radio-buttons"
            handleRadioChange={radioProps?.handleRadioChange}
          />
        );
      }
      break;

    case CHECKBOXES_QUESTION_TYPE:
      if (parsed.type === 'checkBoxes' && 'options' in parsed && checkBoxProps) {
        return (
          <CheckboxesQuestionComponent
            parsedQuestion={parsed}
            selectedCheckboxValues={checkBoxProps?.selectedCheckboxValues}
            handleCheckboxGroupChange={checkBoxProps?.handleCheckboxGroupChange}
          />
        );
      }
      break;

    case SELECTBOX_QUESTION_TYPE:
      if (parsed.type === 'selectBox' && 'options' in parsed) {
        const isMultiSelect = parsed.attributes?.multiple || false;
        if (isMultiSelect && multiSelectBoxProps?.handleMultiSelectChange) {
          return (
            <MultiSelectQuestionComponent
              parsedQuestion={parsed}
              multiSelectTouched={multiSelectBoxProps.multiSelectTouched}
              selectedMultiSelectValues={multiSelectBoxProps.selectedMultiSelectValues}
              handleMultiSelectChange={multiSelectBoxProps.handleMultiSelectChange}
            />
          );
        }

        if (!isMultiSelect && selectBoxProps?.setSelectedSelectValue) {
          return (
            <SelectboxQuestionComponent
              parsedQuestion={parsed}
              selectedSelectValue={selectBoxProps.selectedSelectValue}
              setSelectedSelectValue={selectBoxProps.setSelectedSelectValue}
            />
          );
        }
      }
      break;

    case TEXT_FIELD_QUESTION_TYPE:
      if (parsed.type === 'text' && textFieldProps) {
        const { minLength, maxLength } = parsed.attributes || {};
        return (
          <FormInput
            name="textField"
            type="text"
            label="text"
            placeholder="Enter text"
            value={textFieldProps?.textValue ?? ''
            }
            onChange={textFieldProps?.handleTextChange}
            minLength={minLength}
            maxLength={maxLength}
          />
        );
      }
      break;

    case TEXT_AREA_QUESTION_TYPE:
      if (parsed.type === 'textArea') {
        return (
          <TinyMCEEditor
            id="question-text-editor"
            content={question?.useSampleTextAsDefault ? question.sampleText as string : ''}
            setContent={() => { }
            }
          />
        );
      }
      break;

    case DATE_QUESTION_TYPE:
      if (parsed.type === 'date' && dateProps) {
        const { min: minValue, max: maxValue } = parsed.attributes || {};
        return (
          <DateComponent
            name="startDate"
            value={getCalendarDateValue(dateProps?.dateRange.startDate)}
            onChange={(newDate) => dateProps?.handleDateChange('startDate', newDate)
            }
            label="Date"
            minValue={minValue}
            maxValue={maxValue}
          />
        );
      }
      break;

    case DATE_RANGE_QUESTION_TYPE:
      if (parsed.type === 'dateRange' && dateRangeProps) {
        return (
          <DateRangeQuestionComponent
            parsedQuestion={parsed}
            dateRange={dateRangeProps?.dateRange}
            handleDateChange={dateRangeProps?.handleDateChange}
          />
        );
      }
      break;

    case NUMBER_QUESTION_TYPE:
      if (parsed.type === 'number' && numberProps) {
        const { min: minValue, max: maxValue, step } = parsed.attributes || {};
        return (
          <NumberComponent
            label="number"
            value={numberProps?.inputValue ?? undefined
            }
            onChange={numberProps?.setInputValue}
            placeholder="number"
            minValue={minValue}
            {...(typeof maxValue === 'number' ? { maxValue } : {})}
            step={step}
          />
        );
      }
      break;

    case NUMBER_RANGE_QUESTION_TYPE:
      if (parsed.type === 'numberRange' && numberRangeProps) {
        return (
          <NumberRangeQuestionComponent
            parsedQuestion={parsed}
            numberRange={numberRangeProps?.numberRange}
            handleNumberChange={numberRangeProps?.handleNumberChange}
            startPlaceholder="start"
            endPlaceholder="end"
          />
        );
      }
      break;

    case CURRENCY_QUESTION_TYPE:
      if (parsed.type === 'currency' && currencyProps) {
        return (
          <CurrencyQuestionComponent
            parsedQuestion={parsed}
            inputCurrencyValue={currencyProps?.inputCurrencyValue}
            setInputCurrencyValue={currencyProps?.setInputCurrencyValue}
          />
        );
      }
      break;

    case URL_QUESTION_TYPE:
      if (parsed.type === 'url' && urlProps) {
        const { minLength, maxLength, pattern } = parsed.attributes || {};
        return (
          <FormInput
            name="urlInput"
            type="url"
            label="url"
            placeholder="url"
            value={urlProps?.urlValue ?? ''
            }
            onChange={urlProps?.handleUrlChange}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
          />
        );
      }
      break;

    case EMAIL_QUESTION_TYPE:
      if (parsed.type === 'email' && emailProps) {
        const { minLength, maxLength, pattern } = parsed.attributes || {};
        return (
          <FormInput
            name="emailInput"
            type="email"
            label="email"
            placeholder="email"
            value={emailProps?.emailValue ?? ''
            }
            onChange={emailProps?.handleEmailChange}
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
          />
        );
      }
      break;

    case BOOLEAN_QUESTION_TYPE:
      if (parsed.type === 'boolean' && booleanProps) {
        return (
          <BooleanQuestionComponent
            parsedQuestion={parsed}
            selectedValue={booleanProps?.yesNoValue}
            handleRadioChange={booleanProps?.handleBooleanChange}
          />
        );
      }
      break;

    case TYPEAHEAD_QUESTION_TYPE:
      if (parsed.type === 'typeaheadSearch' && typeaheadSearchProps) {
        return (
          <AffiliationSearchQuestionComponent
            parsedQuestion={parsed}
            affiliationData={typeaheadSearchProps.affiliationData}
            otherAffiliationName={typeaheadSearchProps.otherAffiliationName}
            otherField={typeaheadSearchProps.otherField}
            setOtherField={typeaheadSearchProps.setOtherField}
            handleAffiliationChange={typeaheadSearchProps.handleAffiliationChange}
            handleOtherAffiliationChange={typeaheadSearchProps.handleOtherAffiliationChange}
          />
        );
      }
      break;

    default:
      return <p>Unsupported question type </p>;
  }

  return null;
}
