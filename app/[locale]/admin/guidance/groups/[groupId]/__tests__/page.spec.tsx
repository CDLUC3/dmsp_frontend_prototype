import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MockedProvider } from "@apollo/client/testing";
import { useFormatter, useTranslations } from "next-intl";
import { useParams, useRouter } from 'next/navigation';
import logECS from '@/utils/clientLogger';
import {
  MeDocument,
  TagsDocument,
  GuidanceGroupDocument,
  GuidanceByGroupDocument,
} from "@/generated/graphql";

import {
  addGuidanceTextAction,
  publishGuidanceGroupAction,
  unPublishGuidanceGroupAction,
  updateGuidanceAction
} from '../actions';

import { axe, toHaveNoViolations } from "jest-axe";
import { useToast } from '@/context/ToastContext';
import { mockScrollIntoView } from '@/__mocks__/common';
import mockMeData from "../../../__mocks__/mockMeData.json";
import mockTagsData from "../../../__mocks__/mockTagsData.json";
import mockGuidanceByGroupData from "../__mocks__/mockGuidanceByGroupData.json";
import mockGuidanceGroupData from "../__mocks__/mockGuidanceGroupData.json";
import GuidanceGroupIndexPage from "../page";

// Mock TinyMCEEditor to simplify content updates in tests
jest.mock('@/components/TinyMCEEditor', () => {
  const TinyMCEEditorMock = ({ content, setContent, id }: { content: string; setContent: (v: string) => void; id: string }) => (
    <textarea
      data-testid={`editor-${id}`}
      aria-label={`editor-${id}`}
      value={content}
      onChange={(e) => setContent(e.target.value)}
    />
  );
  TinyMCEEditorMock.displayName = 'TinyMCEEditorMock';
  return TinyMCEEditorMock;
});

jest.mock('../actions/index', () => ({
  addGuidanceTextAction: jest.fn(),
  publishGuidanceGroupAction: jest.fn(),
  unPublishGuidanceGroupAction: jest.fn(),
  updateGuidanceAction: jest.fn(),
}));

// Mock next-intl hooks
jest.mock("next-intl", () => ({
  useFormatter: jest.fn(),
  useTranslations: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn()
}));

const mockRouter = {
  push: jest.fn(),
};

const mockToast = {
  add: jest.fn(),
};


expect.extend(toHaveNoViolations);

const mocks = [
  {
    request: {
      query: MeDocument,
    },
    result: {
      data: mockMeData,
    },
  },
  {
    request: {
      query: TagsDocument,
    },
    result: {
      data: mockTagsData,
      loading: false,
    },
  },
  // GuidanceGroup query is executed with fetchPolicy 'cache-and-network', so we need two mocks
  {
    request: {
      query: GuidanceGroupDocument,
      variables: {
        guidanceGroupId: 2397,
      }
    },
    result: {
      data: mockGuidanceGroupData
    },
  },
  {
    request: {
      query: GuidanceGroupDocument,
      variables: {
        guidanceGroupId: 2397,
      }
    },
    result: {
      data: mockGuidanceGroupData
    },
  },
  // GuidanceByGroup also uses 'cache-and-network', supply two mocks
  {
    request: {
      query: GuidanceByGroupDocument,
      variables: {
        guidanceGroupId: 2397,
      }
    },
    result: {
      data: mockGuidanceByGroupData,
      loading: false,
    },
  },
  {
    request: {
      query: GuidanceByGroupDocument,
      variables: {
        guidanceGroupId: 2397,
      }
    },
    result: {
      data: mockGuidanceByGroupData,
      loading: false,
    },
  }
]

// Build a variant with active: false on the latest version
const guidanceGroupInactive = JSON.parse(JSON.stringify(mockGuidanceGroupData));
guidanceGroupInactive.guidanceGroup.versionedGuidanceGroup[0].active = false;

// Provide two mocks for cache-and-network
const inactiveGroupMocks = [
  {
    request: {
      query: GuidanceGroupDocument,
      variables: { guidanceGroupId: 2397 }, // match your useParams for this test
    },
    result: { data: guidanceGroupInactive },
  },
  {
    request: {
      query: GuidanceGroupDocument,
      variables: { guidanceGroupId: 2397 },
    },
    result: { data: guidanceGroupInactive },
  },
  {
    request: {
      query: MeDocument,
    },
    result: {
      data: mockMeData,
    },
  },
  {
    request: {
      query: TagsDocument,
    },
    result: {
      data: mockTagsData,
      loading: false,
    },
  },
  {
    request: {
      query: GuidanceByGroupDocument,
      variables: {
        guidanceGroupId: 2397,
      }
    },
    result: {
      data: mockGuidanceByGroupData,
      loading: false,
    },
  },
  {
    request: {
      query: GuidanceByGroupDocument,
      variables: {
        guidanceGroupId: 2397,
      }
    },
    result: {
      data: mockGuidanceByGroupData,
      loading: false,
    },
  }
];

describe("GuidanceGroupIndexPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

    const mockUseParams = useParams as jest.Mock;
    // Mock the return value of useParams
    mockUseParams.mockReturnValue({ groupId: 2397 });

    // Mock Toast
    (useToast as jest.Mock).mockReturnValue(mockToast);

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useFormatter as jest.Mock).mockReturnValue({
      dateTime: jest.fn((date) => date.toLocaleDateString()),
    });

    (useTranslations as jest.Mock).mockImplementation((namespace) => {
      return (key: string) => `${namespace}.${key}`;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initially render loading spinner", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Global.messaging.loading")).toBeInTheDocument();
    });
  });


  it("should render guidance text fields", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    await waitFor(() => {
      // Check for all tags
      expect(screen.getByRole("heading", { name: "Storage & security" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Preservation" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Data collection" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Data format" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Roles & responsibilities" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Ethics & privacy" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Intellectual property rights" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Related policies" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Budget" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Data repository" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Data sharing" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Metadata & documentation" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Data volume" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Data description" })).toBeInTheDocument();

      //Check for textArea 
      // Check for 14 info icon buttons
      expect(screen.getAllByRole("button", { name: "Click for more info" })).toHaveLength(14);

      // Check for sidebar
      const sidebar = screen.getByTestId("sidebar-panel");
      const inSidebar = within(sidebar);
      const publishBtn = inSidebar.getByRole("button", { name: "Global.buttons.publish" });
      expect(publishBtn).toBeInTheDocument();
      const publicationStatus = inSidebar.getByText("Guidance.status.publicationStatus");
      expect(publicationStatus).toBeInTheDocument();
      const status = inSidebar.getByText("Guidance.status.published");
      expect(status).toBeInTheDocument();
      const lastPublished = inSidebar.getByText("Guidance.status.lastPublished");
      expect(lastPublished).toBeInTheDocument();
      const lastPublishedDate = inSidebar.getByText("12-1-2025");
      expect(lastPublishedDate).toBeInTheDocument();
    });
  });

  it('should update existing guidance text locally when editor changes', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Editor id pattern: content-<tagId>; we use tag id 1 which has existing guidance
    const editor = screen.getByTestId('editor-content-1');
    expect(editor).toHaveValue('<p>This is the guidance for storage &amp; security</p>');

    fireEvent.change(editor, { target: { value: 'UPDATED TEXT FOR TAG 1' } });

    // Value should reflect updated local state
    expect(editor).toHaveValue('UPDATED TEXT FOR TAG 1');

    // No server action called yet (updateGuidanceAction invoked only on save)
    expect(updateGuidanceAction).not.toHaveBeenCalled();
    expect(addGuidanceTextAction).not.toHaveBeenCalled();
  });

  it('should create temporary guidance for tag without guidance and calls addGuidanceTextAction on save', async () => {
    (addGuidanceTextAction as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 999, errors: null },
      redirect: undefined,
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Tag id 14 (Data description) has no guidance in mockGuidanceByGroupData
    const editor = screen.getByTestId('editor-content-14');
    expect(editor).toHaveValue(''); // starts empty

    fireEvent.change(editor, { target: { value: 'New guidance for Data description' } });
    expect(editor).toHaveValue('New guidance for Data description');

    // Find save buttons; click the one corresponding to tag 14.
    // We locate heading first then within its card look for button
    const guidanceCard = editor.closest('div')?.parentElement; // textarea wrapper -> its parent is the card section
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(addGuidanceTextAction).toHaveBeenCalledTimes(1);
      expect(addGuidanceTextAction).toHaveBeenCalledWith({
        guidanceGroupId: 2397,
        guidanceText: 'New guidance for Data description',
        tags: [{ id: 14, name: 'Data description' }],
      });
    });
  });

  it('should redirect if addGuidanceTextAction response includes a redirect', async () => {
    (addGuidanceTextAction as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 999, errors: null },
      redirect: "/en-US/admin/guidance/groups/2397/some-redirect-page",
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Tag id 14 (Data description) has no guidance in mockGuidanceByGroupData
    const editor = screen.getByTestId('editor-content-14');
    expect(editor).toHaveValue(''); // starts empty

    fireEvent.change(editor, { target: { value: 'New guidance for Data description' } });
    expect(editor).toHaveValue('New guidance for Data description');

    // Find save buttons; click the one corresponding to tag 14.
    // We locate heading first then within its card look for button
    const guidanceCard = editor.closest('div')?.parentElement; // textarea wrapper -> its parent is the card section
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockRouter.push).not.toHaveBeenCalledWith('/en-US/admin/guidance/groups/2397/some-redirect-page')
    });
  });

  it('should display error if addGuidanceTextAction returns field-level errors', async () => {
    (addGuidanceTextAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 999,
        errors: {
          general: "There was a general error"
        },
      },
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Tag id 14 (Data description) has no guidance in mockGuidanceByGroupData
    const editor = screen.getByTestId('editor-content-14');
    expect(editor).toHaveValue(''); // starts empty

    fireEvent.change(editor, { target: { value: 'New guidance for Data description' } });
    expect(editor).toHaveValue('New guidance for Data description');

    // Find save buttons; click the one corresponding to tag 14.
    // We locate heading first then within its card look for button
    const guidanceCard = editor.closest('div')?.parentElement; // textarea wrapper -> its parent is the card section
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('There was a general error')).toBeInTheDocument();
      //Check that error logged
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'adding Guidance text',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/admin/guidance/groups/2397' },
        })
      )
    });
  });

  it('should update existing guidance via updateGuidanceAction and shows success toast', async () => {
    (updateGuidanceAction as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 1, errors: null },
      redirect: undefined,
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Tag id 1 has existing guidance in mockGuidanceByGroupData
    const editor = screen.getByTestId('editor-content-1');
    fireEvent.change(editor, { target: { value: 'Updated text for Storage & security' } });

    // Click Save within the corresponding card
    const guidanceCard = editor.closest('div')?.parentElement; // textarea wrapper -> card section
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateGuidanceAction).toHaveBeenCalledTimes(1);
      expect(updateGuidanceAction).toHaveBeenCalledWith({
        guidanceId: 976,
        guidanceText: 'Updated text for Storage & security',
        tags: [{ id: 1, name: 'Storage & security' }],
      });

      // Success toast
      expect(mockToast.add).toHaveBeenCalledWith('Guidance.messages.success.guidanceTextUpdated', { type: 'success' });
    });
  });

  it('should redirect if response to updateGuidanceAction includes a redirect', async () => {
    (updateGuidanceAction as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 1, errors: null },
      redirect: "/en-US/admin/guidance/groups/2397/some-redirect-page",
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Tag id 1 has existing guidance in mockGuidanceByGroupData
    const editor = screen.getByTestId('editor-content-1');
    fireEvent.change(editor, { target: { value: 'Updated text for Storage & security' } });

    // Click Save within the corresponding card
    const guidanceCard = editor.closest('div')?.parentElement; // textarea wrapper -> card section
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);


    await waitFor(() => {
      expect(mockRouter.push).not.toHaveBeenCalledWith('/en-US/admin/guidance/groups/2397/some-redirect-page')
    });
  });

  it('should display error message whenupdateGuidanceAction returns field-level', async () => {
    (updateGuidanceAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 1,
        errors: {
          general: "There was a general error"
        }
      },
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    // Tag id 1 has existing guidance in mockGuidanceByGroupData
    const editor = screen.getByTestId('editor-content-1');
    fireEvent.change(editor, { target: { value: 'Updated text for Storage & security' } });

    // Click Save within the corresponding card
    const guidanceCard = editor.closest('div')?.parentElement; // textarea wrapper -> card section
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('There was a general error')).toBeInTheDocument();
      //Check that error logged
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'updating Guidance text',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/admin/guidance/groups/2397' },
        })
      )
    });
  });

  it('should show inline errors and no toast when updateGuidanceAction returns GraphQL errors', async () => {
    (updateGuidanceAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 1,
        errors: {
          general: 'Something went wrong',
          guidanceGroupId: null,
          guidanceText: null,
          tags: null,
        },
      },
      redirect: undefined,
    });

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    await waitForElementToBeRemoved(() => screen.getByText('Global.messaging.loading'));

    const editor = screen.getByTestId('editor-content-1');
    fireEvent.change(editor, { target: { value: 'Attempt update with server error' } });

    const guidanceCard = editor.closest('div')?.parentElement;
    const saveBtn = within(guidanceCard as HTMLElement).getByRole('button', { name: 'Global.buttons.save' });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateGuidanceAction).toHaveBeenCalledTimes(1);
      expect(mockToast.add).not.toHaveBeenCalled();
      // Inline error rendered
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('should handle unpublishing of guidance group', async () => {
    (unPublishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2397,
        name: "CDL Guidance Group",
        errors: {
          affiliationId: null,
          bestPractice: null,
          description: null,
          general: null,
          name: null
        },
      },
    });
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );


    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const unPublishBtn = inSidebar.getByRole("button", { name: "Global.buttons.unpublish" });
    fireEvent.click(unPublishBtn);

    await waitFor(() => {
      expect(mockToast.add).toHaveBeenCalledWith('Guidance.messages.success.guidanceGroupUnpublished', { type: 'success' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/admin/guidance');
      expect(unPublishGuidanceGroupAction).toHaveBeenCalledWith({
        guidanceGroupId: 2398
      });
    });
  });

  it('should handle redirect if response contains redirect', async () => {
    (unPublishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2397,
        name: "CDL Guidance Group",
        errors: {
          affiliationId: null,
          bestPractice: null,
          description: null,
          general: null,
          name: null
        },
      },
      redirect: '/en-US/admin/guidance/redirect-page'
    });
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const unPublishBtn = inSidebar.getByRole("button", { name: "Global.buttons.unpublish" });
    fireEvent.click(unPublishBtn);

    await waitFor(() => {

      expect(mockRouter.push).not.toHaveBeenCalledWith('/en-US/admin/guidance/redirect-page')
    });
  });

  it('should handle handleUnpublish when response is not successful', async () => {
    (unPublishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: false,
      errors: ['Some error occurred'],
    });
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const unPublishBtn = inSidebar.getByRole("button", { name: "Global.buttons.unpublish" });
    fireEvent.click(unPublishBtn);

    // Since guidanceGroupId is undefined, we expect an inline error message and no side effects
    await waitFor(() => {
      expect(screen.getByText('Some error occurred')).toBeInTheDocument();
      //Check that error logged
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'Unpublishing Guidance Group',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/admin/guidance/groups/create' },
        })
      )
    });
  });

  it('should display error if field-level errors returned from handleUnpublish', async () => {
    (unPublishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2397,
        name: "CDL Guidance Group",
        errors: {
          affiliationId: null,
          bestPractice: null,
          description: null,
          general: "There was a general error",
          name: null
        },
      },
    });
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const unPublishBtn = inSidebar.getByRole("button", { name: "Global.buttons.unpublish" });
    fireEvent.click(unPublishBtn);

    await waitFor(() => {
      expect(screen.getByText('There was a general error')).toBeInTheDocument();
      //Check that error logged
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'Unpublishing Guidance Group',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/admin/guidance/groups/create' },
        })
      )
    });
  });

  it('should handle publishing of guidance group', async () => {
    (publishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2397,
        name: "CDL Guidance Group",
        errors: {
          affiliationId: null,
          bestPractice: null,
          description: null,
          general: null,
          name: null
        },
      },
    });
    render(
      <MockedProvider mocks={inactiveGroupMocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );


    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const publishBtn = inSidebar.getByRole("button", { name: "Global.buttons.publish" });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(mockToast.add).toHaveBeenCalledWith('Guidance.messages.success.guidanceGroupPublished', { type: 'success' });
      expect(mockRouter.push).toHaveBeenCalledWith('/en-US/admin/guidance');
      expect(publishGuidanceGroupAction).toHaveBeenCalledWith({
        guidanceGroupId: 2398
      });
    });
    // Button should be disabled for unpublish now
    const unpublishBtn = inSidebar.getByRole("button", { name: "Global.buttons.unpublish" });
    expect(unpublishBtn).toBeInTheDocument();
    expect(unpublishBtn).toHaveAttribute("aria-disabled", "true");
    expect(unpublishBtn).toHaveClass("buttonSmallDisabled", "secondary");
  });

  it('should handle redirect if response from handlePublish contains redirect', async () => {
    (publishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2397,
        name: "CDL Guidance Group",
        errors: {
          affiliationId: null,
          bestPractice: null,
          description: null,
          general: null,
          name: null
        },
      },
      redirect: '/en-US/admin/guidance/redirect-page'
    });
    render(
      <MockedProvider mocks={inactiveGroupMocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const publishBtn = inSidebar.getByRole("button", { name: "Global.buttons.publish" });
    fireEvent.click(publishBtn);

    // Since guidanceGroupId is undefined, we expect an inline error message and no side effects
    await waitFor(() => {
      expect(mockRouter.push).not.toHaveBeenCalledWith('/en-US/admin/guidance/redirect-page')
    });
  });

  it('should handle handlepublish when response is not successful', async () => {
    (publishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: false,
      errors: ['Some error occurred'],
    });
    render(
      <MockedProvider mocks={inactiveGroupMocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const publishBtn = inSidebar.getByRole("button", { name: "Global.buttons.publish" });
    fireEvent.click(publishBtn);

    // Since guidanceGroupId is undefined, we expect an inline error message and no side effects
    await waitFor(() => {
      expect(screen.getByText('Some error occurred')).toBeInTheDocument();
      //Check that error logged
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'publishing Guidance Group',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/admin/guidance/groups/create' },
        })
      )
    });
  });

  it('should display error if field-level errors returned from handlepublish', async () => {
    (publishGuidanceGroupAction as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        id: 2397,
        name: "CDL Guidance Group",
        errors: {
          affiliationId: null,
          bestPractice: null,
          description: null,
          general: "There was a general error",
          name: null
        },
      },
    });
    render(
      <MockedProvider mocks={inactiveGroupMocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const sidebar = screen.getByTestId("sidebar-panel");
    const inSidebar = within(sidebar);
    const publishBtn = inSidebar.getByRole("button", { name: "Global.buttons.publish" });
    fireEvent.click(publishBtn);


    // Since guidanceGroupId is undefined, we expect an inline error message and no side effects
    await waitFor(() => {
      expect(screen.getByText('There was a general error')).toBeInTheDocument();
      //Check that error logged
      expect(logECS).toHaveBeenCalledWith(
        'error',
        'publishing Guidance Group',
        expect.objectContaining({
          errors: expect.anything(),
          url: { path: '/en-US/admin/guidance/groups/create' },
        })
      )
    });
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <GuidanceGroupIndexPage />
      </MockedProvider>,
    );

    // Wait for loading to be gone (tagsLoading and guidanceLoading both false)
    await waitForElementToBeRemoved(() => screen.getByText("Global.messaging.loading"));

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
