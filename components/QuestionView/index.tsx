import React, {useEffect, useState} from 'react';

import {useTranslations} from 'next-intl';
import Image from 'next/image';


import {useQuestionTypesQuery} from '@/generated/graphql';
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
  question: Question,
}


const QuestionView: React.FC<QuestionViewProps> = ({
  children,
  id='',
  className='',
  isPreview=false,
  question,
}) => {

  const trans = useTranslations('QuestionView');
  const {data: qtData} = useQuestionTypesQuery();
  const [questionType, setQuestionType] = useState<string>('');
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    if (!question) return;
    if (!qtData) return;

    if (questionType == '' && qtData.questionTypes) {
      const qt = qtData.questionTypes
                       .find(qt => qt && qt.id === question.questionTypeId);
      setQuestionType(qt.name);
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
            (TODO: Affiliation Name)
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
                content={question?.useSampleTextAsDefault ? question.sampleText : ''}
                setContent={setEditorContent}
                data-testid="qt-textarea"
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
          Best practice by
          <Image
            className={styles.Logo}
            src="/images/DMP-logo.svg"
            width="140"
            height="16"
            alt="DMP Tool"
          />
        </p>

        <h3>Data Sharing</h3>
        <p>
          Give a summary of the data you will collect or create, noting the
          content, coverage and data type, for example tabular data, survey
          data, experimental measurements, models, software, audiovisual data,
          physical samples, etc.
        </p>
        <p><a href="#">Expand</a></p>

        <h3>Data Preservation</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          imperdiet tempor mi, in fringilla lectus viverra et. Suspendisse
          erat dolor, rutrum et tempor eu, ultricies quis nunc.
        </p>
        <p><a href="#">Expand</a></p>

        <h3>Data Protection</h3>
        <p>
          Quisque sit amet ex volutpat, imperdiet risus sit amet, malesuada
          enim.
        </p>
        <p><a href="#">Expand</a></p>
      </SidebarPanel>
    </LayoutWithPanel>
  )
}

export default QuestionView;
