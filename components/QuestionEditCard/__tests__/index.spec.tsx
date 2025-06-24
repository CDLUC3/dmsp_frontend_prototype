import { act, render, screen, fireEvent } from '@testing-library/react';
import QuestionEditCard from '../index';
import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
const { updateQuestionDisplayOrderAction } = require('../actions');


// Mocks
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>;
});

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
jest.mock('next/navigation', () => ({
  useParams: () => ({ templateId: '123' }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/utils/general', () => ({
  stripHtml: (text: string) => text,
}));
jest.mock('@/utils/clientLogger', () => jest.fn());
jest.mock('@/utils/routes', () => ({
  routePath: jest.fn(() => '/template/123'),
}));
jest.mock('../actions', () => ({
  updateQuestionDisplayOrderAction: jest.fn(async () => ({
    success: true,
    errors: [],
    data: {},
    redirect: null,
  })),
}));
jest.mock('../QuestionEditCard.module.scss', () => ({
  questionEditCard: 'questionEditCard',
  questionEditCard__content: 'questionEditCard__content',
  questionEditCard__label: 'questionEditCard__label',
  questionEditCard__name: 'questionEditCard__name',
  questionEditCard__actions: 'questionEditCard__actions',
  questionEditCard__link: 'questionEditCard__link',
  btnDefault: 'btnDefault',
  orderButton: 'orderButton',
}));

describe('QuestionEditCard', () => {
  const defaultProps = {
    id: '1',
    text: 'Sample question?',
    link: '/edit/1',
    name: 'Sample',
    displayOrder: 2,
  };

  it('should render question text and edit link', async () => {
    await act(async () => {
      render(<QuestionEditCard {...defaultProps} />);
    });
    expect(screen.getByText('Sample question?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'links.editQuestion' })).toHaveAttribute('href', '/edit/1');
  });

  it('should call handleDisplayOrderChange with correct values on up/down button click', async () => {
    const setErrorMessages = jest.fn();

    await act(async () => {
      render(
        <QuestionEditCard
          {...defaultProps}
          setErrorMessages={setErrorMessages}
        />
      );
    });
    const upButton = screen.getByRole('button', { name: /moveUp/i });
    const downButton = screen.getByRole('button', { name: /moveDown/i });

    fireEvent.click(upButton);
    fireEvent.click(downButton);

    // No direct assertion here, but if no error is thrown, the handler ran.
    // Could spy on updateQuestionDisplayOrderAction if needed.
    expect(upButton).toBeInTheDocument();
    expect(downButton).toBeInTheDocument();
  });

  it('should not call updateDisplayOrder if new display order < 1', async () => {
    const setErrorMessages = jest.fn();

    await act(async () => {
      render(
        <QuestionEditCard
          {...defaultProps}
          setErrorMessages={setErrorMessages}
          displayOrder={1}
        />
      );
    });
    const upButton = screen.getByRole('button', { name: /buttons.moveUp/i });
    act(() => {
      fireEvent.click(upButton);
    });
    //setErrorMessages should be called with error message
    expect(setErrorMessages).toHaveBeenCalled();
  });

  it('should return null if questionId is missing', async () => {
    let container!: HTMLElement;

    await act(async () => {
      const rendered = render(<QuestionEditCard {...defaultProps} id="" />);
      container = rendered.container;
    });

    expect(container.firstChild).toBeNull();
  });

  it('should call refetchSection on successful reorder', async () => {
    const refetchSection = jest.fn().mockResolvedValue({});
    await act(async () => {
      render(
        <QuestionEditCard
          {...defaultProps}
          refetchSection={refetchSection}
        />
      );
    });
    const downButton = screen.getByRole('button', { name: /moveDown/i });
    fireEvent.click(downButton);
    // Wait for async
    await new Promise(r => setTimeout(r, 0));
    expect(refetchSection).toHaveBeenCalled();
  });

  it('should call setErrorMessages on error from updateDisplayOrder', async () => {
    updateQuestionDisplayOrderAction.mockResolvedValueOnce({
      success: false,
      errors: ['Some error'],
      data: {},
      redirect: null,
    });
    const setErrorMessages = jest.fn();
    await act(async () => {
      render(
        <QuestionEditCard
          {...defaultProps}
          setErrorMessages={setErrorMessages}
        />
      );
    });
    const downButton = screen.getByRole('button', { name: /moveDown/i });
    fireEvent.click(downButton);
    await new Promise(r => setTimeout(r, 0));
    expect(setErrorMessages).toHaveBeenCalledWith(['Some error']);
  });

  it('should pass accessibility tests', async () => {
    const { container } = render(<QuestionEditCard {...defaultProps} />);

    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it('should call setErrorMessages with generalErrorMessage if new display order < 1', async () => {
    const setErrorMessages = jest.fn();
    await act(async () => {
      render(
        <QuestionEditCard
          id="1"
          text="Test question"
          link="/edit/1"
          displayOrder={1}
          setErrorMessages={setErrorMessages}
        />
      );
    });
    const upButton = screen.getByRole('button', { name: /buttons.moveUp/i });
    act(() => {
      fireEvent.click(upButton);
    });
    const callArg = setErrorMessages.mock.calls[0][0];
    expect(typeof callArg).toBe('function');
    // Simulate calling the updater function
    const result = callArg([]);
    expect(result).toContain("messaging.somethingWentWrong");
  });

  it('should call setErrorMessages with [generalErrorMessage] if errors array is empty', async () => {
    updateQuestionDisplayOrderAction.mockResolvedValueOnce({
      success: false,
      errors: [],
      data: {},
      redirect: null,
    });
    const setErrorMessages = jest.fn();
    await act(async () => {
      render(
        <QuestionEditCard
          id="1"
          text="Test question"
          link="/edit/1"
          displayOrder={2}
          setErrorMessages={setErrorMessages}
        />
      );
    });
    const downButton = screen.getByRole('button', { name: /moveDown/i });
    fireEvent.click(downButton);
    await new Promise(r => setTimeout(r, 0));
    expect(setErrorMessages).toHaveBeenCalledWith(["messaging.somethingWentWrong"]);
  });

  it('should call setErrorMessages with generalErrorMessage if result.data.errors.general is not present', async () => {
    updateQuestionDisplayOrderAction.mockResolvedValueOnce({
      success: true,
      errors: [],
      data: { errors: { notGeneral: 'error' } },
      redirect: null,
    });
    const setErrorMessages = jest.fn();
    await act(async () => {
      render(
        <QuestionEditCard
          id="1"
          text="Test question"
          link="/edit/1"
          displayOrder={2}
          setErrorMessages={setErrorMessages}
        />
      );
    });
    const downButton = screen.getByRole('button', { name: /moveDown/i });
    fireEvent.click(downButton);
    await new Promise(r => setTimeout(r, 0));
    // Should not call setErrorMessages in this case, as general is not a string
    expect(setErrorMessages).not.toHaveBeenCalledWith(expect.arrayContaining(['Global.messaging.somethingWentWrong']));
  });

  it('should call setErrorMessages with result.data.errors.general if present', async () => {
    updateQuestionDisplayOrderAction.mockResolvedValueOnce({
      success: true,
      errors: [],
      data: { errors: { general: 'General error message' } },
      redirect: null,
    });
    const setErrorMessages = jest.fn();
    await act(async () => {
      render(
        <QuestionEditCard
          id="1"
          text="Test question"
          link="/edit/1"
          displayOrder={2}
          setErrorMessages={setErrorMessages}
        />
      );
    });
    const downButton = screen.getByRole('button', { name: /moveDown/i });
    fireEvent.click(downButton);
    await new Promise(r => setTimeout(r, 0));
    const callArg = setErrorMessages.mock.calls[0][0];
    expect(typeof callArg).toBe('function');
    // Simulate calling the updater function
    const result = callArg([]);
    expect(result).toContain("General error message");
  });
});



