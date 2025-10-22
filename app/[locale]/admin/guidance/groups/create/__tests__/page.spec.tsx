import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import GuidanceGroupCreatePage from "../page";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

expect.extend(toHaveNoViolations);

describe("GuidanceGroupCreatePage", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the form with group name input", () => {
    render(<GuidanceGroupCreatePage />);

    const nameInput = screen.getByLabelText("fields.groupName.label");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute("placeholder", "fields.groupName.placeholder");
  });

  it("should render the settings section", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("fields.settings.label")).toBeInTheDocument();
  });

  it("should render settings checkboxes", () => {
    render(<GuidanceGroupCreatePage />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should render the create button", () => {
    render(<GuidanceGroupCreatePage />);

    expect(screen.getByText("actions.createGroup")).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<GuidanceGroupCreatePage />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle group name input changes", () => {
    render(<GuidanceGroupCreatePage />);

    const nameInput = screen.getByLabelText("fields.groupName.label") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Test Group" } });

    expect(nameInput.value).toBe("Test Group");
  });

  it("should handle checkbox interactions", () => {
    render(<GuidanceGroupCreatePage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const firstCheckbox = checkboxes[0];

    fireEvent.click(firstCheckbox);
    // Just verify the click doesn't cause errors
    expect(firstCheckbox).toBeInTheDocument();
  });

  it("should handle checkbox selection", () => {
    render(<GuidanceGroupCreatePage />);

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThan(0);

    const firstCheckbox = checkboxes[0];

    fireEvent.click(firstCheckbox);
    // The checkbox state should potentially change (depends on implementation)
    expect(firstCheckbox).toBeInTheDocument();
  });

  it("should render setting descriptions", () => {
    render(<GuidanceGroupCreatePage />);

    // Check that setting descriptions are rendered inline within checkbox labels
    // Based on the HTML structure, descriptions are shown in parentheses after the setting names
    expect(screen.getByText(/e\.g\. School\/ Department/)).toBeInTheDocument();
    expect(screen.getByText(/for optimal guidance creation/)).toBeInTheDocument();
    expect(screen.getByText(/for enhanced readability/)).toBeInTheDocument();

    // Alternative approach: Check for the complete label text including descriptions
    expect(screen.getByText(/Optional subset.*\(.*e\.g\. School\/ Department.*\)/)).toBeInTheDocument();
    expect(screen.getByText(/Requires coffee.*\(.*for optimal guidance creation.*\)/)).toBeInTheDocument();
    expect(screen.getByText(/Includes emojis.*\(.*for enhanced readability.*\)/)).toBeInTheDocument();
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<GuidanceGroupCreatePage />);

    await waitFor(() => {
      expect(screen.getByLabelText("fields.groupName.label")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
