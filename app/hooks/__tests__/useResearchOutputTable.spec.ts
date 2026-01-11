import { renderHook, act } from '@testing-library/react';
import { useResearchOutputTable } from '../useResearchOutputTable';
import type { ResearchOutputTableQuestionType } from '@dmptool/types';
import { useQuery } from '@apollo/client/react';
import {
  LicensesDocument,
  DefaultResearchOutputTypesDocument,
} from '@/generated/graphql';

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

// Mocks for next-intl and GraphQL hooks
jest.mock('next-intl', () => ({
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useTranslations: () => (key: string, params?: any) => {
    if (params && typeof params === 'object') {
      return `${key} ${JSON.stringify(params)}`;
    }
    return key;
  },
}));

// Cast with jest.mocked utility
const mockUseQuery = jest.mocked(useQuery);

const setupMocks = () => {
  const stableLicensesReturn = {
    data: {
      licenses: {
        items: [
          { name: 'MIT', uri: 'mit-uri', recommended: true },
          { name: 'GPL', uri: 'gpl-uri', recommended: false },
        ],
      },
    },
    loading: false,
    error: null,
  };

  const stableDefaultResearchOutputTypesReturn = {
    data: {
      defaultResearchOutputTypes: [
        { name: 'Dataset', value: 'dataset', description: 'A dataset' },
        { name: 'Software', value: 'software', description: 'A software' },
      ],
    },
    loading: false,
    error: null,
  };

  mockUseQuery.mockImplementation((document) => {

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
    };
  });

};
describe('useResearchOutputTable', () => {
  let setHasUnsavedChanges: jest.Mock;
  let announce: jest.Mock;

  beforeEach(() => {
    setupMocks();
    setHasUnsavedChanges = jest.fn();
    announce = jest.fn();
  });

  it('should initialize with default standard fields and states', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    expect(result.current.standardFields.length).toBeGreaterThan(0);
    expect(result.current.expandedFields).toEqual(['title', 'outputType']);
    expect(result.current.nonCustomizableFieldIds).toContain('accessLevels');
    expect(result.current.additionalFields).toEqual([]);
    expect(typeof result.current.buildResearchOutputFormState).toBe('function');
  });

  it('should add and delete additional fields', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    act(() => {
      result.current.addAdditionalField();
    });
    expect(result.current.additionalFields.length).toBe(1);
    const fieldId = result.current.additionalFields[0].id;
    act(() => {
      result.current.handleDeleteAdditionalField(fieldId);
    });
    expect(result.current.additionalFields.length).toBe(0);
  });

  it('should update additional field properties', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    act(() => {
      result.current.addAdditionalField();
    });
    const fieldId = result.current.additionalFields[0].id;
    act(() => {
      result.current.handleUpdateAdditionalField(fieldId, 'customLabel', 'My Custom Label');
    });
    expect(result.current.additionalFields[0].customLabel).toBe('My Custom Label');
  });

  it('should handle standard field enable/disable', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    const fieldId = result.current.standardFields[1].id; // description
    act(() => {
      result.current.handleStandardFieldChange(fieldId, true);
    });
    expect(result.current.standardFields.find(f => f.id === fieldId)?.enabled).toBe(true);
    expect(result.current.expandedFields).toContain(fieldId);
    expect(announce).toHaveBeenCalled();
  });

  it('should handle customize field expand/collapse', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    const fieldId = result.current.standardFields[1].id; // description
    act(() => {
      result.current.handleCustomizeField(fieldId);
    });
    expect(result.current.expandedFields).toContain(fieldId);
    act(() => {
      result.current.handleCustomizeField(fieldId);
    });
    expect(result.current.expandedFields).not.toContain(fieldId);
  });

  it('should handle adding and removing custom output types', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    act(() => {
      result.current.handleOutputTypeModeChange('mine');
    });
    act(() => {
      result.current.setNewOutputType({ type: 'CustomType', description: 'desc' });
    });
    act(() => {
      result.current.handleAddCustomOutputType();
    });
    let outputTypeField = result.current.standardFields.find(f => f.id === 'outputType');
    expect(outputTypeField?.outputTypeConfig?.customTypes.some(t => t.type === 'CustomType')).toBe(true);

    act(() => {
      result.current.handleRemoveCustomOutputType('CustomType');
    });
    outputTypeField = result.current.standardFields.find(f => f.id === 'outputType');
    expect(outputTypeField?.outputTypeConfig?.customTypes.some(t => t.type === 'CustomType')).toBe(false);
  });

  it('should handle adding and removing custom license types', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));

    act(() => {
      result.current.handleLicenseModeChange('addToDefaults');
    });

    // Use GPL (which is not recommended) instead of MIT
    act(() => {
      result.current.setNewLicenseType('gpl-uri');
    });

    act(() => {
      result.current.handleAddCustomLicenseType();
    });

    // Check that GPL was added (MIT is already there from mode change)
    let licenseField = result.current.standardFields.find(f => f.id === 'licenses');
    expect(licenseField?.licensesConfig?.customTypes.filter(l => l.name === 'GPL').length).toBe(1);
    expect(licenseField?.licensesConfig?.customTypes.filter(l => l.name === 'MIT').length).toBe(1); // Pre-populated

    // Remove GPL
    act(() => {
      result.current.handleRemoveCustomLicenseType('GPL');
    });

    // Re-query the field to get the UPDATED state
    licenseField = result.current.standardFields.find(f => f.id === 'licenses');
    expect(licenseField?.licensesConfig?.customTypes.filter(l => l.name === 'GPL').length).toBe(0);
    expect(licenseField?.licensesConfig?.customTypes.filter(l => l.name === 'MIT').length).toBe(1); // Still there
  });

  it('should build research output form state with enabled fields', () => {
    const { result } = renderHook(() => useResearchOutputTable({ setHasUnsavedChanges, announce }));
    const formState = result.current.buildResearchOutputFormState() as ResearchOutputTableQuestionType;
    expect(formState.type).toBeDefined();
    expect(Array.isArray(formState.columns)).toBe(true);
    expect(formState.columns.length).toBeGreaterThan(0);
  });
});
