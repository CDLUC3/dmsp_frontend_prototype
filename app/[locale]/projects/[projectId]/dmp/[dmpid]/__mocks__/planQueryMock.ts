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
    sections: [
      {
        answeredQuestions: 1,
        displayOrder: 1,
        sectionId: 7,
        sectionTitle: "Roles & Responsibilities",
        totalQuestions: 1
      },
      {
        answeredQuestions: 2,
        displayOrder: 2,
        sectionId: 8,
        sectionTitle: "Metadata",
        totalQuestions: 5
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
    dmpId: "",
    registered: null,
  }
}
