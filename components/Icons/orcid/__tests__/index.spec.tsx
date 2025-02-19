import React from 'react';
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import {OrcidIcon} from '..';

describe('OrcidIcon Component', () => {
  it('renders the icon with correct classes', () => {
    render(<OrcidIcon icon="orcid" />);
    const svg = screen.getByTestId('orcidIconSvg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('orcid-icon');
    expect(svg).toHaveClass('icon-orcid');
  });

  it('renders with additional classes when provided', () => {
    render(<OrcidIcon icon="orcid" classes="test-class" />);
    const svg = screen.getByTestId('orcidIconSvg');

    expect(svg).toHaveClass('test-class');
  });
});
