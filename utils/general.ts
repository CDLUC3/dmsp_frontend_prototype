import sanitizeHtml from 'sanitize-html';

export const scrollToTop = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
  if (ref.current) {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

// Convert a string to sentence case
export const toSentenceCase = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const stripHtml = (htmlString: string | null | undefined): string => {

  if (!htmlString) {
    return '';
  }

  try {
    const stringToProcess = String(htmlString);
    const clean = sanitizeHtml(stringToProcess, {
      allowedTags: [],
      allowedAttributes: {},
    });
    return clean;
  } catch {
    return String(htmlString);
  }
};

/**
 * Removes all content enclosed in "<" and ">" brackets, including the brackets themselves.
 * @param input - The string to sanitize.
 * @returns The sanitized string.
 */
export const stripHtmlTags = (input: string): string => {
  return input.replace(/<[^>]*>/g, '');
};


