import React from 'react';

import '@testing-library/jest-dom';
import { act,render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

import { DmpIcon } from '..';


describe('DmpIcon Component', () => {
  it('should have a div with correct classname', () => {
    render(<DmpIcon icon="home" />);
    const wrapper = screen.getByTestId('dmpIconSvg');

    expect(wrapper).toHaveClass('dmp-icon');
    expect(wrapper).toHaveClass('icon-home');
  });

  it('should use correct icon href', () => {
    render(<DmpIcon icon="search" />);
    const el = screen.getByTestId('dmpIconSvgUse');

    expect(el.getAttribute('href')).toBe('/icons/iconset.svg#icon-search');
  });

  it('should render with correct classes if passed in', () => {
    render(<DmpIcon 
      icon="search" 
      classes="my-class"
      />);

    const svg = screen.getByTestId('dmpIconSvg');
    expect(svg).toHaveClass('dmp-icon', 'icon-search', 'my-class');
  });

  it('should pass axe accessibility test', async () => {
    const { container } = render(<DmpIcon icon="search" />);

    await act(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  });
});
