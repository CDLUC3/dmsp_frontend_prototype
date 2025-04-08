import React, {useEffect, useState} from 'react';

import {useTranslations} from 'next-intl';
import Image from 'next/image';

import {
  useQuestionTypesQuery,
  useTemplateQuery,
} from '@/generated/graphql';

import {Question} from '@/app/types';

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


import {DmpEditor} from "@/components/Editor";
import {Button} from "react-aria-components";

import styles from './QuestionView.module.scss';


interface QuestionViewProps extends React.HTMLAttributes<HTMLDivElement> {
  isPreview: Boolean,
  question: Question | null | undefined,

  /**
   * NOTE: We pass this explicitly, as we cannot predict or infer if the
   * templateId will be available in the question object.
   */
  templateId: Number,
}


const QuestionView: React.FC<QuestionViewProps> = ({
  children,
  id='',
  className='',
  isPreview=false,
  question,
  templateId,
}) => {

  if (!question) return null;

  const trans = useTranslations('QuestionView');
  const {data: qtData} = useQuestionTypesQuery();
  const {data: templateData} = useTemplateQuery({
    variables: {
      templateId: templateId,
    },
    notifyOnNetworkStatusChange: true
  });
  const [questionType, setQuestionType] = useState<string>('');
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    if (!question) return;
    if (!qtData) return;

    if (questionType == '' && qtData.questionTypes) {
      const qt = qtData.questionTypes
                       .find(qt => qt && qt.id === question.questionTypeId);
      if (qt) {
        setQuestionType(qt.name);
      }
    }
  }, [question]);

  return (
    <LayoutWithPanel
      id={id}
      className={`${styles.QuestionView} ${className}`}
    >
      <ContentContainer className={`${styles.QuestionView}__content-container`}>
        <h2>{question?.questionText}</h2>

        <div className={styles.Requirements}>
          <p className={styles.ByLine}>
            {trans('requirements')}
            {templateData?.template?.owner?.displayName}
          </p>
          <p>{question?.requirementText}</p>
        </div>

        <p>
          <a className={styles.JumpLink} href="#_guidance">
            &darr; {trans('guidanceLink')}
          </a>
        </p>

        <Card data-testid='question-card'>
          <CardEyebrow>{trans('cardType')}</CardEyebrow>
          <CardHeading>{question?.questionText}</CardHeading>
          <CardBody data-testid="card-body">
            {(questionType == 'Text Area') && (
              <DmpEditor
                content={question?.useSampleTextAsDefault ? question.sampleText as string: ''}
                setContent={setEditorContent}
              />
            )}

            {(questionType == 'Text Field') && (
              <p>Plain text field</p>
            )}

            {(questionType == 'Radio Buttons') && (
              <p>Radios</p>
            )}

            {(questionType == 'Check Boxes') && (
              <p>Checkboxes</p>
            )}

            {(questionType == 'Select Box') && (
              <p>Select Box</p>
            )}

            {(questionType == 'Multi Select Box') && (
              <p>Multi Select Box</p>
            )}

            <div id="_guidance" className={styles.Guidance}>
            </div>
          </CardBody>
        </Card>

        {(question?.guidanceText) && (
          <div className="guidance">
            <p className={styles.ByLine}>
              {trans('guidanceBy')}
              {templateData?.template?.owner?.displayName}
            </p>
            <div dangerouslySetInnerHTML={{__html: question.guidanceText}}></div>
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
