import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RelatedWorksList } from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import { RelatedWorksSortBy, Status } from "@/app/types";
import { RelatedWorksListProvider } from "@/providers/relatedWorksListProvider";
import { RelatedWorksProvider } from "@/providers/relatedWorksProvider";

expect.extend(toHaveNoViolations);

describe("RelatedWorksList", () => {
  it("should render three pending items", () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    expectDois("related-works-list", [
      "10.5555/fake.2025.778899",
      "10.1016/fake.2025.293748",
      "10.1126/fake.2025.084512",
    ]);
  });

  it("should render two related items", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.PublishedNew}>
          <RelatedWorksList status={Status.Related} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    expectDois("related-works-list", ["10.5555/fake.2025.661100", "10.5555/fake.2025.443322"]);
  });

  it("should render two discarded items", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ReviewedNew}>
          <RelatedWorksList status={Status.Discarded} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    expectDois("related-works-list", ["10.3847/fake.2025.245187", "10.1016/fake.2025.998877"]);
  });

  it("should filter by confidence", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    // High
    const high = screen.getByRole("radio", { name: "confidence.high(1)" });
    await userEvent.click(high);
    expectDois("related-works-list", ["10.5555/fake.2025.778899"]);

    // Medium
    const medium = screen.getByRole("radio", { name: "confidence.medium(1)" });
    await userEvent.click(medium);
    expectDois("related-works-list", ["10.1016/fake.2025.293748"]);

    // Low
    const low = screen.getByRole("radio", { name: "confidence.low(1)" });
    await userEvent.click(low);
    expectDois("related-works-list", ["10.1126/fake.2025.084512"]);
  });

  it("should filter by type", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    await userEvent.click(screen.getByRole("button", { name: "filters.filterByType" }));
    await userEvent.click(screen.getByRole("option", { name: "workType.article" }));

    const listItems = within(screen.getByTestId("related-works-list")).queryAllByRole("listitem");
    expect(listItems.length).toBe(1);
    expect(within(listItems[0]).queryByText("fieldNames.type: workType.article")).not.toBeNull();
  });

  it("should sort by confidence", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    // Confidence: High (default)
    await assertSortBy("filters.sortBy.confidence-high", "filters.sortBy.confidence-high", "confidence", [
      "fieldNames.confidence: confidence.high",
      "fieldNames.confidence: confidence.medium",
      "fieldNames.confidence: confidence.low",
    ]);

    // Confidence: Low
    await assertSortBy("filters.sortBy.confidence-high", "filters.sortBy.confidence-low", "confidence", [
      "fieldNames.confidence: confidence.low",
      "fieldNames.confidence: confidence.medium",
      "fieldNames.confidence: confidence.high",
    ]);
  });

  it("should sort by date found", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    // Date Found: New
    await assertSortBy("filters.sortBy.confidence-high", "filters.sortBy.date-found-new", "dateFound", [
      "fieldNames.dateFound: 2025-08-21",
      "fieldNames.dateFound: 2025-08-15",
      "fieldNames.dateFound: 2025-08-01",
    ]);

    // Date Found: Old
    await assertSortBy("filters.sortBy.date-found-new", "filters.sortBy.date-found-old", "dateFound", [
      "fieldNames.dateFound: 2025-08-01",
      "fieldNames.dateFound: 2025-08-15",
      "fieldNames.dateFound: 2025-08-21",
    ]);
  });

  it("should sort by reviewed", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.PublishedNew}>
          <RelatedWorksList status={Status.Related} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    // Reviewed: New
    await assertSortBy("filters.sortBy.published-new", "filters.sortBy.reviewed-new", "dateReviewed", [
      "fieldNames.dateReviewed: 2025-07-02",
      "fieldNames.dateReviewed: 2025-04-02",
    ]);

    // Reviewed: Old
    await assertSortBy("filters.sortBy.reviewed-new", "filters.sortBy.reviewed-old", "dateReviewed", [
      "fieldNames.dateReviewed: 2025-04-02",
      "fieldNames.dateReviewed: 2025-07-02",
    ]);
  });

  it("should sort by published date", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    // Published: New
    await assertSortBy("filters.sortBy.confidence-high", "filters.sortBy.published-new", "publicationYear", [
      "2025.",
      "2024.",
      "2020.",
    ]);

    // Published: Old
    await assertSortBy("filters.sortBy.published-new", "filters.sortBy.published-old", "publicationYear", [
      "2020.",
      "2024.",
      "2025.",
    ]);
  });

  it("should highlight matches", async () => {
    render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    // Expand first item
    const container = screen.getByTestId("related-works-list");
    const listItems = within(container).queryAllByRole("listitem");
    expect(listItems.length).toBe(3);
    const firstItem = listItems[0];
    const review = within(firstItem).getByRole("button", {
      name: "buttons.review details for Quantum-Tuned Perception Systems for Next-Gen Robots",
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
    const { container } = render(
      <RelatedWorksProvider>
        <RelatedWorksListProvider defaultSortBy={RelatedWorksSortBy.ConfidenceHigh}>
          <RelatedWorksList status={Status.Pending} />
        </RelatedWorksListProvider>
      </RelatedWorksProvider>,
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

async function assertSortBy(selectName: string, optionName: string, itemTestId: string, expectedValues: string[]) {
  // Open dropdown and choose option
  await userEvent.click(screen.getByRole("button", { name: selectName }));
  await userEvent.click(screen.getByRole("option", { name: optionName }));

  const container = screen.getByTestId("related-works-list");
  const values = within(container)
    .queryAllByRole("listitem")
    .map((item) => within(item).getByTestId(itemTestId).textContent);
  expect(values).toStrictEqual(expectedValues);
}

function expectDois(testId: string, expectedDois: string[]) {
  const container = screen.getByTestId(testId);
  const dois = within(container)
    .queryAllByRole("listitem")
    .map((item) => item.getAttribute("data-testid"));

  expect(dois.length).toBe(expectedDois.length);
  expect(dois).toStrictEqual(expectedDois);
}
