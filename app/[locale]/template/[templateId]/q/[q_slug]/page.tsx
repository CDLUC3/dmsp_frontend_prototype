'use client';

import React, { useState } from 'react';
import {
  Breadcrumb,
  Breadcrumbs,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Link,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  TextArea,
  TextField
} from 'react-aria-components';
import PageHeader from '@/components/PageHeader';
import QuestionEdit from '@/components/QuestionEdit';

// Sample data stub representing data fetched from a GraphQL server
const sampleQuestion = {
  id: 'q_mnopqr',
  templateId: 't_abcdef', // Added template ID
  type: 'Rich Text',
  text: 'What types of data, samples, collections, software, materials, etc., will be produced during your project?',
  requirements: 'Keep the question concise and clear. Use the requirements or guidance to provide additional explanation.',
  guidance: 'Be concise\nExplain the data file format\nExplain the expected size\nExplain the blah blah blah blah blah blah blah',
  sampleText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
};

const QuestionEditPage: React.FC = () => {
  return (
    /* We share this QuestionEdit form between adding a new question, or modifying an existing one*/
    <QuestionEdit />
  );
}

export default QuestionEditPage;
