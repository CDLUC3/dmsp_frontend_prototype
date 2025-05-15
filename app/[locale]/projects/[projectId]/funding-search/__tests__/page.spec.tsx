import React from 'react';

import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';

import { useTranslations as OriginalUseTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import CreateProjectSearchFunder from '../page';
import { axe, toHaveNoViolations } from 'jest-axe';


expect.extend(toHaveNoViolations);

// Mock the GraphQL mutation
jest.mock('@/generated/graphql', () => ({
  useAddProjectMutation: jest.fn(),
}));

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));


describe("CreateProjectSearchFunder", () => {
  beforeEach(() => {
    const mockParams = useParams as jest.Mock;
    mockParams.mockReturnValue({ projectId: '123' });

    // Mock the router
    // mockRouter = { push: jest.fn() };
    // (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // mockHook(useAffiliationsLazyQuery).mockReturnValue({
    //   data: mockFunderResults,
    //   loading: false,
    //   error: null,
    // });
  });

  it("Should render the view", async () => {
    render(<CreateProjectSearchFunder />);
    expect(screen.getByTestId('search-component')).toBeInTheDocument();
  });
});
