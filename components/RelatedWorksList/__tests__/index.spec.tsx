import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RelatedWorksList, RelatedWorksSortBy } from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import {
  RelatedWorkSearchResult,
  RelatedWorkSourceType,
  RelatedWorkStatus,
  useRelatedWorksByPlanQuery,
  WorkType,
} from "@/generated/graphql";

expect.extend(toHaveNoViolations);

jest.mock("@/generated/graphql", () => ({
  ...jest.requireActual("@/generated/graphql"),
  useRelatedWorksByPlanQuery: jest.fn(),
}));

export const MOCK_PENDING_WORKS: RelatedWorkSearchResult[] = [
  {
    id: 2,
    planId: 1,
    workVersion: {
      id: 2,
      work: {
        id: 2,
        doi: "10.1016/fake.2025.293748",
        created: "",
        modified: "",
      },
      hash: "",
      workType: WorkType.Dataset,
      publicationDate: "2024-03-10",
      title: "Synthetic Empathy: Emotional Intelligence in Autonomous Agents",
      authors: [
        {
          firstInitial: "M",
          givenName: "Marcus",
          middleInitials: null,
          middleNames: null,
          surname: "Nguyen",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "R",
          givenName: "Rebecca",
          middleInitials: "L",
          middleNames: "Lee",
          surname: "Stone",
          full: null,
          orcid: "0000-0001-2233-4455",
        },
        {
          firstInitial: "S",
          givenName: "Sofia",
          middleInitials: null,
          middleNames: null,
          surname: "Delgado",
          full: null,
          orcid: "0000-0004-1122-3344",
        },
      ],
      institutions: [
        { ror: "00f54p054", name: "Stanford University" },
        { ror: "01an7q238", name: "University of California, Berkeley" },
      ],
      funders: [{ ror: "021nxhr62", name: "U.S. National Science Foundation" }],
      awards: [{ awardId: "2145023" }],
      publicationVenue: "Artificial Intelligence & Society",
      sourceName: "OpenAlex",
      sourceUrl: "https://openalex.org/works/w2060245136",
      created: "",
      modified: "",
    },
    sourceType: RelatedWorkSourceType.SystemMatched,
    score: 0.6,
    scoreMax: 1.0,
    scoreNorm: 0.6,
    status: RelatedWorkStatus.Pending,
    doiMatch: {
      found: true,
      score: 15,
      sources: [],
    },
    contentMatch: {
      score: 18.0,
      titleHighlight:
        "<mark>Synthetic Empathy</mark>: <mark>Emotional Intelligence</mark> in <mark>Autonomous Agents</mark>",
      abstractHighlights: [],
    },
    authorMatches: [
      { index: 0, score: 2.0 },
      { index: 3, score: 2.0 },
    ],
    institutionMatches: [
      { index: 0, score: 2.0 },
      { index: 1, score: 2.0 },
    ],
    funderMatches: [{ index: 0, score: 2.0 }],
    awardMatches: [{ index: 0, score: 10.0 }],
    created: "2025-08-15",
    modified: "2025-08-15",
  },
  {
    id: 1,
    planId: 1,
    workVersion: {
      id: 1,
      work: {
        id: 1,
        doi: "10.1126/fake.2025.084512",
        created: "",
        modified: "",
      },
      hash: "",
      workType: WorkType.Article,
      publicationDate: "2020-05-15",
      title: "NeuroSynthetics: Toward Biologically-Inspired Cognitive Robotics",
      authors: [
        {
          firstInitial: "A",
          givenName: "Alyssa",
          middleInitials: "M",
          middleNames: "Marie",
          surname: "Langston",
          full: null,
          orcid: "0000-0003-1234-5678",
        },
        {
          firstInitial: "D",
          givenName: "David",
          middleInitials: null,
          middleNames: null,
          surname: "Choi",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "L",
          givenName: "Liam",
          middleInitials: "J",
          middleNames: "James",
          surname: "Patel",
          full: null,
          orcid: "0000-0002-9876-5432",
        },
        {
          firstInitial: "N",
          givenName: "Natalie",
          middleInitials: null,
          middleNames: null,
          surname: "Martinez",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "S",
          givenName: "Samuel",
          middleInitials: null,
          middleNames: null,
          surname: "Okafor",
          full: null,
          orcid: "0000-0001-8765-4321",
        },
        {
          firstInitial: "J",
          givenName: "Jasmine",
          middleInitials: null,
          middleNames: null,
          surname: "Reynolds",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "K",
          givenName: "Kieran",
          middleInitials: null,
          middleNames: null,
          surname: "Wang",
          full: null,
          orcid: "0000-0004-2299-1122",
        },
        {
          firstInitial: "E",
          givenName: "Emily",
          middleInitials: "R",
          middleNames: "Rose",
          surname: "Carter",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "O",
          givenName: "Omar",
          middleInitials: null,
          middleNames: null,
          surname: "Hassan",
          full: null,
          orcid: "0000-0005-6677-8899",
        },
        {
          firstInitial: "T",
          givenName: "Talia",
          middleInitials: null,
          middleNames: null,
          surname: "Nguyen",
          full: null,
          orcid: null,
        },
      ],
      institutions: [
        { ror: "042nb2s44", name: "Massachusetts Institute of Technology" },
        { ror: "05x2bcf33", name: "Carnegie Mellon University" },
      ],
      funders: [
        { ror: "021nxhr62", name: "U.S. National Science Foundation" },
        { ror: "01cwqze88", name: "National Institutes of Health" },
      ],
      awards: [{ awardId: "2357894" }, { awardId: "R01 HL201245-02" }],
      publicationVenue: "Journal of Future Robotics Research",
      sourceName: "OpenAlex",
      sourceUrl: "https://openalex.org/works/w2060245136",
      created: "",
      modified: "",
    },
    sourceType: RelatedWorkSourceType.SystemMatched,
    score: 0.3,
    scoreMax: 1.0,
    scoreNorm: 0.3,
    status: RelatedWorkStatus.Pending,
    doiMatch: {
      found: false,
      score: 0,
      sources: [],
    },
    contentMatch: {
      score: 0,
      titleHighlight: null,
      abstractHighlights: [],
    },
    authorMatches: [],
    institutionMatches: [{ index: 1, score: 2.0 }],
    funderMatches: [{ index: 0, score: 2.0 }],
    awardMatches: [],
    created: "2025-07-21",
    modified: "2025-07-21",
  },
];

export const MOCK_ACCEPTED_WORKS: RelatedWorkSearchResult[] = [
  {
    id: 3,
    planId: 1,
    workVersion: {
      id: 3,
      work: {
        id: 3,
        doi: "10.5555/fake.2025.661100",
        created: "",
        modified: "",
      },
      hash: "",
      workType: WorkType.Article,
      publicationDate: "2025-08-05",
      title: "Real-Time Sim2Real Transfer for Bipedal Robot Gait Adaptation",
      authors: [
        {
          firstInitial: "J",
          givenName: "Jordan",
          middleInitials: null,
          middleNames: null,
          surname: "Ali",
          full: null,
          orcid: "0000-0006-7890-1234",
        },
        {
          firstInitial: "S",
          givenName: "Samantha",
          middleInitials: null,
          middleNames: null,
          surname: "Rogers",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "C",
          givenName: "Carlos",
          middleInitials: "D",
          middleNames: "Diego",
          surname: "Ramirez",
          full: null,
          orcid: "0000-0005-5555-6789",
        },
        {
          firstInitial: "L",
          givenName: "Leila",
          middleInitials: null,
          middleNames: null,
          surname: "Chen",
          full: null,
          orcid: null,
        },
      ],
      institutions: [{ ror: "05dxps055", name: "California Institute of Technology" }],
      funders: [
        { ror: "021nxhr62", name: "U.S. National Science Foundation" },
        { ror: "01cwqze88", name: "National Institutes of Health" },
      ],
      awards: [{ awardId: "2288994" }, { awardId: "R01 EB765432-03" }],
      publicationVenue: "IEEE Robotics and Automation Letters",
      sourceName: "DataCite",
      sourceUrl: "https://commons.datacite.org/doi.org/10.5555/fake.2025.661100",
      created: "",
      modified: "",
    },
    sourceType: RelatedWorkSourceType.SystemMatched,
    score: 0.89,
    scoreMax: 1.0,
    scoreNorm: 0.89,
    status: RelatedWorkStatus.Accepted,
    doiMatch: {
      found: true,
      score: 15,
      sources: [],
    },
    contentMatch: {
      score: 18.0,
      titleHighlight:
        "Real-Time <mark>Sim2Real</mark> Transfer for <mark>Bipedal Robot</mark> <mark>Gait Adaptation</mark>",
      abstractHighlights: [
        "We propose a <mark>Sim2Real</mark> transfer technique for enabling dynamic <mark>bipedal robot</mark> locomotion across varying terrain conditions without retraining.",
        "Our results demonstrate improved <mark>gait adaptation</mark> using real-time sensory corrections during transitions between simulated and physical environments.",
      ],
    },
    authorMatches: [
      { index: 0, score: 2.0 },
      { index: 2, score: 2.0 },
    ],
    institutionMatches: [{ index: 0, score: 2.0 }],
    funderMatches: [
      { index: 0, score: 2.0 },
      { index: 1, score: 2.0 },
    ],
    awardMatches: [{ index: 0, score: 10.0 }],
    created: "2025-07-01",
    modified: "2025-07-02",
  },
  {
    id: 4,
    planId: 1,
    workVersion: {
      id: 4,
      work: {
        id: 4,
        doi: "10.5555/fake.2025.443322",
        created: "",
        modified: "",
      },
      hash: "",
      workType: WorkType.Dataset,
      publicationDate: "2025-03-18",
      title: "Multisensory Feedback Loops for Dexterous Robotic Manipulation",
      authors: [
        {
          firstInitial: "A",
          givenName: "Amira",
          middleInitials: null,
          middleNames: null,
          surname: "Nguyen",
          full: null,
          orcid: "0000-0003-2244-5566",
        },
        {
          firstInitial: "T",
          givenName: "Trevor",
          middleInitials: null,
          middleNames: null,
          surname: "Shaw",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "D",
          givenName: "Daniel",
          middleInitials: "S",
          middleNames: "Scott",
          surname: "Lewis",
          full: null,
          orcid: "0000-0002-1111-3333",
        },
      ],
      institutions: [{ ror: "01an7q238", name: "Carnegie Mellon University" }],
      funders: [{ ror: "021nxhr62", name: "U.S. National Science Foundation" }],
      awards: [{ awardId: "2356781" }],
      publicationVenue: "Frontiers in Robotics and AI",
      sourceName: "DataCite",
      sourceUrl: "https://commons.datacite.org/doi.org/10.5555/fake.2025.443322",
      created: "",
      modified: "",
    },
    sourceType: RelatedWorkSourceType.SystemMatched,
    score: 0.92,
    scoreMax: 1.0,
    scoreNorm: 0.92,
    status: RelatedWorkStatus.Accepted,
    doiMatch: {
      found: true,
      score: 15,
      sources: [],
    },
    contentMatch: {
      score: 18.0,
      titleHighlight:
        "<mark>Multisensory</mark> Feedback Loops for <mark>Dexterous</mark> <mark>Robotic Manipulation</mark>",
      abstractHighlights: [
        "We present a control architecture that fuses <mark>multisensory</mark> data from tactile, visual, and proprioceptive inputs to enable <mark>dexterous</mark> <mark>robotic manipulation</mark> in unstructured environments.",
        "The loop-based system enhances object interaction stability and allows fine-tuned grasping strategies.",
      ],
    },
    authorMatches: [
      { index: 0, score: 2.0 },
      { index: 2, score: 2.0 },
    ],
    institutionMatches: [{ index: 0, score: 2.0 }],
    funderMatches: [{ index: 0, score: 2.0 }],
    awardMatches: [{ index: 0, score: 10 }],
    created: "2025-04-01",
    modified: "2025-04-02",
  },
];

export const MOCK_REJECTED_WORKS: RelatedWorkSearchResult[] = [
  {
    id: 5,
    planId: 1,
    workVersion: {
      id: 5,
      work: {
        id: 5,
        doi: "10.3847/fake.2025.245187",
        created: "",
        modified: "",
      },
      hash: "",
      workType: WorkType.Dissertation,
      publicationDate: "2025-04-20",
      title: "Stellar Cartography and the Dynamic Mapping of Interstellar Gas Clouds",
      authors: [
        {
          firstInitial: "C",
          givenName: "Clara",
          middleInitials: null,
          middleNames: null,
          surname: "Montague",
          full: null,
          orcid: "0000-0003-7890-1122",
        },
        {
          firstInitial: "A",
          givenName: "Arjun",
          middleInitials: null,
          middleNames: null,
          surname: "Desai",
          full: null,
          orcid: null,
        },
        {
          firstInitial: "E",
          givenName: "Elena",
          middleInitials: null,
          middleNames: null,
          surname: "Ng",
          full: null,
          orcid: "0000-0002-4545-1212",
        },
        {
          firstInitial: "M",
          givenName: "Mateo",
          middleInitials: null,
          middleNames: null,
          surname: "Vargas",
          full: null,
          orcid: null,
        },
      ],
      institutions: [
        { ror: "01an7q238", name: "Carnegie Mellon University" },
        { ror: "02y2hzk54", name: "Massachusetts Institute of Technology" },
      ],
      funders: [{ ror: "021nxhr62", name: "U.S. National Science Foundation" }],
      awards: [{ awardId: "2451873" }],
      publicationVenue: "Astrophysical Journal Letters",
      sourceName: "OpenAlex",
      sourceUrl: "https://openalex.org/works/w2060245136",
      created: "",
      modified: "",
    },
    sourceType: RelatedWorkSourceType.SystemMatched,
    score: 0.1,
    scoreMax: 1.0,
    scoreNorm: 0.1,
    status: RelatedWorkStatus.Pending,
    doiMatch: {
      found: false,
      score: 0,
      sources: [],
    },
    contentMatch: {
      score: 0,
      titleHighlight: null,
      abstractHighlights: [],
    },
    authorMatches: [],
    institutionMatches: [{ index: 0, score: 2.0 }],
    funderMatches: [{ index: 0, score: 2.0 }],
    awardMatches: [],
    created: "2025-05-01",
    modified: "2025-05-02",
  },
];

interface TestProvidersProps {
  children: React.ReactNode;
  defaultSortBy?: RelatedWorksSortBy;
}

const expectedDateFormat = (date: Date | null) => {
  if (!date) {
    return "";
  }
  const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  return new Intl.DateTimeFormat(systemLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-");
};

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
  it("should render two pending items", () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
          totalCount: 2,
          limit: 2,
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // Render two items
    expectDois("related-works-list", ["10.1016/fake.2025.293748", "10.1126/fake.2025.084512"]);
  });

  it("should render two related items", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_ACCEPTED_WORKS,
          totalCount: 2,
          limit: 2,
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
          status={RelatedWorkStatus.Accepted}
        />
      </TestProviders>,
    );

    expectDois("related-works-list", ["10.5555/fake.2025.661100", "10.5555/fake.2025.443322"]);
  });

  it("should render one discarded item", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_REJECTED_WORKS,
          totalCount: 1,
          limit: 1,
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
          status={RelatedWorkStatus.Rejected}
        />
      </TestProviders>,
    );

    expectDois("related-works-list", ["10.3847/fake.2025.245187"]);
  });

  it("should display confidence filter", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
          confidenceCounts: [
            { typeId: "HIGH", count: 3 },
            { typeId: "MEDIUM", count: 2 },
            { typeId: "LOW", count: 1 },
          ],
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
          workTypeCounts: [
            { typeId: "DATASET", count: 5 },
            { typeId: "ARTICLE", count: 20 },
            { typeId: "DISSERTATION", count: 3 },
          ],
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
          status={RelatedWorkStatus.Pending}
        />
      </TestProviders>,
    );

    // Get filter by type and click it to open it
    const button = screen.getByRole("button", { name: "filters.filterByType filters.filterByType" });
    await userEvent.click(button);

    // Get option text
    const optionTexts = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((option) => option.textContent);

    // Check values
    expect(optionTexts).toHaveLength(4);
    expect(optionTexts).toEqual([
      "filters.filterByType",
      "workType.ARTICLE (20)",
      "workType.DATASET (5)",
      "workType.DISSERTATION (3)",
    ]);
  });

  it("should display sort by filter: pending", async () => {
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
        },
      },
      loading: false,
      error: null,
    });

    // Pending
    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
          totalCount: 0,
          statusOnlyCount: 0,
        },
      },
      loading: false,
      error: null,
    });

    const { container } = render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: [],
          totalCount: 0,
          statusOnlyCount: 10,
        },
      },
      loading: false,
      error: null,
    });

    const { container } = render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
          items: MOCK_PENDING_WORKS,
          totalCount: 2,
          limit: 2,
          currentOffset: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      loading: false,
      error: null,
    });

    render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
    (useRelatedWorksByPlanQuery as jest.Mock).mockReturnValue({
      data: {
        relatedWorksByPlan: {
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
      error: null,
    });

    const { container } = render(
      <TestProviders>
        <RelatedWorksList
          planId={1}
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
