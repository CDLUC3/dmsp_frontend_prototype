export const doiToUrl = (doi: string): string => {
  return `https://doi.org/${doi}`;
};

export const rorToUrl = (ror: string): string => {
  return `https://ror.org/${ror}`;
};

export const orcidToUrl = (orcid: string): string => {
  return `https://orcid.org/${orcid}`;
};

export function extractDoi(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }
  const pattern = /10\.[\d.]+\/[^\s]+/i;
  const match = text.match(pattern);

  if (match) {
    return cleanString(match[0]);
  }

  return null;
}

export function cleanString(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }

  return text.toLowerCase().trim();
}
