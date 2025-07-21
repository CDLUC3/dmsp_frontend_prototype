import React from 'react';

import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import {
  LayoutContainer,
  ContentContainer,
  ToolbarContainer,
  LayoutWithPanel,
  SidebarPanel,
  DrawerPanel,
} from '@/components/Container';


describe('LayoutContainer', () => {
  it('should create a div with correct class', () => {
    render(<LayoutContainer><h1>test</h1></LayoutContainer>);
    const container = screen.getByTestId('layout-container');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('layout-container');
  });

  it('should create the div with custom class', () => {
    render(<LayoutContainer className="custom-klass"><h1>test</h1></LayoutContainer>);
    const container = screen.getByTestId('layout-container');

    expect(container).toHaveClass('custom-klass');

    // Make sure it still has the original class
    expect(container).toHaveClass('layout-container');
  });

  it('should create a div with a custom ID', () => {
    render(<LayoutContainer id="customID"><h1>test</h1></LayoutContainer>);
    const container = screen.getByTestId('layout-container');

    expect(container).toHaveAttribute('id', 'customID');
  });
});


describe('ContentConainer', () => {
  it('should create a div with correct class', () => {
    render(<ContentContainer><h1>test</h1></ContentContainer>);
    const container = screen.getByTestId('content-container');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('layout-content-container');
  });

  it('should create a div with custom class', () => {
    render(<ContentContainer className="custom-klass"><h1>test</h1></ContentContainer>);
    const container = screen.getByTestId('content-container');

    expect(container).toHaveClass('custom-klass');
    // Should still retain original class
    expect(container).toHaveClass('layout-content-container');
  });

  it('should create a div with custom ID', () => {
    render(<ContentContainer id="customID"><h1>test</h1></ContentContainer>);
    const container = screen.getByTestId('content-container');

    expect(container).toHaveAttribute('id', 'customID');
  });
});


describe('ToolbarContainer', () => {
  it('should create a div with correct class', () => {
    render(<ToolbarContainer><h1>test</h1></ToolbarContainer>);
    const container = screen.getByTestId('toolbar-container');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('layout-container');
    expect(container).toHaveClass('layout-toolbar-container');
  });

  it('should create a div with custom class', () => {
    render(<ToolbarContainer className="custom-klass"><h1>test</h1></ToolbarContainer>);
    const container = screen.getByTestId('toolbar-container');

    expect(container).toHaveClass('custom-klass');
    // Verify we still have original base classes
    expect(container).toHaveClass('layout-container');
    expect(container).toHaveClass('layout-toolbar-container');
  });

  it('should create a div with custom ID', () => {
    render(<ToolbarContainer id="customID"><h1>test</h1></ToolbarContainer>);
    const container = screen.getByTestId('toolbar-container');

    expect(container).toHaveAttribute('id', 'customID');
  });
});


describe('SidebarPanel', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn(); // Called by the wrapping PageHeader
  })
  it('should create a div with correct class', () => {
    render(<SidebarPanel><h1>test</h1></SidebarPanel>);
    const sidebar = screen.getByTestId('sidebar-panel');

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('layout-sidebar-panel');
  });

  it('should create a div with custom class', () => {
    render(<SidebarPanel className="custom-klass"><h1>test</h1></SidebarPanel>);
    const sidebar = screen.getByTestId('sidebar-panel');

    expect(sidebar).toHaveClass('custom-klass');
    expect(sidebar).toHaveClass('layout-sidebar-panel');
  });

  it('should create a div with custom ID', () => {
    render(<SidebarPanel id="customID"><h1>test</h1></SidebarPanel>);
    const sidebar = screen.getByTestId('sidebar-panel');

    expect(sidebar).toHaveAttribute('id', 'customID');
  });

  it('should toggle open and close on SidebarPanel', () => {
    const { rerender } = render(<SidebarPanel isOpen={true}><h1>test</h1></SidebarPanel>);

    const sidebar = screen.getByTestId('sidebar-panel');

    expect(sidebar).toHaveClass('state-open');
    expect(sidebar).not.toHaveClass('state-closed');
    rerender(<SidebarPanel isOpen={false}><h1>test</h1></SidebarPanel>);

    expect(sidebar).toHaveClass('state-closed');
    expect(sidebar).not.toHaveClass('state-open');
  });
});


describe('DrawerPanel', () => {
  it('should create a div with correct class', () => {
    render(<DrawerPanel><h1>test</h1></DrawerPanel>);
    const sidebar = screen.getByTestId('drawer-panel');

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('layout-drawer-panel');
  });

  it('should create a div with custom class', () => {
    render(<DrawerPanel className="custom-klass"><h1>test</h1></DrawerPanel>);
    const sidebar = screen.getByTestId('drawer-panel');

    expect(sidebar).toHaveClass('custom-klass');
    expect(sidebar).toHaveClass('layout-drawer-panel');
  });

  it('should create a div with custom ID', () => {
    render(<DrawerPanel id="customID"><h1>test</h1></DrawerPanel>);
    const sidebar = screen.getByTestId('drawer-panel');

    expect(sidebar).toHaveAttribute('id', 'customID');
  });

  it('can toggle open and closed state', () => {
    const { rerender } = render(<DrawerPanel isOpen={true}><h1>test</h1></DrawerPanel>);

    const drawer = screen.getByTestId('drawer-panel');

    expect(drawer).toHaveClass('state-open');
    expect(drawer).not.toHaveClass('state-closed');

    rerender(<DrawerPanel isOpen={false}><h1>test</h1></DrawerPanel>);

    expect(drawer).toHaveClass('state-closed');
    expect(drawer).not.toHaveClass('state-open');
  });

  it('should have an actionable close button', () => {
    const handleClose = jest.fn();

    render(
      <DrawerPanel isOpen={true} onClose={handleClose}><h1>test</h1></DrawerPanel>
    );

    const drawer = screen.getByTestId('drawer-panel');
    const closeBtn = screen.getByTestId('close-action');

    expect(drawer).toHaveClass('state-open');

    fireEvent.click(closeBtn);
    expect(drawer).toHaveClass('state-closed');
    expect(handleClose).toHaveBeenCalled();
  });
});


describe('LayoutWithPanel', () => {
  it('should create a div with correct class', () => {
    render(<LayoutWithPanel><h1>test</h1></LayoutWithPanel>);
    const container = screen.getByTestId('layout-with-panel');

    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('layout-container');
    expect(container).toHaveClass('layout-with-panel');
  });

  it('should create a div with custom class', () => {
    render(<LayoutWithPanel className="custom-klass"><h1>test</h1></LayoutWithPanel>);
    const container = screen.getByTestId('layout-with-panel');

    expect(container).toBeInTheDocument();

    expect(container).toHaveClass('custom-klass');
    // Should still have original base classes
    expect(container).toHaveClass('layout-container');
    expect(container).toHaveClass('layout-with-panel');
  });

  it('should support an inner toolbar container', () => {
    render(
      <LayoutWithPanel className="custom-klass">
        <ToolbarContainer><h1>test</h1></ToolbarContainer>
      </LayoutWithPanel>
    );

    const layout = screen.getByTestId('layout-with-panel');
    const toolbar = screen.getByTestId('toolbar-container');

    expect(layout).toBeInTheDocument();
    expect(toolbar).toBeInTheDocument();

    expect(layout).toHaveClass('with-toolbar');

    // Should still have original base classes
    expect(layout).toHaveClass('custom-klass');
    expect(layout).toHaveClass('layout-container');
    expect(layout).toHaveClass('layout-with-panel');
  });

  it('should support a sidebar on right', () => {
    render(
      <LayoutWithPanel>
        <ContentContainer><h1>test</h1></ContentContainer>
        <SidebarPanel><h1>test</h1></SidebarPanel>
      </LayoutWithPanel>
    );

    const layout = screen.getByTestId('layout-with-panel');

    expect(layout).toHaveClass('with-sidebar');
    expect(layout).not.toHaveClass('with-drawer');
    expect(layout).toHaveClass('direction-right');
    expect(layout).not.toHaveClass('direction-left');
  });

  it('should support a sidebar on left', () => {
    render(
      <LayoutWithPanel>
        <SidebarPanel><h1>test</h1></SidebarPanel>
        <ContentContainer><h1>test</h1></ContentContainer>
      </LayoutWithPanel>
    );

    const layout = screen.getByTestId('layout-with-panel');

    expect(layout).toHaveClass('with-sidebar');
    expect(layout).not.toHaveClass('with-drawer');
    expect(layout).toHaveClass('direction-left');
    expect(layout).not.toHaveClass('direction-right');
  });

  it('should support a drawer on right', () => {
    render(
      <LayoutWithPanel>
        <ContentContainer><h1>test</h1></ContentContainer>
        <DrawerPanel><h1>test</h1></DrawerPanel>
      </LayoutWithPanel>
    );

    const layout = screen.getByTestId('layout-with-panel');

    expect(layout).toHaveClass('with-drawer');
    expect(layout).not.toHaveClass('with-sidebar');
    expect(layout).toHaveClass('direction-right');
    expect(layout).not.toHaveClass('direction-left');
  });

  it('should support a drawer on left', () => {
    render(
      <LayoutWithPanel>
        <DrawerPanel><h1>test</h1></DrawerPanel>
        <ContentContainer><h1>test</h1></ContentContainer>
      </LayoutWithPanel>
    );

    const layout = screen.getByTestId('layout-with-panel');

    expect(layout).toHaveClass('with-drawer');
    expect(layout).not.toHaveClass('with-sidebar');
    expect(layout).toHaveClass('direction-left');
    expect(layout).not.toHaveClass('direction-right');
  });
});
