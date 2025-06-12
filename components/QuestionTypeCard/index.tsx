'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from "react-aria-components";
import { Card, CardBody, CardFooter, CardHeading } from "@/components/Card/card";
import { QuestionTypesInterface } from '@/app/types';

interface QuestionTypeCardProps {
  questionType: QuestionTypesInterface;
  handleSelect: ({ questionJSON, questionType, questionTypeName }: { questionJSON: string; questionType: string; questionTypeName: string; }) => void
}

const QuestionTypeCard: React.FC<QuestionTypeCardProps> = ({ questionType, handleSelect }) => {
  //Localization keys
  const Global = useTranslations('Global');

  const json = JSON.parse(questionType.json);
  const questionTypeId = json.type;
  const qType = JSON.stringify(questionTypeId)?.trim().replace(/^"|"$/g, '');//Since the question type was taken from the JSON string, it could have quotes or slashes that need to be removed.

  return (
    <Card key={questionType.id}>
      <CardHeading>{questionType.name}</CardHeading>
      <CardBody>
        <p>{questionType.usageDescription}</p>
      </CardBody>
      <CardFooter>
        <Button
          className="button-link secondary"
          data-type={questionType.id}
          onPress={() => handleSelect({
            questionJSON: questionType.json,
            questionType: qType,
            questionTypeName: questionType.name
          })}
        >
          {Global('buttons.select')}
        </Button>
      </CardFooter>
    </Card >
  )

}

export default QuestionTypeCard;
