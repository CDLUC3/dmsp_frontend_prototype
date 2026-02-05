// __mocks__/planMock.ts

const planMock = {
  id: 456,
  title: "Text Project",
  versionedTemplate: {
    template: {
      id: 789,
      name: 'Test Template',
    },
    name: 'Test Template',
    owner: {
      uri: 'https://example.com/owner',
      displayName: 'Test Owner',
    },
    version: 1,
    created: '2024-01-01',
  },
  fundings: {
    id: 1,
    projectFunding: {
      affiliation: {
        displayName: 'National Science Foundation (nsf.gov)'
      }
    }
  },
  visibility: 'PUBLIC',
  status: 'ACTIVE',
  project: {
    fundings: [
      {
        affiliation: {
          displayName: 'National Science Foundation',
          name: "NSF"
        },
        funderOpportunityNumber: '123'
      }
    ],
    title: 'Test Project',
    collaborators: {
      accessLevel: 'OWN',
      user: {
        id: 1
      },
    }
  },
  members: [],
  versionedSections: [
    {
      versionedSectionId: 456,
      title: 'Data and Metadata Formats',
      totalQuestions: 3,
      answeredQuestions: 2,
      displayOrder: 1,
      tags: [
        { id: 1, name: 'Data description', slug: 'data-description', description: 'Data description tag' },
        { id: 2, name: 'Data organization & documentation', slug: 'data-organization-documentation', description: 'Data organization & documentation tag' }
      ]
    },
  ],
  created: '2024-01-01',
  createdById: 1,
  modified: '2024-01-01',
  dmpId: 'doi-456',
  registered: true,
  feedback: {
    id: 789,
    completed: null
  },
  progress: {
    answeredQuestions: 0,
    percentComplete: 0,
    totalQuestions: 16
  }
};

export default planMock;
