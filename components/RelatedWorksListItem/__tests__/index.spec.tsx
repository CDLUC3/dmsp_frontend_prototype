import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RelatedWorksListItem from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { RelatedWork, Status, WorkType } from "@/app/types";
import { NextIntlClientProvider } from "next-intl";

expect.extend(toHaveNoViolations);

const RELATED_WORK: RelatedWork = {
  dmpDoi: "10.48321/D000001",
  score: 1.0,
  work: {
    doi: "10.1126/fake.2025.084512",
    type: WorkType.Article,
    title: "Title",
    publicationDate: new Date(2020, 4, 15),
    containerTitle: "Journal Name",
    authors: [
      {
        firstInitial: "G",
        givenName: "Given",
        middleInitial: "M",
        middleName: "Middle",
        surname: "Last",
        full: null,
        orcid: "0000-0003-1234-5678",
      },
    ],
    institutions: [{ ror: "08t3yqz51", name: "Institution Name" }],
    funders: [{ ror: "098k2sk96", name: "Funder Name" }],
    awardIds: ["123456789"],
    source: { name: "OpenAlex", url: "https://openalex.org/works/w2060245136" },
  },
  dateFound: new Date(2025, 7, 21),
  status: Status.Pending,
  match: {
    doi: true,
    title: "<mark>Title</mark>",
    abstract: ["a <mark>fragment</mark> of an abstract...", "a second <mark>fragment</mark> of an abstract"],
    awardIds: [0],
    authors: [0],
    institutions: [0],
    funders: [0],
  },
  dateReviewed: null,
};

function RelatedWorksListItemHarness({
  acceptWork = jest.fn(),
  discardWork = jest.fn(),
}: {
  acceptWork?: jest.Mock;
  discardWork?: jest.Mock;
}) {
  return (
    <NextIntlClientProvider
      locale={"en"}
      timeZone={"UTC"}
      messages={{}}
    >
      <RelatedWorksListItem
        item={RELATED_WORK}
        highlightMatches={false}
        acceptWork={acceptWork}
        discardWork={discardWork}
      />
    </NextIntlClientProvider>
  );
}

describe("RelatedWorksListItem", () => {
  it("should open and close details", async () => {
    render(<RelatedWorksListItemHarness />);

    // Expand details
    expect(screen.queryAllByRole("details").length).toEqual(0);
    const expand = screen.getByRole("button", { name: "buttons.review details for Title" });
    await userEvent.click(expand);

    // Check that details panel now exists
    expect(screen.queryAllByRole("details").length).toEqual(1);

    // Collapse details
    await userEvent.click(expand);
    expect(screen.queryAllByRole("details").length).toEqual(0);
  });

  it("should accept work", async () => {
    const acceptWork = jest.fn();
    render(<RelatedWorksListItemHarness acceptWork={acceptWork} />);

    // Expand details
    const expand = screen.getByRole("button", { name: "buttons.review details for Title" });
    await userEvent.click(expand);

    // Click Accept
    const accept = screen.getByRole("button", { name: "buttons.accept" });
    await userEvent.click(accept);

    // Check acceptWork called with DOI
    await waitFor(() => {
      expect(acceptWork).toHaveBeenCalledTimes(1);
      expect(acceptWork).toHaveBeenCalledWith(RELATED_WORK.work.doi);
    });
  });

  it("should discard work", async () => {
    const discardWork = jest.fn();
    render(<RelatedWorksListItemHarness discardWork={discardWork} />);

    // Expand details
    const expand = screen.getByRole("button", { name: "buttons.review details for Title" });
    await userEvent.click(expand);

    // Click Discard
    const discard = screen.getByRole("button", { name: "buttons.discard" });
    await userEvent.click(discard);

    // Check discardWork called with DOI
    await waitFor(() => {
      expect(discardWork).toHaveBeenCalledTimes(1);
      expect(discardWork).toHaveBeenCalledWith(RELATED_WORK.work.doi);
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
