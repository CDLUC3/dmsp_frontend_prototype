import { useCallback } from 'react';

/**
 * Custom hook for scrolling to elements with smooth behavior
 * @returns Function to scroll to an element by selector
 */
export const useScrollToElement = () => {
  return useCallback((selector: string, offset = -100) => {
    const element = document.querySelector(selector);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset + offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, []);
};
