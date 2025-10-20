import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExpandableNameList from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

function ExpandableNameListHarness({ maxItems }: { maxItems: number }) {
  return (
    <ExpandableNameList
      items={[{ name: "One" }, { name: "Two" }, { name: "Three" }]}
      matches={[{ index: 0, score: 2 }, { index: 1, score: 1 }]}
      maxItems={maxItems}
      renderItem={(item) => {
        return <span>{item.name}</span>;
      }}
    />
  );
}

describe("ExpandableNameList", () => {
  it("should render three items", async () => {
    render(<ExpandableNameListHarness maxItems={3} />);

    // Test that all items are shown
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("should render two items", async () => {
    render(<ExpandableNameListHarness maxItems={2} />);

    // Test that two items are shown
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.queryAllByText("Three").length).toEqual(0);

    // Check that '+1 more' button is not in document
    const moreButton = screen.getByRole("button", { name: "+1 more" });
    expect(moreButton).toBeInTheDocument();

    // Click '+1 more' button and check that "Three" is visible now
    await userEvent.click(moreButton);
    expect(screen.queryAllByText("Three").length).toEqual(1);
    expect(moreButton).toHaveTextContent("less");

    // Click 'less' button and check that "Three" is not visible now
    await userEvent.click(moreButton);
    expect(screen.queryAllByText("Three").length).toEqual(0);
    expect(moreButton).toHaveTextContent("+1 more");
  });

  it("should pass axe accessibility test", async () => {
    const { container } = render(<ExpandableNameListHarness maxItems={3} />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
