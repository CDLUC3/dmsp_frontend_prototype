'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "react-aria-components";
import { Card, CardBody, CardFooter, CardHeading } from "@/components/Card/card";
import { QuestionFormatInterface } from '@/app/types';
import {AnyQuestionType} from "@dmptool/types";

interface QuestionTypeCardProps {
  questionType: QuestionFormatInterface;
  handleSelect: ({ questionJSON, questionType, questionTypeName }: { questionJSON: string; questionType: string; questionTypeName: string; }) => void
}

const QuestionTypeCard: React.FC<QuestionTypeCardProps> = ({ questionType, handleSelect }) => {
  //Localization keys
  const Global = useTranslations('Global');

  const json: AnyQuestionType = questionType.defaultJSON as AnyQuestionType;
  const questionTypeId = json.type;
  const qType = JSON.stringify(questionTypeId)?.trim().replace(/^"|"$/g, '');//Since the question type was taken from the JSON string, it could have quotes or slashes that need to be removed.

  return (
    <Card key={json.type}>
      <CardHeading>{questionType.title}</CardHeading>
      <CardBody>
        <p>{questionType.usageDescription}</p>
      </CardBody>
      <CardFooter>
        <Button
          className="button-link secondary"
          data-type={json.type}
          onPress={() => handleSelect({
            questionJSON: JSON.stringify(json),
            questionType: qType,
            questionTypeName: json.type
          })}
        >
          {Global('buttons.select')}
        </Button>
      </CardFooter>
    </Card >
  )

}

export default QuestionTypeCard;
