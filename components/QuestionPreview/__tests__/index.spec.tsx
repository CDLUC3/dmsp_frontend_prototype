import React from 'react';

import { act, fireEvent, render, screen, waitFor, } from '@/utils/test-utils';

import { axe, toHaveNoViolations } from 'jest-axe';

import QuestionPreview from '@/components/QuestionPreview';


expect.extend(toHaveNoViolations);


describe("QuestionPreview", () => {

  afterEach(() => {
    // We need to reset the history
    window.history.pushState(null, "", window.location.pathname);
  });

  it("should render the preview button", async () => {
    render(<QuestionPreview> </QuestionPreview>);

    const button = screen.getByTestId('preview-button');
    expect(button).toBeInTheDocument();
  });

  it("should have a modal overlay, hidden initially", async () => {
    render(
      <QuestionPreview previewDisabled={false}>
        <h2>Preview Content</h2>
      </QuestionPreview>
    );

    expect(window.location.hash).toBe("");

    // Click the preview button
    const previewButton = screen.getByTestId('preview-button');
    expect(previewButton).toBeInTheDocument();
    fireEvent.click(previewButton);

    await waitFor(() => {
      const overlay = screen.getByTestId('modal-overlay');
      const modal = screen.getByTestId('modal-bottomsheet');
      const dialog = screen.getByTestId('modal-dialog');

      expect(overlay).toBeInTheDocument();
      expect(modal).toBeInTheDocument();
      expect(dialog).toBeInTheDocument();

      const notice = screen.getByTestId('preview-notice');
      expect(notice).toBeInTheDocument();

      const closeBtn = screen.getByTestId('preview-close-button');
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
    });
  });

  it("should update the history when we toggle the preview", () => {
    render(
      <QuestionPreview> </QuestionPreview>
    );

    expect(window.location.hash).toBe("");

    // Mock history.back() since jest doesn't have this
    const backMock = jest
      .spyOn(window.history, "back")
      .mockImplementation(() => {
        window.history.pushState(null, "", window.location.pathname);
      });

    // Open the preview
    const previewButton = screen.getByTestId('preview-button');
    expect(previewButton).toBeInTheDocument();
    fireEvent.click(previewButton);

    waitFor(() => {
      expect(window.location.hash).toBe("#_modal");

      // Close the Preview
      const closeBtn = screen.getByTestId('preview-close-button');
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);

      waitFor(() => {
        expect(window.location.hash).toBe("");
      });
    });

    backMock.mockRestore();
  });

  it("should automatically show the preview using the url hash", () => {
    const backMock = jest
      .spyOn(window.history, "back")
      .mockImplementation(() => {
        window.history.pushState(null, "", window.location.pathname);
      });

    render(
      <QuestionPreview> </QuestionPreview>
    );

    window.history.pushState(null, "#_modal", window.location.pathname);
    waitFor(() => {
      expect(window.location.hash).toBe("#_modal");
    });

    waitFor(() => {
      const closeBtn = screen.getByTestId('preview-close-button');
      expect(closeBtn).toBeInTheDocument();
      fireEvent.click(closeBtn);
    });

    expect(window.location.hash).toBe("");

    backMock.mockRestore();
  });

  it("should toggle the preview when navigating", () => {
    render(
      <QuestionPreview> </QuestionPreview>
    );

    window.history.pushState(null, "#_modal", window.location.pathname);
    waitFor(() => {
      const closeBtn = screen.getByTestId('preview-close-button');
      expect(closeBtn).toBeInTheDocument();
    });

    window.history.pushState(null, "", window.location.pathname);
    waitFor(() => {
      const previewBtn = screen.getByTestId('preview-button');
      expect(previewBtn).toBeInTheDocument();
    });
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(
      <QuestionPreview />
    );

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  it('should open the modal when popstate event with matching hash is fired', () => {
    render(<QuestionPreview id="my-preview" previewDisabled={false}>Preview Content</QuestionPreview>);

    // Wrap state-changing actions in act()
    act(() => {
      window.location.hash = '#my-preview_modal';
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Assert that the modal is open
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });

  it('should not open the modal if window.location.hash not equal to id_modal', () => {
    render(<QuestionPreview id="my-preview" previewDisabled={false}>Preview Content</QuestionPreview>);

    // Wrap state-changing actions in act()
    act(() => {
      window.location.hash = '#';
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Assert that the modal is open
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });

  it('should open the modal on mount if window.location.hash matches id_modal', () => {
    window.location.hash = '#my-preview_modal';
    render(<QuestionPreview id="my-preview" previewDisabled={false}>Preview Content</QuestionPreview>);
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
  });

  it('should close the modal when Escape key is pressed', () => {
    render(<QuestionPreview id="my-preview" previewDisabled={false}>Preview Content</QuestionPreview>);

    // Open the modal
    act(() => {
      window.location.hash = '#my-preview_modal';
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();

    // Press Escape key
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    // Modal should be closed
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });
});
