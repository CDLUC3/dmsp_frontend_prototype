import sanitizeHtml from 'sanitize-html';
import React from 'react';

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'table', 'th', 'tr', 'td'],
  allowedAttributes: {
    a: ['href']
  },
};

const sanitize = (dirty: string, options: sanitizeHtml.IOptions = defaultOptions) => ({
  __html: sanitizeHtml(
    dirty,
    options,
  )
});

interface SanitizeHTMLProps {
  html: string;
  options?: sanitizeHtml.IOptions;
}

export const SanitizeHTML: React.FC<SanitizeHTMLProps> = ({ html, options }) => (
  <div dangerouslySetInnerHTML={sanitize(html, options)} />
);

export function inDevMode() {
  return window.location.hostname === 'localhost';
}