import { renderHook } from '@testing-library/react';
import { useTemplateStatus } from '../useTemplateStatus';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}));

describe('useTemplateStatus', () => {
  const { result } = renderHook(() => useTemplateStatus());

  describe('getCustomizationStatus', () => {
    it('should return NOT_STARTED when isDirty is false and no publish date', () => {
      expect(result.current.getCustomizationStatus(false, null)).toBe('NOT_STARTED');
      expect(result.current.getCustomizationStatus(false, undefined)).toBe('NOT_STARTED');
    });

    it('should return DRAFT when isDirty is true and no publish date', () => {
      expect(result.current.getCustomizationStatus(true, null)).toBe('DRAFT');
      expect(result.current.getCustomizationStatus(true, undefined)).toBe('DRAFT');
    });

    it('should return UNPUBLISHED_CHANGES when isDirty is true and has publish date', () => {
      expect(result.current.getCustomizationStatus(true, '2024-01-01')).toBe('UNPUBLISHED_CHANGES');
    });

    it('should return PUBLISHED when isDirty is false and has publish date', () => {
      expect(result.current.getCustomizationStatus(false, '2024-01-01')).toBe('PUBLISHED');
    });
  });

  describe('getPublishStatusText', () => {
    it('should return not started status text when not started', () => {
      expect(result.current.getPublishStatusText(false, null)).toBe('status.notStarted');
    });

    it('should return draft status text when draft', () => {
      expect(result.current.getPublishStatusText(true, null)).toBe('status.draft');
    });

    it('should return unpublished changes status text when unpublished changes', () => {
      expect(result.current.getPublishStatusText(true, '2024-01-01')).toBe('status.unpublishedChanges');
    });

    it('should return published status text when published', () => {
      expect(result.current.getPublishStatusText(false, '2024-01-01')).toBe('status.published');
    });
  });
});