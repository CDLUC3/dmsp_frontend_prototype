import React from "react";
import {act, render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RelatedWorksList, RelatedWorksSortBy} from "../index";
import "@testing-library/jest-dom";
import {axe, toHaveNoViolations} from "jest-axe";
import {NextIntlClientProvider} from "next-intl";
import {useQuery} from '@apollo/client/react';
import {
  RelatedWorksDocument,
  RelatedWorksIdentifierType,
  RelatedWorkStatus,
} from "@/generated/graphql";
import {
  MOCK_ACCEPTED_WORKS,
  MOCK_PENDING_WORKS,
  MOCK_REJECTED_WORKS
} from "@/app/[locale]/projects/[projectId]/dmp/[dmpid]/related-works/mockWorks";

expect.extend(toHaveNoViolations);

// Mock Apollo Client hooks
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));


// Cast with jest.mocked utility
const mockUseQuery = jest.mocked(useQuery);

const setupMocks = () => {
  mockUseQuery.mockImplementation((document) => {
    if (document === RelatedWorksDocument) {
      return {
        data: {
          relatedWorks: {
            items: MOCK_PENDING_WORKS,
          },
        },
        loading: false,
        error: undefined,
        refetch: jest.fn()
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } as any;
    }

    return {
      data: null,
      loading: false,
      error: undefined
    };
  });
};

interface TestProvidersProps {
  children: React.ReactNode;
  defaultSortBy?: RelatedWorksSortBy;
}

export const TestProviders: React.FC<TestProvidersProps> = ({ children }) => {
  const detectedLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <NextIntlClientProvider
      locale={detectedLocale}
      timeZone={detectedTimeZone}
      messages={{}}
    >
      {children}
    </NextIntlClientProvider>
  );
};

describe("RelatedWorksList", () => {
  beforeEach(() => {
    setupMocks();
  })

  it("should render two pending items", () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: MOCK_PENDING_WORKS,
              totalCount: 2,
              limit: 2,
              currentOffset: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // Render two items
    expectDois("related-works-list", ["10.1016/fake.2025.293748", "10.1126/fake.2025.084512"]);
  });

  it("should render two related items", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: MOCK_ACCEPTED_WORKS,
              totalCount: 2,
              limit: 2,
              currentOffset: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Accepted}
        />
      </TestProviders>,
    );

    expectDois("related-works-list", ["10.5555/fake.2025.661100", "10.5555/fake.2025.443322"]);
  });

  it("should render one discarded item", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: MOCK_REJECTED_WORKS,
              totalCount: 1,
              limit: 1,
              currentOffset: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Rejected}
        />
      </TestProviders>,
    );

    expectDois("related-works-list", ["10.3847/fake.2025.245187"]);
  });

  it("should display confidence filter", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
              confidenceCounts: [
                { typeId: "HIGH", count: 3 },
                { typeId: "MEDIUM", count: 2 },
                { typeId: "LOW", count: 1 },
              ],
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // High
    const all = screen.getByRole("radio", { name: "confidence.ALL" });
    expect(all).toBeVisible();

    // High
    const high = screen.getByRole("radio", { name: "confidence.HIGH(3)" });
    expect(high).toBeVisible();

    // Medium
    const medium = screen.getByRole("radio", { name: "confidence.MEDIUM(2)" });
    expect(medium).toBeVisible();

    // Low
    const low = screen.getByRole("radio", { name: "confidence.LOW(1)" });
    expect(low).toBeVisible();
  });

  it("should display work type filter", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
              workTypeCounts: [
                { typeId: "DATASET", count: 5 },
                { typeId: "ARTICLE", count: 20 },
                { typeId: "DISSERTATION", count: 3 },
              ],
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // Get filter by type and click it to open it
    const button = screen.getByRole("button", { name: "filters.filterByTypePlaceholder filters.filterByTypePlaceholder" });
    await userEvent.click(button);

    // Get option text
    const optionTexts = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((option) => option.textContent);

    // Check values
    expect(optionTexts).toHaveLength(4);
    expect(optionTexts).toEqual([
      "filters.filterByTypePlaceholder",
      "workType.ARTICLE (20)",
      "workType.DATASET (5)",
      "workType.DISSERTATION (3)",
    ]);
  });

  it("should display sort by filter: pending", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    // Pending
    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // Get filter by type and click it to open it
    const button = screen.getByRole("button", { name: "filters.sortBy.ConfidenceHigh filters.sort" });
    await userEvent.click(button);

    // Get option text
    const optionTexts = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((option) => option.textContent);

    // Check values
    expect(optionTexts).toHaveLength(6);
    expect(optionTexts).toEqual([
      "filters.sortBy.ConfidenceHigh",
      "filters.sortBy.ConfidenceLow",
      "filters.sortBy.PublishedNew",
      "filters.sortBy.PublishedOld",
      "filters.sortBy.DateFoundNew",
      "filters.sortBy.DateFoundOld",
    ]);
  });

  it("should display sort by filter: accepted", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Accepted}
        />
      </TestProviders>,
    );

    // Get filter by type and click it to open it
    const button = screen.getByRole("button", { name: "filters.sortBy.PublishedNew filters.sort" });
    await userEvent.click(button);

    // Get option text
    const optionTexts = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((option) => option.textContent);

    // Check values
    expect(optionTexts).toHaveLength(6);
    expect(optionTexts).toEqual([
      "filters.sortBy.ConfidenceHigh",
      "filters.sortBy.ConfidenceLow",
      "filters.sortBy.ReviewedNew",
      "filters.sortBy.ReviewedOld",
      "filters.sortBy.PublishedNew",
      "filters.sortBy.PublishedOld",
    ]);
  });

  it("should display sort by filter: rejected", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Rejected}
        />
      </TestProviders>,
    );

    // Get filter by type and click it to open it
    const button = screen.getByRole("button", { name: "filters.sortBy.ReviewedNew filters.sort" });
    await userEvent.click(button);

    // Get option text
    const optionTexts = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((option) => option.textContent);

    // Check values
    expect(optionTexts).toHaveLength(6);
    expect(optionTexts).toEqual([
      "filters.sortBy.ConfidenceHigh",
      "filters.sortBy.ConfidenceLow",
      "filters.sortBy.ReviewedNew",
      "filters.sortBy.ReviewedOld",
      "filters.sortBy.PublishedNew",
      "filters.sortBy.PublishedOld",
    ]);
  });

  it("should display no results message: no works", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
              totalCount: 0,
              statusOnlyCount: 0,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    const { container } = render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    const messages = container.querySelectorAll("div.noResults");
    expect(messages).not.toBeNull();
    if (messages !== null) {
      expect(messages.length).toBe(1);
      expect(messages[0].textContent).toEqual("messages.PENDING.noResults");
    }
  });

  it("should display no results message: no filtered works", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: [],
              totalCount: 0,
              statusOnlyCount: 10,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    const { container } = render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    const messages = container.querySelectorAll("div.noResults");
    expect(messages).not.toBeNull();
    if (messages !== null) {
      expect(messages.length).toBe(1);
      expect(messages[0].textContent).toEqual("messages.PENDING.noFilteredResults");
    }
  });

  it("should highlight matches", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: MOCK_PENDING_WORKS,
              totalCount: 2,
              limit: 2,
              currentOffset: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // Expand first item
    const container = screen.getByTestId("related-works-list");
    const listItems = within(container).queryAllByRole("listitem");
    expect(listItems.length).toBe(2);
    const firstItem = listItems[0];
    const review = within(firstItem).getByRole("button", {
      name: "buttons.expand details for Synthetic Empathy: Emotional Intelligence in Autonomous Agents",
    });
    await userEvent.click(review);

    // Check that highlighting is disabled
    expect(firstItem.querySelectorAll(".match").length).toBe(0);
    expect(firstItem.querySelectorAll(".showContentHighlights").length).toBe(0);
    expect(firstItem.querySelectorAll(".hideContentHighlights").length).toBeGreaterThan(0);

    // Toggle highlighting
    const highlightMatches = screen.getByRole("switch", { name: "filters.highlightMatches" });
    await userEvent.click(highlightMatches);

    // Check that highlighting is activated
    expect(firstItem.querySelectorAll(".match").length).toBeGreaterThan(0);
    expect(firstItem.querySelectorAll(".showContentHighlights").length).toBeGreaterThan(0);
    expect(firstItem.querySelectorAll(".hideContentHighlights").length).toBe(0);
  });

  it("should pass axe accessibility test", async () => {
    mockUseQuery.mockImplementation((document) => {
      if (document === RelatedWorksDocument) {
        return {
          data: {
            relatedWorks: {
              items: MOCK_PENDING_WORKS,
              totalCount: 2,
              limit: 2,
              currentOffset: 0,
              hasNextPage: false,
              hasPreviousPage: false,
              statusOnlyCount: 2,
            },
          },
          loading: false,
          error: undefined,
          refetch: jest.fn()
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any;
      }

      return {
        data: null,
        loading: false,
        error: undefined
      };
    });

    const { container } = render(
      <TestProviders>
        <RelatedWorksList
          identifierType={RelatedWorksIdentifierType.PlanId}
          identifier={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

function expectDois(testId: string, expectedDois: string[]) {
  const container = screen.getByTestId(testId);
  const dois = within(container)
    .queryAllByRole("listitem")
    .map((item) => item.getAttribute("data-testid"));

  expect(dois.length).toBe(expectedDois.length);
  expect(dois).toStrictEqual(expectedDois);
}
