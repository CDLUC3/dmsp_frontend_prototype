import React from 'react';
import { render, screen } from '@testing-library/react';
import ButtonWithImage from '..';


// Mock the Next.js Image component
jest.mock('next/image', () => (props: any) => {
  return <img {...props} />;
});

describe('ButtonWithImage', () => {
  const mockImageUrl = '/path/to/image.jpg';
  const mockButtonText = 'Click me';

  it('should render button with the correct text and image', () => {
    render(<ButtonWithImage imageUrl={mockImageUrl} buttonText={mockButtonText} />);

    // Check if the button text is rendered
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();

    // Check if the image is rendered with the correct URL and alt attributes
    const image = screen.getByAltText('');
    expect(image).toHaveAttribute('src', mockImageUrl);
    expect(image).toHaveAttribute('width', '20');
    expect(image).toHaveAttribute('height', '20');
  });

  it('should apply the correct styles', () => {
    const { container } = render(<ButtonWithImage imageUrl={mockImageUrl} buttonText={mockButtonText} />);

    const button = container.querySelector('.react-aria-Button');
    expect(button).toHaveClass('react-aria-Button');

    const image = container.querySelector('img');
    expect(image).toHaveClass('icon');
  });
});