import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransitionButton from "../index";

jest.mock("@/components/Loading", () => ({
  __esModule: true,
  default: ({ isActive, variant }: { isActive: boolean; variant: string }) => (
    <div
      data-testid="loading"
      data-active={String(isActive)}
      data-variant={variant}
    />
  ),
}));


/** Returns a promise that resolves after `ms` milliseconds. */
const delay = (ms = 50) => new Promise<void>((res) => setTimeout(res, ms));

/** Builds a jest.fn() that resolves after a short delay. */
const asyncPress = (ms = 50) => jest.fn(() => delay(ms));


describe("TransitionButton", () => {

  describe("rendering", () => {
    it("should render children when not loading", () => {
      render(<TransitionButton>Click me</TransitionButton>);
      expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("should render the Loading component by default", () => {
      render(<TransitionButton>Click me</TransitionButton>);
      expect(screen.getByTestId("loading")).toBeInTheDocument();
    });

    it("should not render Loading when showLoading is false", () => {
      render(<TransitionButton showLoading={false}>Click me</TransitionButton>);
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    it("should pass the loadingVariant to Loading", () => {
      render(
        <TransitionButton loadingVariant="inline" onPress={asyncPress()}>
          Click me
        </TransitionButton>
      );
      expect(screen.getByTestId("loading")).toHaveAttribute("data-variant", "inline");
    });

    it("should default the loadingVariant to fullscreen", () => {
      render(<TransitionButton>Click me</TransitionButton>);
      expect(screen.getByTestId("loading")).toHaveAttribute("data-variant", "fullscreen");
    });

    it("should not be disabled by default", () => {
      render(<TransitionButton>Click me</TransitionButton>);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    it("should be disabled when isDisabled prop is true", () => {
      render(<TransitionButton isDisabled>Click me</TransitionButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("loading state", () => {
    it("should show loading label while onPress is pending", async () => {
      const user = userEvent.setup();
      render(
        <TransitionButton onPress={asyncPress()} loadingLabel="Loading...">
          Click me
        </TransitionButton>
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toHaveTextContent("Loading...");
    });

    it("should default loadingLabel to '...'", async () => {
      const user = userEvent.setup();
      render(<TransitionButton onPress={asyncPress()}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toHaveTextContent("...");
    });

    it("should activate the Loading component while pending", async () => {
      const user = userEvent.setup();
      render(<TransitionButton onPress={asyncPress()}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      expect(screen.getByTestId("loading")).toHaveAttribute("data-active", "true");
    });

    it("should disable the button while the async call is in-flight", async () => {
      const user = userEvent.setup();
      render(<TransitionButton onPress={asyncPress()}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should restore children text after onPress resolves", async () => {
      const user = userEvent.setup();
      render(
        <TransitionButton onPress={asyncPress()} loadingLabel="Loading...">
          Click me
        </TransitionButton>
      );

      await user.click(screen.getByRole("button"));

      await waitFor(() =>
        expect(screen.getByRole("button")).toHaveTextContent("Click me")
      );
    });

    it("should re-enable the button after onPress resolves", async () => {
      const user = userEvent.setup();
      render(<TransitionButton onPress={asyncPress()}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      await waitFor(() =>
        expect(screen.getByRole("button")).not.toBeDisabled()
      );
    });

    it("should deactivates the Loading component after onPress resolves", async () => {
      const user = userEvent.setup();
      render(<TransitionButton onPress={asyncPress()}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveAttribute("data-active", "false")
      );
    });

    it("Loading is inactive before any interaction", () => {
      render(<TransitionButton onPress={asyncPress()}>Click me</TransitionButton>);
      expect(screen.getByTestId("loading")).toHaveAttribute("data-active", "false");
    });
  });

  describe("error handling", () => {
    it("should re-enable the button even when onPress throws", async () => {
      const user = userEvent.setup();
      const failingPress = jest.fn().mockRejectedValue(new Error("Network error"));

      // Suppress the unhandled rejection noise in test output
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      render(<TransitionButton onPress={failingPress}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      await waitFor(() =>
        expect(screen.getByRole("button")).not.toBeDisabled()
      );

      consoleSpy.mockRestore();
    });

    it("should restore children text even when onPress throws", async () => {
      const user = userEvent.setup();
      const failingPress = jest.fn().mockRejectedValue(new Error("Oops"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      render(
        <TransitionButton onPress={failingPress} loadingLabel="Loading...">
          Click me
        </TransitionButton>
      );

      await user.click(screen.getByRole("button"));

      await waitFor(() =>
        expect(screen.getByRole("button")).toHaveTextContent("Click me")
      );

      consoleSpy.mockRestore();
    });

    it("should deactivate Loading even when onPress throws", async () => {
      const user = userEvent.setup();
      const failingPress = jest.fn().mockRejectedValue(new Error("Oops"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      render(<TransitionButton onPress={failingPress}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveAttribute("data-active", "false")
      );

      consoleSpy.mockRestore();
    });
  });

  describe("when onPress is not provided", () => {
    it("should not throw when clicked", async () => {
      const user = userEvent.setup();
      render(<TransitionButton>Click me</TransitionButton>);
      await expect(user.click(screen.getByRole("button"))).resolves.not.toThrow();
    });

    it("should use isDisabled as the activeLoading signal", () => {
      render(<TransitionButton isDisabled>Click me</TransitionButton>);
      // With no onPress, activeLoading === isDisabled, so Loading should be active
      expect(screen.getByTestId("loading")).toHaveAttribute("data-active", "true");
    });

    it("should not set aria-busy when there is no onPress", () => {
      render(<TransitionButton>Click me</TransitionButton>);
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
    });
  });

  describe("prop forwarding", () => {
    it("should forward arbitrary props to the underlying Button", () => {
      render(
        <TransitionButton data-testid="my-btn" aria-label="Submit form">
          Submit
        </TransitionButton>
      );
      const btn = screen.getByTestId("my-btn");
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("aria-label", "Submit form");
    });

    it("should call onPress exactly once per click", async () => {
      const user = userEvent.setup();
      const onPress = asyncPress();
      render(<TransitionButton onPress={onPress}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button"));
      await waitFor(() => expect(screen.getByRole("button")).not.toBeDisabled());

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should not allow a second click while loading", async () => {
      const user = userEvent.setup();
      const onPress = asyncPress(200);
      render(<TransitionButton onPress={onPress}>Click me</TransitionButton>);

      await user.click(screen.getByRole("button")); // First click — starts loading
      await user.click(screen.getByRole("button")); // Second click — button disabled

      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});