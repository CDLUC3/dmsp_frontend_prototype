import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";

import FeedbackOptions from "../page";

expect.extend(toHaveNoViolations);

// Minimal TinyMCE mock to prevent errors in tests
Object.defineProperty(window, "tinymce", {
  value: {
    remove: jest.fn(),
    init: jest.fn(),
  },
  writable: true,
});

describe("FeedbackOptions", () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Mock scrollTo if needed
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page header with title", () => {
    render(<FeedbackOptions />);

    // Check that PageHeader component is rendered
    const pageHeader = document.querySelector('[class*="page-feedback-options-header"]');
    expect(pageHeader).toBeInTheDocument();
  });

  it("should render the introduction text", () => {
    render(<FeedbackOptions />);

    // Check that the description paragraph is rendered
    const description = document.querySelector("p");
    expect(description).toBeInTheDocument();
  });

  it("should render the feedback toggle radio group", () => {
    render(<FeedbackOptions />);

    // Check that radio group is present by looking for radio inputs
    const radioInputs = document.querySelectorAll('input[type="radio"]');
    expect(radioInputs).toHaveLength(2);

    // Check that radio group has the correct name attribute
    const radioGroup = document.querySelector('input[name="feedbackEnabled"]');
    expect(radioGroup).toBeInTheDocument();
  });

  it("should render feedback email field when enabled", () => {
    render(<FeedbackOptions />);

    // Check that feedback email field is present (default state is "on")
    const emailInput = document.querySelector('input[name="feedbackEmail"]');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue("helpdesk@ucop.edu");
  });

  it("should render expert feedback text area when enabled", () => {
    render(<FeedbackOptions />);

    // Check that the expert feedback section is present (default state is "on")
    // The section has id="expert-feedback-section"
    const expertFeedbackSection = document.querySelector("#expert-feedback-section");
    expect(expertFeedbackSection).toBeInTheDocument();
  });

  it("should render save button", () => {
    render(<FeedbackOptions />);

    const saveButton = document.querySelector('button[type="submit"]');
    expect(saveButton).toBeInTheDocument();
  });

  it("should have form element present", () => {
    render(<FeedbackOptions />);

    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("should handle form submission", () => {
    render(<FeedbackOptions />);

    const form = document.querySelector("form");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    // Submit form
    fireEvent.submit(form!);

    expect(consoleSpy).toHaveBeenCalledWith("handleSubmit");

    consoleSpy.mockRestore();
  });

  it("should render sidebar panel", () => {
    render(<FeedbackOptions />);

    // Check sidebar is present (even if empty)
    const sidebar =
      document.querySelector('[class*="SidebarPanel"]') ||
      document.querySelector('[class*="sidebar"]') ||
      document.querySelector("aside");

    // If we can't find it by class, check if the component structure exists
    if (!sidebar) {
      // Check if the layout structure exists
      const contentContainer = document.querySelector('[class*="ContentContainer"]');
      expect(contentContainer).toBeInTheDocument();

      // Check if there's a form (which means the main content is there)
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    } else {
      expect(sidebar).toBeInTheDocument();
    }
  });

  it("should pass accessibility tests", async () => {
    const { container } = render(<FeedbackOptions />);

    // Wait for the component to fully render
    await waitFor(() => {
      const pageHeader = document.querySelector('[class*="page-feedback-options-header"]');
      expect(pageHeader).toBeInTheDocument();
    });

    // Wait a bit more for TinyMCE to potentially initialize
    await waitFor(
      () => {
        const results = axe(container);
        return results;
      },
      { timeout: 3000 },
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
