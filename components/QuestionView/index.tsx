import React, { useEffect, useState } from 'react';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  ListBoxItem,
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
import { RadioGroupComponent, CheckboxGroupComponent, FormSelect } from '@/components/Form';
import { Button } from "react-aria-components";

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
  const { data: qtData } = useQuestionTypesQuery();
  const { data: templateData } = useTemplateQuery({
    variables: {
      templateId,
    },
    notifyOnNetworkStatusChange: true
  });
  const [questionType, setQuestionType] = useState<string>('');

  // selected radio value
  const [selectedRadioValue, setSelectedRadioValue] = useState<string | undefined>(undefined);

  // Update the selected radio value when user selects different option
  const handleRadioChange = (value: string) => {
    setSelectedRadioValue(value);
  };

  // Add local state for selected checkboxes
  const [selectedCheckboxValues, setSelectedCheckboxValues] = useState<string[]>([]);

  // Handler for checkbox group changes
  const handleCheckboxGroupChange = (values: string[]) => {
    console.log('Checkbox values changed:', values);
    setSelectedCheckboxValues(values);
  };

  // Add local state for selected select value
  const [selectedSelectValue, setSelectedSelectValue] = useState<string | undefined>(undefined);

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
        // Transform options to items for FormSelect
        const items = parsedQuestion.options?.map((opt: Option) => ({
          id: opt.attributes.value,
          name: opt.attributes.label,
        })) || [];
        // Find initial selected value
        const selectedOption = parsedQuestion.options?.find((opt: Option) => opt.attributes.selected);
        const initialValue = selectedOption ? selectedOption.attributes.value : '';
        const value = selectedSelectValue !== undefined ? selectedSelectValue : initialValue;

        return (
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
        );
      }
      case 'multiSelect': {
        // Render your MultiSelectComponent here
        return <p>MultiSelect (implement MultiSelectComponent)</p>;
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
      case 'dateField':
        return <input type="date" />;
      case 'url':
        return <input type="url" />;
      case 'email':
        return <input type="email" />;
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
              {trans('requirements', { orgName: templateData?.template?.owner?.displayName })}
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
              {trans('guidanceBy', { orgName: templateData?.template?.owner?.displayName })}
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
