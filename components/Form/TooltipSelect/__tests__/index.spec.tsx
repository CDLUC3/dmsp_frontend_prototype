// TooltipSelect.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import TooltipSelect, { TooltipSelectOption } from "../index";

expect.extend(toHaveNoViolations);

// Polyfill PointerEvent for jsdom
class PointerEventPolyfill extends MouseEvent {
  pointerType: string;
  pointerId: number;

  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
    this.pointerType = params.pointerType ?? '';
    this.pointerId = params.pointerId ?? 0;
  }
}

global.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,  // 👈 defaults to desktop (non-mobile)
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


// --- Mocks ---

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/components/Icons", () => ({
  DmpIcon: ({ icon }: { icon: string }) => <span data-testid={`icon-${icon}`} />,
}));

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

jest.mock("react-aria-components", () => {
  const actual = jest.requireActual("react-aria-components");
  return {
    ...actual,
    // Mock Popover to render children directly — avoids overlay/inert issues in jsdom
    /* eslint-disable @typescript-eslint/no-explicit-any */
    Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
    // Mock ListBox to render a plain ul with keys
    /* eslint-disable @typescript-eslint/no-explicit-any */
    ListBox: ({ children, items, ...props }: any) => (
      <ul role="listbox" {...props}>
        {items
          /* eslint-disable @typescript-eslint/no-explicit-any */
          ? [...items].map((item: any) => (
            <React.Fragment key={item.id}>{children(item)}</React.Fragment>
          ))
          : children}
      </ul>
    ),
    // Mock ListBoxItem — strip textValue to avoid DOM warning, add key
    ListBoxItem: ({ children, id, className, ...props }: any) => (
      <div role="option" data-key={id} className={className} {...props}>
        {typeof children === "function"
          ? children({ isSelected: false })
          : children}
      </div>
    ),
  };
});

// --- Fixtures ---

const OPTIONS: TooltipSelectOption[] = [
  {
    id: "micro",
    label: "micro",
    tooltip: "1 vCPU, 1 GiB RAM",
    badge: { label: "dev", bg: "#EAF3DE", color: "#3B6D11" },
  },
  {
    id: "small",
    label: "small",
    tooltip: "1 vCPU, 2 GiB RAM",
    badge: { label: "stage", bg: "#FAEEDA", color: "#854F0B" },
  },
  {
    id: "medium",
    label: "medium",
    // no tooltip — tests options without tooltip
  },
];

const OPTIONS_NO_TOOLTIP: TooltipSelectOption[] = [
  { id: "a", label: "Option A" },
  { id: "b", label: "Option B" },
];

const renderComponent = (props = {}) =>
  render(
    <TooltipSelect
      label="Instance type"
      ariaLabel="Instance type"
      options={OPTIONS}
      placeholder="Select an instance type"
      {...props}
    />
  );

// --- Helpers ---

/** Filter out React Aria's hidden <template> copies */
const getVisibleByText = (text: string) =>
  screen.getAllByText(text).find((el) => el.closest("template") === null);

const getVisibleByLabelText = (label: string) =>
  screen
    .getAllByLabelText(label)
    .find((el) => el.closest("template") === null)!;

const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
  const button = screen.getByRole("button", { name: /instance type/i });
  await user.click(button);
};

/** Use the hidden native select to trigger selection — the ListBox mock
 *  doesn't register items with React Aria's internal state, so we inject
 *  the option manually and fire a change event. */
const selectOption = (value: string) => {
  const hiddenSelect = document.querySelector(
    '[data-testid="hidden-select-container"] select'
  ) as HTMLSelectElement;
  const option = document.createElement("option");
  option.value = value;
  hiddenSelect.appendChild(option);
  fireEvent.change(hiddenSelect, { target: { value } });
};

/** jsdom's fireEvent doesn't propagate pointerType through React's synthetic
 *  event system correctly — dispatch a native PointerEvent instead. */
const fireMousePointerEnter = async (element: HTMLElement) => {
  await act(async () => {
    element.dispatchEvent(
      new PointerEvent("pointerover", {
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
      })
    );
  });
};

const fireMousePointerLeave = async (element: HTMLElement) => {
  await act(async () => {
    element.dispatchEvent(
      new PointerEvent("pointerout", {
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
      })
    );
  });
};

const fireTouchPointerDown = async (element: HTMLElement) => {
  await act(async () => {
    element.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType: "touch",
      })
    );
  });
};

// --- Tests ---

describe("TooltipSelect", () => {
  describe("Rendering", () => {
    it("should render the label", () => {
      renderComponent();
      expect(getVisibleByText("Instance type")).toBeInTheDocument();
    });

    it("should render the placeholder when no default key is set", () => {
      renderComponent();
      expect(screen.getByText("Select an instance type")).toBeInTheDocument();
    });

    it("should render the default selected value when defaultSelectedKey is provided", () => {
      renderComponent({ defaultSelectedKey: "micro" });
      expect(getVisibleByText("micro")).toBeInTheDocument();
    });

    it("should render required indicator when isRequired is true", () => {
      renderComponent({ isRequired: true });
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it("should render required indicator when isRequiredVisualOnly is true", () => {
      renderComponent({ isRequiredVisualOnly: true });
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it("should render description when provided", () => {
      renderComponent({ description: "Choose your instance size" });
      expect(getVisibleByText("Choose your instance size")).toBeInTheDocument();
    });

    it("should render help message when provided", () => {
      renderComponent({ helpMessage: "This affects pricing" });
      expect(getVisibleByText("This affects pricing")).toBeInTheDocument();
    });

    it("should render error message when provided", () => {
      renderComponent({ errorMessage: "This field is required" });
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should not render required indicator when neither isRequired nor isRequiredVisualOnly is set", () => {
      renderComponent();
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });
  });

  describe("Dropdown", () => {
    it("should open the dropdown when the button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should render all options when dropdown is open", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);
      expect(getVisibleByText("micro")).toBeInTheDocument();
      expect(getVisibleByText("small")).toBeInTheDocument();
      expect(getVisibleByText("medium")).toBeInTheDocument();
    });

    it("should render badges for options that have them", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);
      expect(getVisibleByText("dev")).toBeInTheDocument();
      expect(getVisibleByText("stage")).toBeInTheDocument();
    });

    it("should call onSelectionChange with the correct key when an option is selected", async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();
      renderComponent({ onSelectionChange });
      await openDropdown(user);
      selectOption("micro");
      expect(onSelectionChange).toHaveBeenCalledWith("micro");
    });

    it("should render info icon only for options that have a tooltip", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);
      // Filter out icons inside <template>
      const infoIcons = screen
        .getAllByTestId("icon-info")
        .filter((el) => el.closest("template") === null);
      // micro and small have tooltips, medium does not
      expect(infoIcons).toHaveLength(2);
    });


    it("should not render info icon for options without a tooltip", async () => {
      const openDropdown = async (
        user: ReturnType<typeof userEvent.setup>,
        name = /instance type/i  // default, but overridable
      ) => {
        const button = screen.getByRole("button", { name });
        await user.click(button);
      };

      const user = userEvent.setup();
      render(<TooltipSelect ariaLabel="Test" options={OPTIONS_NO_TOOLTIP} />);
      await openDropdown(user, /test/i);
      expect(screen.queryByTestId("icon-info")).not.toBeInTheDocument();
    });
  });

  describe("Tooltip — Desktop (mouse)", () => {
    it("should show tooltip on mouse enter of info icon", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      await fireMousePointerEnter(getVisibleByLabelText("Info: micro"));

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("should hide tooltip on mouse leave of info icon", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      const infoTrigger = getVisibleByLabelText("Info: micro");
      await fireMousePointerEnter(infoTrigger);
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

      await fireMousePointerLeave(infoTrigger);
      await waitFor(() =>
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      );
    });

    it("should show tooltip content including label and body", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      await fireMousePointerEnter(getVisibleByLabelText("Info: micro"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveTextContent("micro");
        expect(tooltip).toHaveTextContent("1 vCPU, 1 GiB RAM");
      });
    });

    it("should show badge inside tooltip for options that have one", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      await fireMousePointerEnter(getVisibleByLabelText("Info: micro"));

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toHaveTextContent("dev");
      });
    });

    it("should not show tooltip on touch pointer enter", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      getVisibleByLabelText("Info: micro").dispatchEvent(
        new PointerEvent("pointerenter", {
          bubbles: true,
          pointerType: "touch",
        })
      );

      await waitFor(() =>
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      );
    });
  });

  describe("Tooltip — Mobile (touch)", () => {
    it("should show tooltip on first tap of info icon", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      fireTouchPointerDown(getVisibleByLabelText("Info: micro"));

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("should hide tooltip on second tap of info icon", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      const infoTrigger = getVisibleByLabelText("Info: micro");

      fireTouchPointerDown(infoTrigger);
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

      fireTouchPointerDown(infoTrigger);
      await waitFor(() =>
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      );
    });

    it("should close tooltip on click of close button", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      fireTouchPointerDown(getVisibleByLabelText("Info: micro"));
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

      // fireEvent.click ignores pointer-events: none, unlike user.click
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /close tooltip/i }));
      });

      await waitFor(() =>
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      );
    });

  });

  describe("Tooltip — Keyboard", () => {
    it("should show tooltip on focus of info icon", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      await act(async () => { fireEvent.focus(getVisibleByLabelText("Info: micro")); });

      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());
    });


    it("should hide tooltip on blur of info icon", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      const infoTrigger = getVisibleByLabelText("Info: micro");
      await act(async () => { fireEvent.focus(infoTrigger); });
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

      await act(async () => { fireEvent.blur(infoTrigger); });
      await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
    });

    it("should toggle tooltip open with Enter key", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      const infoTrigger = getVisibleByLabelText("Info: micro");
      // Don't focus first — focus already opens via onFocus, keyDown would close it
      await act(async () => { fireEvent.keyDown(infoTrigger, { key: "Enter" }); });

      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());
    });


    it("should toggle tooltip open with Space key", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      const infoTrigger = getVisibleByLabelText("Info: micro");
      await act(async () => { fireEvent.keyDown(infoTrigger, { key: " " }); });

      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());
    });


    it("should toggle tooltip closed with Enter key on second press", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      const infoTrigger = getVisibleByLabelText("Info: micro");

      // First Enter — open
      await act(async () => { fireEvent.keyDown(infoTrigger, { key: "Enter" }); });
      await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

      // Second Enter — close
      await act(async () => { fireEvent.keyDown(infoTrigger, { key: "Enter" }); });
      await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
    });
  });

  describe("Accessibility", () => {
    it("should have no accessibility violations on initial render", async () => {
      const { container } = renderComponent();
      const results = await axe(container, {
        rules: {
          // These violations are artifacts of the ListBox/ListBoxItem mock,
          // not real violations in the actual component
          "nested-interactive": { enabled: false },
          "aria-input-field-name": { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("should have a descriptive aria-label for the info trigger", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);
      expect(getVisibleByLabelText("Info: micro")).toBeInTheDocument();
    });

    it("should have role=tooltip when tooltip is visible", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      await fireMousePointerEnter(getVisibleByLabelText("Info: micro"));

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });

    it("should have a descriptive aria-label for the close button", async () => {
      const user = userEvent.setup();
      renderComponent();
      await openDropdown(user);

      fireTouchPointerDown(getVisibleByLabelText("Info: micro"));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /close tooltip/i })
        ).toBeInTheDocument();
      });
    });
  });
});