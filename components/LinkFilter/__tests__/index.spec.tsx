import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LinkFilter from "../index";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

function LinkFilterHarness() {
  const [selected, setSelected] = React.useState("one");
  return (
    <LinkFilter
      label="Radio Label"
      selected={selected}
      setSelected={setSelected}
      items={[
        { id: "one", label: "One" },
        { id: "two", label: "Two", count: 2 },
      ]}
    />
  );
}

describe("LinkFilter", () => {
  it("should change state when radio button clicked", async () => {
    render(<LinkFilterHarness />);

    const oneRadio = screen.getByRole("radio", { name: "One" });
    const twoRadio = screen.getByRole("radio", { name: "Two(2)" });

    // Check default state
    expect(screen.getAllByText("One").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Two(2)").length).toBeGreaterThan(0);
    expect(oneRadio).toBeChecked();
    expect(twoRadio).not.toBeChecked();

    // Click radio two
    await userEvent.click(twoRadio);
    expect(oneRadio).not.toBeChecked();
    expect(twoRadio).toBeChecked();

    // Click radio one
    await userEvent.click(oneRadio);
    expect(oneRadio).toBeChecked();
    expect(twoRadio).not.toBeChecked();
  });

  it("should pass axe accessibility test", async () => {
    const { container } = render(<LinkFilterHarness />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
