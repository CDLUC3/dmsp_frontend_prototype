import React from 'react';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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
});
