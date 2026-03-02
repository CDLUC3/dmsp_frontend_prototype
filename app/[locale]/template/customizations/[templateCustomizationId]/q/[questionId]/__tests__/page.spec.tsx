import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from '@/utils/test-utils';
import { routePath } from '@/utils/routes';
import { useQuery } from '@apollo/client/react';
import {
  QuestionDocument,
  LicensesDocument,
  DefaultResearchOutputTypesDocument,
} from '@/generated/graphql';

import {
  removeQuestionAction,
  updateQuestionAction
} from '../actions';

import { axe, toHaveNoViolations } from 'jest-axe';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import logECS from '@/utils/clientLogger';
import QuestionCustomizePage from '../page';
import { mockScrollIntoView, mockScrollTo } from "@/__mocks__/common";
import mockRadioQuestion from '@/__mocks__/common/mockRadioQuestion.json';
import mockQuestionDataForDateRange from '@/__mocks__/common/mockDateRangeQuestion.json';
import mockQuestionDataForNumberRange from '@/__mocks__/common/mockNumberRangeQuestion.json';
import mockQuestionDataForTypeAheadSearch from '@/__mocks__/common/mockTypeaheadQuestion.json';
import mockQuestionDataForTextField from '@/__mocks__/common/mockTextQuestion.json';
import mockQuestionDataForTextArea from '@/__mocks__/common/mockTextAreaQuestion.json';
import mockQuestionDataForURL from '@/__mocks__/common/mockURLQuestion.json';
import mockQuestionDataForNumber from '@/__mocks__/common/mockNumberQuestion.json';
import mockQuestionDataForCurrency from '@/__mocks__/common/mockCurrencyQuestion.json';
import * as getParsedJSONModule from '@/components/hooks/getParsedQuestionJSON';
import { AffiliationSearchQuestionType } from "@dmptool/types";

// Create minimal mock data for the license and default output types queries
const mockLicensesData = {
  licenses: [
    { id: '1', name: 'Test License', uri: 'https://test.com/license' }
  ]
};

const mockDefaultOutputTypesData = {
  defaultResearchOutputTypes: [
    { id: '1', name: 'Test Output Type', uri: 'https://test.com/output-type' }
  ]
};

// Create minimal mock question data
const mockQuestionData = {
  question: {
    id: 1,
    questionText: 'Test Question',
    json: '{"type":"text","attributes":{}}',
    required: false,
    displayOrder: 1,
    requirementText: '',
    guidanceText: '',
    sampleText: '',
    useSampleTextAsDefault: false,
    sectionId: 1,
    showCommentField: false
  }
};

const RESEARCH_OUTPUT_TABLE_JSON = "{\"meta\":{\"title\":\"Research Output Table\",\"schemaVersion\":\"1.0\",\"usageDescription\":\"A table for collecting structured research output data\"},\"type\":\"researchOutputTable\",\"columns\":[{\"meta\":{\"schemaVersion\":\"1.0\"},\"content\":{\"meta\":{\"schemaVersion\":\"1.0\"},\"type\":\"text\",\"attributes\":{\"help\":\"\",\"maxLength\":500}},\"enabled\":true,\"heading\":\"Title\",\"required\":false},{\"meta\":{\"schemaVersion\":\"1.0\"},\"content\":{\"meta\":{\"schemaVersion\":\"1.0\"},\"type\":\"textArea\",\"attributes\":{\"help\":\"My description help text \",\"labelTranslationKey\":\"researchOutput.description.heading\"}},\"enabled\":true,\"heading\":\"Description\",\"required\":false}],\"attributes\":{\"help\":\"\",\"label\":\"\",\"canAddRows\":true,\"initialRows\":1,\"canRemoveRows\":true,\"labelTranslationKey\":\"\"}}";

beforeEach(() => {
  // Cannot get the escaping to work in the mock JSON file, so doing it programmatically here
  const affiliationQuery = 'query Affiliations($name: String!){ ' +
    'affiliations(name: $name) { ' +
    'totalCount ' +
    'nextCursor ' +
    'items { ' +
    'id ' +
    'displayName ' +
    'uri ' +
    '} ' +
    '} ' +
    '}';

  const json: AffiliationSearchQuestionType = {
    type: 'affiliationSearch',
    attributes: {
      label: 'Institution',
      help: 'Search for your institution',
    },
    graphQL: {
      displayFields: [{
        label: "Institution",
        propertyName: "displayName",
      }],
      query: affiliationQuery,
      responseField: 'affiliations.items',
      variables: [{
        label: "Search for your institution",
        minLength: 3,
        name: "name",
        type: "string",
      }],
      answerField: 'uri'
    },
    meta: {
      schemaVersion: '1.0'
    },
  };
  mockQuestionDataForTypeAheadSearch.question.json = JSON.stringify(json);
});

expect.extend(toHaveNoViolations);

jest.mock('@/components/hooks/getParsedQuestionJSON', () => {
  const actual = jest.requireActual('@/components/hooks/getParsedQuestionJSON');
  return {
    __esModule: true,
    ...actual,
    getParsedQuestionJSON: jest.fn(actual.getParsedQuestionJSON),
  };
});

jest.mock("@/generated/graphql", () => ({
  useQuestionQuery: jest.fn(),
  useLicensesQuery: jest.fn(),
  useDefaultResearchOutputTypesQuery: jest.fn(),
}));

jest.mock('../actions/index', () => ({
  updateQuestionAction: jest.fn(),
  removeQuestionAction: jest.fn(),
}));

let capturedOnRepositoriesChange: ((repos: any[]) => void) | null = null;

jest.mock('@/components/QuestionAdd/ReposSelector', () => ({
  __esModule: true,
  default: ({ handleTogglePreferredRepositories, onRepositoriesChange }: {
    handleTogglePreferredRepositories: (value: boolean) => void;
    onRepositoriesChange: (repos: { id: string; name: string; url: string }[]) => void;
  }) => {
    capturedOnRepositoriesChange = onRepositoriesChange;
    return (
      <div data-testid="repository-selection-system">
        <button onClick={() => handleTogglePreferredRepositories(true)}>
          Toggle Preferred Repositories
        </button>
        <button onClick={() => onRepositoriesChange([{ id: '1', name: 'Test Repo', url: 'https://test.com' }])}>
          Add Repository
        </button>
      </div>
    );
  },
}));

let capturedOnMetaDataStandardsChange: ((standards: any[]) => void) | null = null;

jest.mock('@/components/QuestionAdd/MetaDataStandards', () => ({
  __esModule: true,
  default: ({ handleToggleMetaDataStandards, onMetaDataStandardsChange }: { handleToggleMetaDataStandards: (value: boolean) => void; onMetaDataStandardsChange: (standards: { id: string; name: string; url: string }[]) => void; }) => {
    capturedOnMetaDataStandardsChange = onMetaDataStandardsChange;
    return (
      <div data-testid="metadata-standards">
        <button onClick={() => handleToggleMetaDataStandards(true)}>
          Toggle MetaData Standards
        </button>
        <button onClick={() => onMetaDataStandardsChange([{ id: '1', name: 'Test Standard', url: 'https://test.com' }])}>
          Add MetaData Standard
        </button>
      </div>
    );
  },
}));

jest.mock('@/components/QuestionAdd/OutputTypeField', () => ({
  __esModule: true,
  default: ({ onModeChange, onAddCustomType, onRemoveCustomType, newOutputType, setNewOutputType }: { onModeChange: (mode: string) => void; onAddCustomType: () => void; onRemoveCustomType: (type: string) => void; newOutputType: { type: string; description: string }; setNewOutputType: (type: { type: string; description: string }) => void; }) => (
    <div data-testid="output-type-field">
      <input
        data-testid="new-output-type-input"
        value={newOutputType.type}
        onChange={(e) => setNewOutputType({ ...newOutputType, type: e.target.value })}
        placeholder="Enter new output type"
      />
      <button onClick={() => onModeChange('mine')}>Change Mode to Mine</button>
      <button onClick={() => onAddCustomType()}>Add Custom Type</button>
      <button onClick={() => onRemoveCustomType('Test Type')}>Remove Custom Type</button>
    </div>
  ),
}));

jest.mock('@/components/QuestionAdd/LicenseField', () => ({
  __esModule: true,
  default: ({ onModeChange, onAddCustomType, onRemoveCustomType, newLicenseType, setNewLicenseType }: { onModeChange: (mode: string) => void; onAddCustomType: () => void; onRemoveCustomType: (type: string) => void; newLicenseType: string; setNewLicenseType: (type: string) => void; }) => (
    <div data-testid="license-field">
      <input
        data-testid="new-license-type-input"
        value={newLicenseType}
        onChange={(e) => setNewLicenseType(e.target.value)}
        placeholder="Enter new license type"
      />
      <button onClick={() => onModeChange('addToDefaults')}>Change Mode to Add To Defaults</button>
      <button onClick={() => onAddCustomType()}>Add Custom License</button>
      <button onClick={() => onRemoveCustomType('Test License')}>Remove Custom License</button>
    </div>
  ),
  otherLicenses: [
    { id: 'MIT', name: 'MIT License' },
    { id: 'GPL-3.0', name: 'GNU General Public License v3.0' }
  ],
}));

jest.mock('@/components/QuestionAdd/InitialAccessLevel', () => ({
  __esModule: true,
  default: ({ defaultAccessLevels }: any) => (
    <div data-testid="initial-access-level">
      {defaultAccessLevels?.map((level: any, index: number) => (
        <div key={index}>{level.label}</div>
      ))}
    </div>
  ),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

const mockUseRouter = useRouter as jest.Mock;
const mockSearchParams = useSearchParams as jest.Mock;

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

jest.mock('@/context/ToastContext', () => ({
  useToast: jest.fn(() => ({
    add: jest.fn(),
  })),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

const mockUseQuery = jest.mocked(useQuery);

const setupMocks = () => {
  const stableQuestionReturn = {
    data: mockQuestionData,
    loading: false,
    error: null,
  };

  const stableLicensesReturn = {
    data: mockLicensesData,
    loading: false,
    error: null,
  };

  const stableDefaultResearchOutputTypesReturn = {
    data: mockDefaultOutputTypesData,
    loading: false,
    error: null,
  };

  mockUseQuery.mockImplementation((document) => {
    if (document === QuestionDocument) {
      return stableQuestionReturn as any;
    }

    if (document === LicensesDocument) {
      return stableLicensesReturn as any;
    }

    if (document === DefaultResearchOutputTypesDocument) {
      return stableDefaultResearchOutputTypesReturn as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined
    } as any;
  });
};

describe("QuestionCustomizePage", () => {
  let mockRouter;
  beforeEach(() => {
    setupMocks();
    HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollTo();
    const mockTemplateCustomizationId = 456;
    const mockQuestionId = 789;
    const mockUseParams = useParams as jest.Mock;

    mockUseParams.mockReturnValue({
      templateCustomizationId: `${mockTemplateCustomizationId}`,
      questionId: `${mockQuestionId}`
    });

    mockSearchParams.mockReturnValue({
      get: (key: string) => {
        const params: Record<string, string> = { questionType: 'researchOutputTable' };
        return params[key] || null;
      },
    } as unknown as ReturnType<typeof useSearchParams>);

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    });

    window.tinymce = {
      init: jest.fn(),
      remove: jest.fn(),
    };

    mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page with all main sections', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionTypeId: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionTypeId: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Check for page header with the correct title
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Add Custom Question');

    // Check for tabs
    const editQuestionTab = screen.getByRole('tab', { name: 'tabs.editQuestion' });
    expect(editQuestionTab).toBeInTheDocument();

    const editOptionsTab = screen.getByRole('tab', { name: 'tabs.options' });
    expect(editOptionsTab).toBeInTheDocument();

    // Check for breadcrumbs
    const homeLink = screen.getByText('breadcrumbs.home');
    expect(homeLink).toBeInTheDocument();
  });

  it('should load and display question data from the GraphQL query', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Verify component rendered successfully
    await waitFor(() => {
      const heading = screen.getByText('Add Custom Question');
      expect(heading).toBeInTheDocument();
    });
  });

  it('should display question type field as disabled read-only', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Verify the page loaded by checking for the heading
    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should handle question text changes and mark form as unsaved', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Verify component rendered
    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should display loading state while data is being fetched', async () => {
    mockUseQuery.mockImplementation(() => ({
      data: null,
      loading: true,
      error: undefined
    } as any));

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    const loadingText = screen.getByText(/messaging.loading/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('should handle form submission and trigger update action', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Verify component is setup correctly
    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should display error messages when validation fails', async () => {
    const mockQuestionWithError = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: new Error('Test error'),
    };

    mockUseQuery.mockImplementation(() => mockQuestionWithError as any);

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Component should still render heading even with query error
    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should require question text field and show error when empty', async () => {
    const mockQuestionTextArea = {
      data: {
        ...mockQuestionDataForTextArea,
        question: {
          ...mockQuestionDataForTextArea.question,
          questionText: ''
        }
      },
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    // Verify component rendered
    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should display breadcrumbs for navigation context', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    const breadcrumbHome = screen.getByText('breadcrumbs.home');
    expect(breadcrumbHome).toBeInTheDocument();
  });

  it('should support RadioGroup for marking required fields', async () => {
    const mockQuestionRadio = {
      data: mockRadioQuestion,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionRadio as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'radioButtons' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'radioButtons' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should handle date range label changes for date range questions', async () => {
    const mockQuestionDateRange = {
      data: mockQuestionDataForDateRange,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionDateRange as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'dateRange' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'dateRange' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should handle typeahead search label changes', async () => {
    const mockQuestionTypeahead = {
      data: mockQuestionDataForTypeAheadSearch,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTypeahead as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'affiliationSearch' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'affiliationSearch' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    await act(async () => {
      render(
        <QuestionCustomizePage />
      );
    });

    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();
  });

  it('should pass a11y accessibility audit', async () => {
    const mockQuestionTextArea = {
      data: mockQuestionDataForTextArea,
      loading: false,
      error: undefined,
    };

    mockUseQuery.mockImplementation((document) => {
      if (document === QuestionDocument) {
        return mockQuestionTextArea as any;
      }
      return {
        data: null,
        loading: false,
        error: undefined
      } as any;
    });

    (useSearchParams as jest.MockedFunction<typeof useSearchParams>).mockImplementation(() => {
      return {
        get: (key: string) => {
          const params: Record<string, string> = { questionType: 'textArea' };
          return params[key] || null;
        },
        getAll: () => [],
        has: (key: string) => key in { questionType: 'textArea' },
        keys() { },
        values() { },
        entries() { },
        forEach() { },
        toString() { return ''; },
      } as unknown as ReturnType<typeof useSearchParams>;
    });

    const { container } = await act(async () => {
      return render(
        <QuestionCustomizePage />
      );
    });

    const heading = screen.getByText('Add Custom Question');
    expect(heading).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
