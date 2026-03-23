
import { render, screen, act } from '@testing-library/react'
import NavigationEvents from '../index';

// Mocks
const mockDone = jest.fn()

let mockPathname = '/initial'

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('nprogress', () => ({
  configure: jest.fn(),
  done: (...args: unknown[]) => mockDone(...args),
}))

describe('NavigationEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockPathname = '/initial'
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const renderComponent = () => render(<NavigationEvents />)

  it('should not announce anything on initial mount', () => {
    renderComponent()

    const region = screen.getByRole('status', { hidden: true })
    expect(region).toHaveTextContent('')
    expect(mockDone).not.toHaveBeenCalled()
  })

  it('should set loading message on navigation start event', () => {
    renderComponent()

    act(() => {
      window.dispatchEvent(new CustomEvent('app:navigation:start'))
    })

    expect(
      screen.getByText('messaging.loadingPage')
    ).toBeInTheDocument()
  })

  it('should start fallback timer on navigation start', () => {
    renderComponent()

    act(() => {
      window.dispatchEvent(new CustomEvent('app:navigation:start'))
    })

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(mockDone).toHaveBeenCalled()
  })

  it('should clear previous fallback timer if navigation starts again', () => {
    renderComponent()

    act(() => {
      window.dispatchEvent(new CustomEvent('app:navigation:start'))
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Trigger another navigation start (should reset timer)
    act(() => {
      window.dispatchEvent(new CustomEvent('app:navigation:start'))
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // Should NOT have fired yet (timer was reset)
    expect(mockDone).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(mockDone).toHaveBeenCalledTimes(1)
  })

  it('should call NProgress.done and set pageLoaded message on pathname change', () => {
    const { rerender } = renderComponent()

    // simulate navigation start first (to mimic real flow)
    act(() => {
      window.dispatchEvent(new CustomEvent('app:navigation:start'))
    })

    // change pathname
    act(() => {
      mockPathname = '/next'
      rerender(<NavigationEvents />)
    })

    expect(mockDone).toHaveBeenCalled()

    expect(
      screen.getByText('messaging.pageLoaded')
    ).toBeInTheDocument()
  })

  it('should clear fallback timer on successful navigation', () => {
    const { rerender } = renderComponent()

    act(() => {
      window.dispatchEvent(new CustomEvent('app:navigation:start'))
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    act(() => {
      mockPathname = '/next'
      rerender(<NavigationEvents />)
    })

    // advance remaining time — fallback should NOT fire
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(mockDone).toHaveBeenCalledTimes(1) // only from completion, not fallback
  })

  it('should skip announcing pageLoaded on initial mount', () => {
    renderComponent()

    expect(
      screen.queryByText('messaging.pageLoaded')
    ).not.toBeInTheDocument()
  })
})