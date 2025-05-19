import { render, screen } from "@testing-library/react";
import Spinner from "../index";

describe("Spinner Component", () => {
  it("should render the spinner when isActive is true", () => {
    render(<Spinner isActive={true} className="test-class" />);
    const spinnerElement = screen.getByTestId("spinner");
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass("spinner test-class");
  });

  it("should not render the spinner when isActive is false", () => {
    render(<Spinner isActive={false} className="test-class" />);
    const spinnerElement = screen.queryByTestId("spinner");
    expect(spinnerElement).not.toBeInTheDocument();
  });

  it("should apply the default id when no id is provided", () => {
    render(<Spinner isActive={true} className="test-class" />);
    const spinnerElement = screen.getByTestId("spinner");
    expect(spinnerElement).toHaveAttribute("id", "spinner");
  });

  it("should apply the provided id when id is specified", () => {
    render(<Spinner isActive={true} id="custom-spinner" className="test-class" />);
    const spinnerElement = screen.getByTestId("spinner");
    expect(spinnerElement).toHaveAttribute("id", "custom-spinner");
  });
});
