'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Input,
  Label,
  Link,
  SearchField,
  Text
} from "react-aria-components";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeading
} from "@/components/Card/card";
import { QuestionTypesInterface } from '@/app/types';

interface QuestionTypeCardProps {
  questionType: QuestionTypesInterface;
  handleSelect: (questionTypeId: number, questionTypeName: string) => void;
}

const QuestionTypeCard: React.FC<QuestionTypeCardProps> = ({ questionType, handleSelect }) => {
  //Localization keys
  const Global = useTranslations('Global');

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
          onPress={() => handleSelect(questionType.id, questionType.name)}
        >
          {Global('buttons.select')}
        </Button>
      </CardFooter>
    </Card>
  )

}

export default QuestionTypeCard;
