import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from '@/utils/test-utils';
import {
  useArchiveTemplateMutation,
  useCreateTemplateVersionMutation,
  useTemplateQuery,
  useSectionQuery
} from '@/generated/graphql';
import { useToast } from '@/context/ToastContext';
import { useParams, useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import TemplateEditPage from '../page';
import { updateTemplateAction, updateSectionDisplayOrderAction } from '../actions';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock useFormatter and useTranslations from next-intl
jest.mock('next-intl', () => ({
  useFormatter: jest.fn(() => ({
    dateTime: jest.fn(() => '01-01-2023'),
  })),
  useTranslations: jest.fn(() => jest.fn((key) => key)), // Mock `useTranslations`,
}));

// Mock the useTemplateQuery hook
jest.mock("@/generated/graphql", () => ({
  useSectionQuery: jest.fn(),
  useTemplateQuery: jest.fn(),
  useArchiveTemplateMutation: jest.fn(),
  useCreateTemplateVersionMutation: jest.fn(),
  TemplateVersionType: { Draft: 'DRAFT', Published: 'PUBLISHED' },
  TemplateVisibility: { Organization: 'ORGANIZATION', Public: 'PUBLIC' },
}));

jest.mock('../actions/index', () => ({
  updateTemplateAction: jest.fn(),
  updateSectionDisplayOrderAction: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

const mockToast = {
  add: jest.fn(),
};

const mockUseRouter = useRouter as jest.Mock;


jest.mock('@/components/BackButton', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Back Button</div>,
  };
});

const mockArchiveTemplateData = {
  data: {
    archiveTemplate: {
      id: 15,
      name: "Test template",
      errors: {
        general: "Template could not be archived",
        name: null,
        owner: null,
      },
    },
  },
}

const mockSectionData = {
  id: 79,
  name: 'Data Description',
  displayOrder: 1,
  questions: [
    {
      id: 1,
      displayOrder: 1,
      questionText: "Email field",

    },
    {
      id: 2,
      displayOrder: 2,
      questionText: "Process and Procedures"
    }
  ]
}

const mockTemplateData: {
  name: string;
  id: number | null; // Allow `id` to be `number` or `null`
  visibility: string;
  description: string;
  errors: null;
  latestPublishVersion: string;
  latestPublishDate: string;
  created: string;
  sections: {
    id: number;
    displayOrder: number;
    name: string;
    questions: {
      errors: null;
      displayOrder: number;
      guidanceText: string;
      id: number;
      questionText: string;
    }[];
  }[];
} = {
  name: "DMP Template from Dataverse",
  id: 15,
  visibility: "ORGANIZATION",
  description: "DMP Template from Dataverse",
  errors: null,
  latestPublishVersion: "v1",
  latestPublishDate: "1648835084000",
  created: "1412980160000",
  sections: [
    {
      id: 67,
      displayOrder: 1,
      name: "Data description",
      questions: [
        {
          errors: null,
          displayOrder: 1,
          guidanceText: "<p><br><a href=\"http://thedata.org/book/data-management-plan\">Dataverse page on DMPs</a></p>",
          id: 67,
          questionText: "Briefly describe nature &amp; scale of data {simulated, observed, experimental information; samples; publications; physical collections; software; models} generated or collected."
        }
      ]
    },
    {
      id: 68,
      displayOrder: 1,
      name: "NFS",
      questions: [
        {
          errors: null,
          displayOrder: 1,
          guidanceText: "Guidance text",
          id: 67,
          questionText: "National Science Foundation"
        }
      ]
    },
  ]
};

describe("TemplateEditPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    (useToast as jest.Mock).mockReturnValue(mockToast);

    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (useSectionQuery as jest.Mock).mockReturnValue({
      data: {
        section: mockSectionData
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

  });


  it("should render loading state", async () => {
    // Mock graphql requests
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it("should render data returned from template query correctly", async () => {
    // Mock the hook for data state
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('DMP Template from Dataverse');

    const versionText = screen.getByText(/version: v1/i);
    expect(versionText).toBeInTheDocument();

    // Find all section cards
    const sectionCards = screen.getAllByTestId('section-edit-card');

    // Find the card that contains 'Data description'
    const sectionCard1 = sectionCards.find(card =>
      within(card).queryByText('Data Description')
    );

    expect(sectionCard1).toBeInTheDocument();

    const questionCards = screen.getAllByTestId('question-edit-card');

    const questionCard1 = questionCards.find(card =>
      within(card).queryByText('Process and Procedures')
    )
    expect(questionCard1).toBeInTheDocument();
  });


  it('should close dialog when \'Publish template\' form submitted', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          createTemplateVersion: {
            errors: {
              general: null
            }
          }
        }
      }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Open publish modal
    const publishTemplateButton = screen.getByRole('button', { name: 'button.publishTemplate' });
    await act(async () => {
      fireEvent.click(publishTemplateButton);
    });


    // Fill in change log
    const textarea = screen.getByTestId('changeLog');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Some change log' } });
    })

    // To select the "public" radio button:
    const publicRadio = screen.getByDisplayValue('public');

    await act(async () => {
      fireEvent.click(publicRadio);
    })

    // Submit the publish form
    const saveAndPublishButton = screen.getByRole('button', { name: 'button.saveAndPublish' });
    await act(async () => {
      fireEvent.click(saveAndPublishButton);
    })

    // Wait for mutation response
    await waitFor(() => {
      //Should have hidden the dialog window again
      const modalElement = screen.queryByTestId('modal');
      expect(modalElement).toBeNull();
    });
  })

  it('should update the visibility text when publish visibility changes', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Simulate the user triggering the publishTemplate button
    const publishTemplateButton = screen.getByRole('button', { name: /button.publishtemplate/i });
    fireEvent.click(publishTemplateButton);
    await waitFor(() => {
      expect(screen.getByTestId('visPublic')).toBeInTheDocument();
    });

    const publicOption = screen.getByTestId('visPublic');
    const privateOption = screen.getByTestId('visPrivate');

    expect(publicOption).toBeInTheDocument();
    expect(privateOption).toBeInTheDocument();

    // Test the public option
    fireEvent.click(publicOption);
    await waitFor(() => {
      const visBullet = screen.getByTestId('visText');
      expect(visBullet).toBeInTheDocument();
      expect(visBullet).toHaveTextContent('bullet.publishingTemplate3');
    });

    // Test the Private Option
    fireEvent.click(privateOption);
    await waitFor(() => {
      const visBullet = screen.getByTestId('visText');
      expect(visBullet).toBeInTheDocument();
      expect(visBullet).toHaveTextContent('bullet.publishingTemplate3Private');
    });
  });

  it('should display errors.saveTemplate error message if no result when calling saveTemplate', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: null
      }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Open publish modal
    const publishTemplateButton = screen.getByRole('button', { name: 'button.publishTemplate' });
    await act(async () => {
      fireEvent.click(publishTemplateButton);
    });


    // Fill in change log
    const textarea = screen.getByTestId('changeLog');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Some change log' } });
    })

    // To select the "public" radio button:
    const publicRadio = screen.getByDisplayValue('public');

    await act(async () => {
      fireEvent.click(publicRadio);
    })

    // Submit the publish form
    const saveAndPublishButton = screen.getByRole('button', { name: 'button.saveAndPublish' });
    await act(async () => {
      fireEvent.click(saveAndPublishButton);
    })

    // Wait for the error to be added to the page
    await waitFor(() => {
      expect(screen.getByText('errors.saveTemplateError')).toBeInTheDocument();
    });
  })

  it('should set correct error when useCreate returns error', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn(() => Promise.reject(new Error('Mutation failed'))), // Mock the mutation function
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Simulate the user triggering the publishTemplate button
    const publishTemplateButton = screen.getByRole('button', { name: /button.publishtemplate/i });
    fireEvent.click(publishTemplateButton);

    // Locate the textarea using data-testid
    const textarea = screen.getByTestId('changeLog');

    // Simulate user typing into the textarea
    fireEvent.change(textarea, { target: { value: 'This is a test comment.' } });

    const saveAndPublishButton = screen.getByRole('button', { name: /button.saveandpublish/i });
    fireEvent.click(saveAndPublishButton);

    // Wait for the error to be added to the page
    await waitFor(() => {
      expect(screen.getByText('errors.saveTemplateError')).toBeInTheDocument();
    });
  })

  it('should call useArchiveTemplateMutation when user clicks on the Archive Template button', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { archiveTemplate: { errors: null } } }),
      { loading: false, error: undefined },
    ]);

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    fireEvent.click(archiveTemplateBtn);

    // Wait for the mutation to be called
    await waitFor(() => {
      expect(useArchiveTemplateMutation).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockUseRouter().push).toHaveBeenCalledWith('/en-US/template/123');
    });
  })

  it('should display correct error when archving template fails', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      jest.fn(() => Promise.reject(new Error('Mutation failed'))), // Mock the mutation function
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    fireEvent.click(archiveTemplateBtn);

    // Wait until error is displayed
    await waitFor(() => {
      expect(screen.getByText('errors.archiveTemplateError')).toBeInTheDocument();
    });
  })

  it('should display the general error if it is returned from the archiveTemplateMutation', async () => {

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    const mockArchiveTemplate = jest.fn().mockResolvedValue(mockArchiveTemplateData);

    // Use it in your test:
    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      mockArchiveTemplate,
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    await act(async () => {
      fireEvent.click(archiveTemplateBtn);
    })

    // Wait until error is displayed
    await waitFor(() => {
      expect(screen.getByText('Template could not be archived')).toBeInTheDocument();
    });
  })

  it('should not display error if there are response errors, but no error.general error from calling archiveTemplateMutation', async () => {

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    const mockWithNoGeneralError = {
      data: {
        archiveTemplate: {
          id: 15,
          name: "Test template",
          errors: {
            general: null,
            name: "Name not in correct format",
            owner: null,
          },
        },
      },
    }
    const mockArchiveTemplate = jest.fn().mockResolvedValue(mockWithNoGeneralError);

    // Use it in your test:
    (useArchiveTemplateMutation as jest.Mock).mockReturnValue([
      mockArchiveTemplate,
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });

    // Locate the Archive Template button
    const archiveTemplateBtn = screen.getByTestId('archive-template');
    //Click the button
    fireEvent.click(archiveTemplateBtn);

    // Wait until error is displayed
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  })

  it('should display Template Title input field when user clicks on Edit Template', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }), // Correct way to mock a resolved promise
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(
        <TemplateEditPage />
      );
    });


    const editTemplateButton = screen.getByRole('button', { name: /Edit template name/i });
    fireEvent.click(editTemplateButton);

    // Check if the input field is displayed
    const inputField = screen.getByRole('textbox', { name: /Template title/i });
    expect(inputField).toBeInTheDocument();
  });

  it('should call updateTemplateAction when user enters a new title and clicks save', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
      refetch: jest.fn()
    });
    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (updateTemplateAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null,
        },
        id: 15,
        name: 'New Template Title',
        visibility: 'ORGANIZATION',
      },
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Simulate clicking the "Edit template name" button
    const editTemplateButton = screen.getByRole('button', { name: /Edit template name/i });
    await act(async () => {
      fireEvent.click(editTemplateButton);
    });

    // Simulate typing a new title into the input field
    const inputField = screen.getByPlaceholderText('Enter new template title');
    await act(async () => {
      fireEvent.change(inputField, { target: { value: 'New Template Title' } });
    });

    // Simulate clicking the "Save" button
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Wait for the updateTemplateAction to be called
    await waitFor(() => {
      expect(updateTemplateAction).toHaveBeenCalledWith({
        templateId: 15,
        name: 'New Template Title', // Ensure the updated title is passed
        visibility: 'ORGANIZATION',
      });
    });
  });

  it('should log error if updateTemplate is called with no templateId', async () => {
    mockTemplateData.id = null; // Set templateId to null

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
      refetch: jest.fn()
    });

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({ data: { key: 'value' } }),
      { loading: false, error: undefined },
    ]);

    (updateTemplateAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        error: {
          general: null,
          email: null,
        },
        id: 15,
        name: 'New Template Title',
        visibility: 'ORGANIZATION',
      },
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Simulate clicking the "Edit template name" button
    const editTemplateButton = screen.getByRole('button', { name: /Edit template name/i });
    await act(async () => {
      fireEvent.click(editTemplateButton);
    });

    // Simulate typing a new title into the input field
    const inputField = screen.getByPlaceholderText('Enter new template title');
    await act(async () => {
      fireEvent.change(inputField, { target: { value: 'New Template Title' } });
    });

    // Simulate clicking the "Save" button
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Wait for the updateTemplateAction to be called
    await waitFor(() => {
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updateTemplate',
        expect.objectContaining({
          error: "templateId is null",
          url: { path: '/en-US/template/unknown' },
        })
      )
    })
  });


  it('should call updateSectionDisplayOrderAction when a section is moved', async () => {
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    const mockedSections = [
      {
        id: 25,
        name: "Products of the research",
        bestPractice: false,
        displayOrder: 2,
        isDirty: false,
        questions: [
          {
            errors: {
              general: null,
            },
            displayOrder: 1,
            guidanceText: "<ul>  <li><a href=\"http://www.nsf.gov/bfa/dias/policy/dmpdocs/ast.pdf\">NSF-AST Advice to PIs on DMPs</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf20001&amp;org=NSF\">NSF Proposal &amp; Award Policies &amp; Procedures Guide (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/pubs/policydocs/pappg20_1/pappg_2.jsp#IIC2j\">NSF plans for data management and sharing of the products of research (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf18041\">NSF Frequently Asked Questions (FAQs) for Public Access</a></li>  </ul>",
            id: 104,
            questionText: "<p>Describe the types of data and products that will be generated in the research, such as images of astronomical objects, spectra, data tables, time series, theoretical formalisms, computational strategies, software, and curriculum materials.</p>",
            sectionId: 25,
            templateId: 5
          }
        ]
      },
      {
        id: 26,
        name: "Data format",
        bestPractice: false,
        displayOrder: 3,
        isDirty: false,
        questions: [
          {
            errors: {
              general: null,
            },
            displayOrder: 1,
            guidanceText: "<ul>  <li><a href=\"http://www.nsf.gov/bfa/dias/policy/dmpdocs/ast.pdf\">NSF-AST Advice to PIs on DMPs</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf20001&amp;org=NSF\">NSF Proposal &amp; Award Policies &amp; Procedures Guide (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/pubs/policydocs/pappg20_1/pappg_2.jsp#IIC2j\">NSF plans for data management and sharing of the products of research (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf18041\">NSF Frequently Asked Questions (FAQs) for Public Access</a></li>  <li><a title=\"Ten Simple Rules for the Care and Feeding of Scientific Data&nbsp;\" href=\"https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003542\">Ten Simple Rules for the Care and Feeding of Scientific Data </a>&nbsp;(Suggestions on effective methods for sharing astronomical data)</li>  </ul>",
            id: 105,
            questionText: "<p>Describe the format in which the data or products are stored (e.g., ASCII, html, FITS, <span style=\"font-weight: 400;\">HD5, Virtual Observatory-compliant</span> tables, XML files, etc.). Include a description of <span style=\"font-weight: 400;\">any</span> metadata that will make the actual data products useful to the general researcher. Where data are stored in unusual or not generally accessible formats, explain how the data may be converted to a more accessible format or otherwise made available to interested parties. In general, solutions and remedies should be provided.</p>",
            sectionId: 26,
            templateId: 5
          }
        ]
      },
    ]

    // Arrange: mock template with two sections
    const mockTemplateWithSections = {
      ...mockTemplateData,
      sections: mockedSections,
    };

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateWithSections },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useSectionQuery as jest.Mock).mockReturnValue({
      data: {
        section: mockedSections
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    // Mock updateSectionDisplayOrderAction to resolve successfully
    (updateSectionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: {},
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Find the "Move Down" button for the first section
    // SectionEditContainer should render a button for moving down
    const moveDownButtons = screen.getAllByLabelText('buttons.moveUp');
    expect(moveDownButtons.length).toBeGreaterThan(0);

    // Act: Click the first "Move Down" button
    await act(async () => {
      fireEvent.click(moveDownButtons[0]);
    });

    // Assert: updateSectionDisplayOrderAction called with correct args
    await waitFor(() => {
      expect(updateSectionDisplayOrderAction).toHaveBeenCalledWith({
        sectionId: 25,
        newDisplayOrder: 1,
      });
    });
  });

  it('should not call server action when display order would be less than 1', async () => {
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    const mockedSections = [
      {
        id: 67,
        name: "Products of the research",
        bestPractice: false,
        displayOrder: 1,
        isDirty: false,
        questions: [
          {
            errors: {
              general: null,
            },
            displayOrder: 1,
            guidanceText: "<ul>  <li><a href=\"http://www.nsf.gov/bfa/dias/policy/dmpdocs/ast.pdf\">NSF-AST Advice to PIs on DMPs</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf20001&amp;org=NSF\">NSF Proposal &amp; Award Policies &amp; Procedures Guide (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/pubs/policydocs/pappg20_1/pappg_2.jsp#IIC2j\">NSF plans for data management and sharing of the products of research (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf18041\">NSF Frequently Asked Questions (FAQs) for Public Access</a></li>  </ul>",
            id: 104,
            questionText: "<p>Describe the types of data and products that will be generated in the research, such as images of astronomical objects, spectra, data tables, time series, theoretical formalisms, computational strategies, software, and curriculum materials.</p>",
            sectionId: 25,
            templateId: 5
          }
        ]
      },
      {
        id: 68,
        name: "Data format",
        bestPractice: false,
        displayOrder: 1,
        isDirty: false,
        questions: [
          {
            errors: {
              general: null,
            },
            displayOrder: 1,
            guidanceText: "<ul>  <li><a href=\"http://www.nsf.gov/bfa/dias/policy/dmpdocs/ast.pdf\">NSF-AST Advice to PIs on DMPs</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf20001&amp;org=NSF\">NSF Proposal &amp; Award Policies &amp; Procedures Guide (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/pubs/policydocs/pappg20_1/pappg_2.jsp#IIC2j\">NSF plans for data management and sharing of the products of research (PAPPG)</a></li>  <li><a href=\"https://www.nsf.gov/publications/pub_summ.jsp?ods_key=nsf18041\">NSF Frequently Asked Questions (FAQs) for Public Access</a></li>  <li><a title=\"Ten Simple Rules for the Care and Feeding of Scientific Data&nbsp;\" href=\"https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003542\">Ten Simple Rules for the Care and Feeding of Scientific Data </a>&nbsp;(Suggestions on effective methods for sharing astronomical data)</li>  </ul>",
            id: 105,
            questionText: "<p>Describe the format in which the data or products are stored (e.g., ASCII, html, FITS, <span style=\"font-weight: 400;\">HD5, Virtual Observatory-compliant</span> tables, XML files, etc.). Include a description of <span style=\"font-weight: 400;\">any</span> metadata that will make the actual data products useful to the general researcher. Where data are stored in unusual or not generally accessible formats, explain how the data may be converted to a more accessible format or otherwise made available to interested parties. In general, solutions and remedies should be provided.</p>",
            sectionId: 26,
            templateId: 5
          }
        ]
      },
    ]

    // Arrange: mock template with two sections
    const mockTemplateWithSections = {
      ...mockTemplateData,
      sections: mockedSections,
    };

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateWithSections },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useSectionQuery as jest.Mock).mockReturnValueOnce({
      data: {
        section: mockedSections
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    // Mock updateSectionDisplayOrderAction to resolve successfully
    (updateSectionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: {},
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Find all section cards
    const sectionCards = screen.getAllByTestId('section-edit-card');

    // Find the card that contains 'Data Description'
    const sectionCard1 = sectionCards.find(card =>
      within(card).queryByText('Data Description')
    );

    expect(sectionCard1).toBeTruthy(); // Ensure it's found

    // Get the move up button inside that card
    const moveUpButton = within(sectionCard1!).getByRole('button', {
      name: 'buttons.moveUp',
    });

    // Click the "Move Up" button
    await act(async () => {
      fireEvent.click(moveUpButton);
    });

    expect(updateSectionDisplayOrderAction).not.toHaveBeenCalled();

    expect(mockToast.add).toHaveBeenCalledWith('errors.displayOrderAlreadyAtTop', { type: 'error' });

  });


  it('should optimistically update section order when a section is moved (updateLocalSectionOrder)', async () => {
    const mockTemplateId = 123;
    const mockUseParams = useParams as jest.Mock;

    const sectionA = {
      id: 1,
      name: 'Section A',
      displayOrder: 1,
      questions: [],
    };
    const sectionB = {
      id: 2,
      name: 'Section B',
      displayOrder: 2,
      questions: [],
    };

    const mockTemplateWithSections = {
      ...mockTemplateData,
      sections: [sectionA, sectionB],
    };


    mockUseParams.mockReturnValue({ templateId: `${mockTemplateId}` });

    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateWithSections },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useSectionQuery as jest.Mock).mockImplementation(({ variables }) => {
      if (variables.sectionId === 1) {
        return {
          data: { section: sectionA },
          loading: false,
          error: null,
          refetch: jest.fn(),
        };
      }
      if (variables.sectionId === 2) {
        return {
          data: { section: sectionB },
          loading: false,
          error: null,
          refetch: jest.fn(),
        };
      }
      return { data: null, loading: false, error: null, refetch: jest.fn() };
    });

    (updateSectionDisplayOrderAction as jest.Mock).mockResolvedValue({
      success: true,
      errors: [],
      data: {},
    });

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Find all section headings in order
    const getSectionHeadings = () =>
      screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);

    // Check that both "Section A" and "Section B" are present in the headings
    expect(getSectionHeadings()).toEqual(expect.arrayContaining([
      'labels.section 1 Section A',
      'labels.section 2 Section B',
      'titleStatus',
      'heading.archiveTemplate',
    ]));
    // Find the "Move Down" button for Section A and click it
    const moveDownButtons = screen.getAllByLabelText('buttons.moveDown');
    await act(async () => {
      fireEvent.click(moveDownButtons[0]);
    });

    // After click, order should be: Section B, Section A (optimistic update)
    expect(getSectionHeadings()).toEqual(expect.arrayContaining([
      'labels.section 1 Section B',
      'labels.section 2 Section A',
      'titleStatus',
      'heading.archiveTemplate',
    ]));
  });

  it('should set pageErrors when createTemplateVersionMutation returns a general error', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          createTemplateVersion: {
            errors: { general: 'General publish error' }
          }
        }
      }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Open publish modal
    const publishTemplateButton = screen.getByRole('button', { name: 'button.publishTemplate' });
    await act(async () => {
      fireEvent.click(publishTemplateButton);
    });


    // Fill in change log
    const textarea = screen.getByTestId('changeLog');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Some change log' } });
    })

    // To select the "public" radio button:
    const publicRadio = screen.getByDisplayValue('public');

    await act(async () => {
      fireEvent.click(publicRadio);
    })


    // Submit the publish form
    const saveAndPublishButton = screen.getByRole('button', { name: 'button.saveAndPublish' });
    await act(async () => {
      fireEvent.click(saveAndPublishButton);
    })

    // Wait for the general error to appear in the page error area
    expect(screen.getByText('General publish error')).toBeInTheDocument();
  });

  it('should set no errors if createTemplateVersionMutation does not return errors.general', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useCreateTemplateVersionMutation as jest.Mock).mockReturnValue([
      jest.fn().mockResolvedValueOnce({
        data: {
          createTemplateVersion: {
            errors: { general: null }
          }
        }
      }),
      { loading: false, error: undefined },
    ]);

    await act(async () => {
      render(<TemplateEditPage />);
    });

    // Open publish modal
    const publishTemplateButton = screen.getByRole('button', { name: 'button.publishTemplate' });
    await act(async () => {
      fireEvent.click(publishTemplateButton);
    });


    // Fill in change log
    const textarea = screen.getByTestId('changeLog');
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'Some change log' } });
    })

    // To select the "public" radio button:
    const publicRadio = screen.getByDisplayValue('public');

    await act(async () => {
      fireEvent.click(publicRadio);
    })


    // Submit the publish form
    const saveAndPublishButton = screen.getByRole('button', { name: 'button.saveAndPublish' });
    await act(async () => {
      fireEvent.click(saveAndPublishButton);
    })

    expect(screen.queryByText('General publish error')).not.toBeInTheDocument();
  });

  it('should pass accessibility tests', async () => {
    (useTemplateQuery as jest.Mock).mockReturnValue({
      data: { template: mockTemplateData },
      loading: false,
      error: null,
    });

    let container: HTMLElement;
    await act(async () => {
      const renderResult = render(
        <TemplateEditPage />
      );
      container = renderResult.container;
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
