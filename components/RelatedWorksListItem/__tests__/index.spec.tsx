import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RelatedWorksListItem from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { NextIntlClientProvider } from "next-intl";
import { RelatedWorkSearchResult, RelatedWorkSourceType, RelatedWorkStatus, WorkType } from "@/generated/graphql";

expect.extend(toHaveNoViolations);

const RELATED_WORK: RelatedWorkSearchResult = {
  id: 4,
  planId: 1,
  workVersion: {
    id: 3,
    work: {
      id: 2,
      doi: "10.1126/fake.2025.084512",
      created: "",
      modified: "",
    },
    hash: "",
    workType: WorkType.Article,
    publicationDate: "2020-05-15",
    title: "Title",
    authors: [
      {
        firstInitial: "G",
        givenName: "Given",
        middleInitials: "M",
        middleNames: "Middle",
        surname: "Last",
        full: null,
        orcid: "0000-0003-1234-5678",
      },
    ],
    institutions: [{ ror: "08t3yqz51", name: "Institution Name" }],
    funders: [{ ror: "098k2sk96", name: "Funder Name" }],
    awards: [{ awardId: "123456789" }],
    publicationVenue: "Journal Name",
    sourceName: "OpenAlex",
    sourceUrl: "https://openalex.org/works/w2060245136",
    created: "",
    modified: "",
  },
  sourceType: RelatedWorkSourceType.SystemMatched,
  score: 1.0,
  scoreMax: 1.0,
  scoreNorm: 1.0,
  status: RelatedWorkStatus.Pending,
  doiMatch: {
    found: true,
    score: 15,
    sources: [],
  },
  contentMatch: {
    score: 18.0,
    titleHighlight: "<mark>Title</mark>",
    abstractHighlights: ["a <mark>fragment</mark> of an abstract...", "a second <mark>fragment</mark> of an abstract"],
  },
  authorMatches: [{ index: 0, score: 2.0 }],
  institutionMatches: [{ index: 0, score: 2.0 }],
  funderMatches: [{ index: 0, score: 2.0 }],
  awardMatches: [{ index: 0, score: 2.0 }],
  created: "2025-08-21",
  modified: "2025-08-21",
};

function RelatedWorksListItemHarness({ updateRelatedWorkStatus = jest.fn() }: { updateRelatedWorkStatus?: jest.Mock }) {
  return (
    <NextIntlClientProvider
      locale={"en"}
      timeZone={"UTC"}
      messages={{}}
    >
      <RelatedWorksListItem
        relatedWork={RELATED_WORK}
        highlightMatches={false}
        updateRelatedWorkStatus={updateRelatedWorkStatus}
      />
    </NextIntlClientProvider>
  );
}

describe("RelatedWorksListItem", () => {
  it("should open and close details", async () => {
    render(<RelatedWorksListItemHarness />);

    // Expand details
    expect(screen.queryAllByRole("details").length).toEqual(0);
    const expand = screen.getByRole("button", { name: "buttons.expand details for Title" });
    await userEvent.click(expand);

    // Check that details panel now exists
    expect(screen.queryAllByRole("details").length).toEqual(1);

    // Collapse details
    await userEvent.click(expand);
    expect(screen.queryAllByRole("details").length).toEqual(0);
  });

  it("should accept work", async () => {
    const updateRelatedWorkStatus = jest.fn();
    render(<RelatedWorksListItemHarness updateRelatedWorkStatus={updateRelatedWorkStatus} />);

    // Click Accept
    const accept = screen.getByRole("button", { name: "buttons.accept" });
    await userEvent.click(accept);

    // Check acceptWork called with DOI
    await waitFor(() => {
      expect(updateRelatedWorkStatus).toHaveBeenCalledTimes(1);
      expect(updateRelatedWorkStatus).toHaveBeenCalledWith(RELATED_WORK.id, RelatedWorkStatus.Accepted);
    });
  });

  it("should reject work", async () => {
    const updateRelatedWorkStatus = jest.fn();
    render(<RelatedWorksListItemHarness updateRelatedWorkStatus={updateRelatedWorkStatus} />);

    // Click Discard
    const discard = screen.getByRole("button", { name: "buttons.reject" });
    await userEvent.click(discard);

    // Check discardWork called with DOI
    await waitFor(() => {
      expect(updateRelatedWorkStatus).toHaveBeenCalledTimes(1);
      expect(updateRelatedWorkStatus).toHaveBeenCalledWith(RELATED_WORK.id, RelatedWorkStatus.Rejected);
    });
  });

  it("should pass axe accessibility test", async () => {
    const { container } = render(
      <div role="list">
        {/* RelatedWorksList has role list and wraps RelatedWorksListItems */}
        <RelatedWorksListItemHarness />,
      </div>,
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
