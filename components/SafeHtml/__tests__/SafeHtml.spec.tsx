import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock DOMPurify to make sanitize deterministic and spyable
jest.mock('dompurify', () => {
  const sanitize = jest.fn((input: string) => input);
  return {
    __esModule: true,
    default: { sanitize },
  };
});

import DOMPurify from 'dompurify';
import { SafeHtml } from '@/components/SafeHtml';

describe('SafeHtml', () => {
  beforeEach(() => {
    // Reset mock call counts and behavior before each test
    (DOMPurify as unknown as { sanitize: jest.Mock }).sanitize.mockClear();
  });

  it('should return null when html is null', () => {
    const { container } = render(<SafeHtml html={null} />);
    expect(container.firstChild).toBeNull();
    expect((DOMPurify as unknown as { sanitize: jest.Mock }).sanitize).not.toHaveBeenCalled();
  });

  it('should return null when sanitized is empty or whitespace', () => {
    const sanitizeMock = (DOMPurify as unknown as { sanitize: jest.Mock }).sanitize;
    // Return only whitespace to trigger the trim-empty check
    sanitizeMock.mockImplementationOnce(() => '   ');

    const { container } = render(<SafeHtml html={'   '} />);
    expect(container.firstChild).toBeNull();
    expect(sanitizeMock).toHaveBeenCalledWith('   ');
  });

  it('should wrap plain text in a <p> by default when wrapPlainText is true', () => {
    render(<SafeHtml html="Hello world" className="my-class" />);
    const el = screen.getByText('Hello world');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('my-class');
    expect((DOMPurify as unknown as { sanitize: jest.Mock }).sanitize).toHaveBeenCalledWith('Hello world');
  });

  it('should wrap plain text using the custom plainTextWrapper', () => {
    render(
      <SafeHtml html="Plain" plainTextWrapper="span" className="plain-span" />
    );
    const el = screen.getByText('Plain');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('plain-span');
  });

  it('should render plain text inside the `as` wrapper when wrapPlainText is false', () => {
    render(
      <SafeHtml html="No wrap" wrapPlainText={false} as="span" className="no-wrap" />
    );
    const el = screen.getByText('No wrap');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('no-wrap');
  });

  it('should render sanitized HTML inside a div by default', () => {
    const { container } = render(<SafeHtml html="<em>Hi</em>" className="html" />);
    const wrapper = container.querySelector('div.html');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector('em')?.textContent).toBe('Hi');
  });

  it('should use the provided `as` wrapper for HTML content', () => {
    const { container } = render(
      <SafeHtml html="<strong>Bold</strong>" as="section" className="wrap" />
    );
    const wrapper = container.querySelector('section.wrap');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector('strong')?.textContent).toBe('Bold');
  });

  it('should invoke DOMPurify.sanitize with the provided html', () => {
    const sanitizeMock = (DOMPurify as unknown as { sanitize: jest.Mock }).sanitize;
    render(<SafeHtml html="<a href='#'>Link</a>" />);
    expect(sanitizeMock).toHaveBeenCalledTimes(1);
    expect(sanitizeMock).toHaveBeenCalledWith("<a href='#'>Link</a>");
  });
});
