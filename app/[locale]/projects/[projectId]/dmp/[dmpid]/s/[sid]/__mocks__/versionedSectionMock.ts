const versionedSectionMock = {
  id: 456,
  name: 'Data and Metadata Formats',
  introduction: 'Introduction text for the section',
  requirements: 'Requirements text for the section',
  guidance: 'Guidance text for the section',
  displayOrder: 1,
  bestPractice: 'Best practice text',
  tags: {
    id: 1,
    description: 'one',
    name: 'one',
    slug: 'one'
  },
  versionedQuestions: {
    errors: {
      general: null,
      versionedTemplateId: null,
      versionedSectionId: null,
      questionText: null,
      displayOrder: null
    },
    displayOrder: 1,
    guidanceText: 'Guidance',
    id: 1,
    questionText: 'This is the question',
    versionedSectionId: 456,
    versionedTemplateId: 789
  },
  errors: {
    general: null,
    name: null,
    displayOrder: null
  },
  versionedTemplate: {
    id: 789,
    bestPractice: false,
    languageId: 'en-US',
    name: "My template",
    visibility: "PUBLIC"
  }
};

export default versionedSectionMock;