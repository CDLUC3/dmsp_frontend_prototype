// __mocks__/versionedQuestionsMock.ts

const versionedQuestionsMock = [
  {
    id: 1,
    questionText: 'What types of data will be produced during your project?',
    displayOrder: 1,
    guidanceText: 'Guidance for question 1',
    requirementText: 'Requirement for question 1',
    sampleText: 'Sample for question 1',
    versionedSectionId: 456,
    versionedTemplateId: 789,
    hasAnswer: false,
  },
  {
    id: 2,
    questionText: 'What type of metadata will be collected?',
    displayOrder: 2,
    guidanceText: 'Guidance for question 2',
    requirementText: 'Requirement for question 2',
    sampleText: 'Sample for question 2',
    versionedSectionId: 456,
    versionedTemplateId: 789,
    hasAnswer: true,
  },
  {
    id: 3,
    questionText: 'Will all data be converted to open source formats?',
    displayOrder: 3,
    guidanceText: 'Guidance for question 3',
    requirementText: 'Requirement for question 3',
    sampleText: 'Sample for question 3',
    versionedSectionId: 456,
    versionedTemplateId: 789,
    hasAnswer: false,
  },
];

export default versionedQuestionsMock;
