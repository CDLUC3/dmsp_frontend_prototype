import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExpandButton from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

function ExpandButtonHarness() {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <ExpandButton
      collapseLabel="Collapse"
      expandLabel="Expand"
      expanded={expanded}
      setExpanded={setExpanded}
      screenReaderText="screenReaderText"
      aria-controls="expandedContentId"
      aria-label="ariaLabel"
    />
  );
}

describe("ExpandButton", () => {
  it("should change to expanded state when clicked", async () => {
    render(<ExpandButtonHarness />);

    const button = screen.getByRole("button");

    // Check default state
    expect(screen.getByText("Expand")).toBeInTheDocument();
    expect(screen.getByText("screenReaderText")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "expandedContentId");
    expect(button).toHaveAttribute("aria-label", "ariaLabel");

    // Click the button
    await userEvent.click(button);

    // Verify that the button has changed
    expect(screen.getByText("Collapse")).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("should pass axe accessibility test", async () => {
    const { container } = render(<ExpandButtonHarness />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
