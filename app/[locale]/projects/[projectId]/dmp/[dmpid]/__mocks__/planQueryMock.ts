export const mockPlanData = {
  plan: {
    id: 1,
    versionedTemplate: {
      template: {
        id: 2,
        name: "General"
      },
      name: "NSF-CISE: Computer and Information Science and Engineering"
    },
    fundings: [
      {
        id: 1,
        project: null
      }
    ],
    visibility: "PUBLIC",
    status: "DRAFT",
    project: {
      fundings: [
        {
          affiliation: {
            displayName: "National Science Foundation (nsf.gov)"
          },
          funderOpportunityNumber: "NSF-12345-ABC"
        }
      ],
      title: "Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations"
    },
    members: [
      {
        isPrimaryContact: true,
        projectMember: {
          givenName: "Captain",
          surName: "Nemo",
          email: null,
          orcid: "https://orcid.org/0000-0002-1234-5678",
          memberRoles: [
            {
              label: "Principal Investigator (PI)"
            }
          ]
        }
      }
    ],
    versionedSections: [
      {
        answeredQuestions: 1,
        displayOrder: 1,
        versionedSectionId: 7,
        title: "Roles & Responsibilities",
        totalQuestions: 1
      },
      {
        answeredQuestions: 2,
        displayOrder: 2,
        versionedSectionId: 8,
        title: "Metadata",
        totalQuestions: 5
      },
      {
        answeredQuestions: 0,
        displayOrder: 3,
        versionedSectionId: 9,
        title: "Sharing/Copyright Issues",
        totalQuestions: 0
      },
      {
        answeredQuestions: 0,
        displayOrder: 4,
        versionedSectionId: 10,
        title: "Long Term Storage",
        totalQuestions: 0
      },
      {
        answeredQuestions: 0,
        displayOrder: 5,
        versionedSectionId: 11,
        title: "Research Products",
        totalQuestions: 1
      }
    ],
    created: "1741308996000",
    modified: "1741308996000",
    dmpId: "",
    registered: null,
    title: 'Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations'
  }
}
