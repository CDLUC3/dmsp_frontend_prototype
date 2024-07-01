import * as sanitizeHtml from 'sanitize-html';
import PropTypes from 'prop-types';

const defaultOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'table', 'th', 'tr', 'td'],
  allowedAttributes: {
    a: ['href']
  },
};

const sanitize = (dirty, options = defaultOptions) => ({
  __html: sanitizeHtml(
    dirty,
    options,
  )
});

export const SanitizeHTML = ({ html, options }) => (
  < div dangerouslySetInnerHTML={sanitize(html, options)} />
);

export function inDevMode() {
  return window.location.hostname === 'localhost';
}

SanitizeHTML.propTypes = {
  html: PropTypes.string.isRequired,
  options: PropTypes.object,
}