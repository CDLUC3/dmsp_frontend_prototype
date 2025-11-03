// Mock data for admin section editing

export interface MockQuestion {
  id: string;
  text: string;
  link: string;
  name: string;
  displayOrder: number;
  questionAuthorType?: 'funder' | 'organization' | null;
  checklist?: {
    requirements: boolean;
    guidance: boolean;
    sampleText: boolean;
  };
}

export interface MockSection {
  id: number;
  title: string;
  sectionNumber: number;
  editUrl: string;
  questions: MockQuestion[];
  sectionAuthorType?: 'funder' | 'organization' | null;
  checklist?: {
    requirements: boolean;
    guidance: boolean;
  };
}

export const mockSections: MockSection[] = [
  {
    id: 1,
    title: "Data Collection and Management",
    sectionNumber: 1,
    editUrl: "/template/1/section/1/edit",
    sectionAuthorType: "funder",
    checklist: {
      requirements: true,
      guidance: false
    },
    questions: [
      {
        id: "1",
        text: "What types of data will be collected in this research project?",
        link: "/template/1/section/1/question/1/edit",
        name: "data-types",
        displayOrder: 1,
        questionAuthorType: null, // Default question
      },
      {
        id: "2",
        text: "How will the data be stored and backed up during the research period?",
        link: "/template/1/section/1/question/2/edit",
        name: "data-storage",
        displayOrder: 2,
        questionAuthorType: "funder", // Funder question
        checklist: {
          requirements: true,
          guidance: false,
          sampleText: true,
        },
      },
      {
        id: "3",
        text: "What file formats will be used for the data, and why were these formats chosen?",
        link: "/template/1/section/1/question/3/edit",
        name: "file-formats",
        displayOrder: 3,
        questionAuthorType: "organization", // Organization question
        checklist: {
          requirements: false,
          guidance: true,
          sampleText: true,
        },
      },
    ],
  },
  {
    id: 2,
    title: "Data Sharing and Access",
    sectionNumber: 2,
    editUrl: "/template/1/section/2/edit",
    sectionAuthorType: "organization",
    checklist: {
      requirements: false,
      guidance: true
    },
    questions: [
      {
        id: "4",
        text: "Who will have access to the data during the research project?",
        link: "/template/1/section/2/question/4/edit",
        name: "data-access",
        displayOrder: 1,
        questionAuthorType: "organization",
        checklist: {
          requirements: true,
          guidance: true,
          sampleText: false,
        },
      },
      {
        id: "5",
        text: "Will the data be shared with other researchers or institutions?",
        link: "/template/1/section/2/question/5/edit",
        name: "data-sharing",
        displayOrder: 2,
        questionAuthorType: "funder",
        checklist: {
          requirements: false,
          guidance: true,
          sampleText: true,
        },
      },
      {
        id: "6",
        text: "What are the conditions for data sharing and reuse?",
        link: "/template/1/section/2/question/6/edit",
        name: "sharing-conditions",
        displayOrder: 3,
        questionAuthorType: null,
      },
    ],
  },
  {
    id: 3,
    title: "Data Preservation and Archiving",
    sectionNumber: 3,
    editUrl: "/template/1/section/3/edit",
    questions: [
      {
        id: "7",
        text: "How long will the data be preserved after the project ends?",
        link: "/template/1/section/3/question/7/edit",
        name: "data-preservation",
        displayOrder: 1,
        questionAuthorType: "funder",
        checklist: {
          requirements: true,
          guidance: false,
          sampleText: false,
        },
      },
      {
        id: "8",
        text: "Where will the data be archived and in what format?",
        link: "/template/1/section/3/question/8/edit",
        name: "archive-location",
        displayOrder: 2,
        questionAuthorType: "organization",
        checklist: {
          requirements: false,
          guidance: true,
          sampleText: true,
        },
      },
      {
        id: "9",
        text: "What metadata will be provided with the archived data?",
        link: "/template/1/section/3/question/9/edit",
        name: "metadata",
        displayOrder: 3,
        questionAuthorType: null,
      },
    ],
  },
];
