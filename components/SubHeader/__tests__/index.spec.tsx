import { render, screen } from "@testing-library/react";
import SubHeader from "../index";

// SubHeader component is not final so put in minimal testing
describe("SubHeader Component", () => {
  it("should render the UCOP logo with correct alt text", () => {
    render(<SubHeader />);
    const logo = screen.getByAltText("University of California, Office of the President (UCOP) logo");
    expect(logo).toBeInTheDocument();
  });

  it("should render the UCOP homepage link with correct href", () => {
    render(<SubHeader />);
    const ucopLink = screen.getByText("UCOP Homepage");
    expect(ucopLink).toBeInTheDocument();
    expect(ucopLink).toHaveAttribute("href", "http://www.ucop.edu/");
  });

  it("should render the UC3 Helpdesk link with correct href", () => {
    render(<SubHeader />);
    const helpdeskLink = screen.getByText("Helpdesk");
    expect(helpdeskLink).toBeInTheDocument();
    expect(helpdeskLink).toHaveAttribute("href", "mailto:dmptool@ucop.edu");
  });

  it('should render the "Opens in a new window" text', () => {
    render(<SubHeader />);
    const newWindowText = screen.getByText("Opens in a new window");
    expect(newWindowText).toBeInTheDocument();
  });
});
