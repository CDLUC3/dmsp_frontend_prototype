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
 * Strips HTML tags from a string.
 * If `tagsToRemove` is provided, only those tags are stripped (inner text is preserved).
 * If not provided, all HTML tags are stripped.
 */
export const stripHtmlTags = (input: string | null | undefined, tagsToRemove?: string[]): string => {
  if (input && input.length > 0) {
    if (tagsToRemove && tagsToRemove.length > 0) {
      // Remove only the specified tags
      const pattern = `<\\/?(?:${tagsToRemove.join('|')})\\b[^>]*>`;
      const regex = new RegExp(pattern, 'gi');
      return input.replace(regex, ' ').replace(/&nbsp;/g, ' ');
    } else {
      // Remove all tags
      return input.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    }
  }
  return '';
};

// Examples:
//console.log(stripHtmlTags('<p>Hello <b>world</b></p>')); 
// "Hello world"

//console.log(stripHtmlTags('<p>Hello <b>world</b></p>', ['p','b'])); 
// "Hello world"




export const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

