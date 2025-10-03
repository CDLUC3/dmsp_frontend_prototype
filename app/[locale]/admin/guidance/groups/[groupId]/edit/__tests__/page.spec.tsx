import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceGroupEditPage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({
    groupId: "1",
  }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

expect.extend(toHaveNoViolations);

describe("GuidanceGroupEditPage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with group name input", () => {
    render(<GuidanceGroupEditPage />);

    const nameInput = screen.getByLabelText("fields.groupName.label") as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue();
    expect(nameInput.value.length).toBeGreaterThan(0);
  });

  it("should render the settings section", () => {
    render(<GuidanceGroupEditPage />);

    expect(screen.getByText("fields.settings.label")).toBeInTheDocument();
  });

  it("should render settings checkboxes with current states", () => {
    render(<GuidanceGroupEditPage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThan(0);

    // Check that some checkboxes have different states (some checked, some not)
    const checkedBoxes = checkboxes.filter((cb) => cb.checked);
    const uncheckedBoxes = checkboxes.filter((cb) => !cb.checked);
    expect(checkedBoxes.length).toBeGreaterThan(0);
    expect(uncheckedBoxes.length).toBeGreaterThan(0);
  });

  it("should have form element present", () => {
    render(<GuidanceGroupEditPage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle group name input changes", () => {
    render(<GuidanceGroupEditPage />);

    const nameInput = screen.getByLabelText("fields.groupName.label") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Updated Group Name" } });

    expect(nameInput.value).toBe("Updated Group Name");
  });

  it("should handle checkbox interactions", () => {
    render(<GuidanceGroupEditPage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const firstCheckbox = checkboxes[0];

    fireEvent.click(firstCheckbox);
    // Just verify the click doesn't cause errors
    expect(firstCheckbox).toBeInTheDocument();
  });

  it("should render setting descriptions", () => {
    render(<GuidanceGroupEditPage />);

    // Check that setting descriptions/help text containers exist
    const helpTexts = document.querySelectorAll(".help, .description, [id*='help']");
    expect(helpTexts.length).toBeGreaterThan(0);
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceGroupEditPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("fields.groupName.label")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
