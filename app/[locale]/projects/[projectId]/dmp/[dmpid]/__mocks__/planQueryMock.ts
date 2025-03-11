export const mockPlanData = {
  plan: {
    id: 1,
    versionedTemplate: {
      template: {
        id: 2,
        name: "General"
      }
    },
    funders: [
      {
        id: 1,
        project: null
      }
    ],
    visibility: "PUBLIC",
    status: "PUBLISHED",
    project: {
      funders: [
        {
          affiliation: {
            displayName: "National Science Foundation (nsf.gov)"
          },
          funderOpportunityNumber: "NSF-12345-ABC"
        }
      ],
      title: "Reef Havens: Exploring the Role of Reef Ecosystems in Sustaining Eel Populations"
    },
    contributors: [
      {
        projectContributor: {
          givenName: "Captain",
          surName: "Nemo",
          email: null,
          contributorRoles: [
            {
              label: "Principal Investigator (PI)"
            }
          ]
        }
      }
    ],
    sections: [
      {
        answeredQuestions: 0,
        displayOrder: 1,
        sectionId: 7,
        sectionTitle: "Roles & Responsibilities",
        totalQuestions: 1
      },
      {
        answeredQuestions: 0,
        displayOrder: 2,
        sectionId: 8,
        sectionTitle: "Metadata",
        totalQuestions: 0
      },
      {
        answeredQuestions: 0,
        displayOrder: 3,
        sectionId: 9,
        sectionTitle: "Sharing/Copyright Issues",
        totalQuestions: 0
      },
      {
        answeredQuestions: 0,
        displayOrder: 4,
        sectionId: 10,
        sectionTitle: "Long Term Storage",
        totalQuestions: 0
      },
      {
        answeredQuestions: 0,
        displayOrder: 5,
        sectionId: 11,
        sectionTitle: "Research Products",
        totalQuestions: 1
      }
    ],
    created: "1741308996000",
    modified: "1741308996000",
    dmpId: "https://doi.org/10.11111/2A3B4C"
  }
}