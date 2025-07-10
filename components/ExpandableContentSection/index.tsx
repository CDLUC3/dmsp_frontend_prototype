'use client';
import React, { useState, useMemo } from 'react';
import styles from './ExpandableContentSection.module.scss';

export default function ExpandableContentSection({
  id,
  heading,
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
  summaryRows = 2,
  summaryCharLimit,
  children
}: {
  id: string;
  heading: string;
  expandLabel?: string;
  collapseLabel?: string;
  summaryRows?: number;
  summaryCharLimit?: number;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = `${id}-content`;

  // Helper function to extract text content from React nodes
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return node.toString();
    if (!node) return '';

    if (Array.isArray(node)) {
      return node.map(getTextContent).join('');
    }

    if (typeof node === 'object' && 'props' in node) {
      return getTextContent(node.props.children);
    }

    return '';
  };

  // Helper function to truncate text at word boundaries
  const truncateText = (text: string, maxLength: number): { truncated: string; wasTruncated: boolean } => {
    if (text.length <= maxLength) {
      return { truncated: text, wasTruncated: false };
    }

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;

    return { truncated: finalText + '...', wasTruncated: true };
  };

  // Helper function to truncate React element content
  const truncateElement = (element: React.ReactElement, remainingChars: number): {
    element: React.ReactElement;
    charsUsed: number;
    wasTruncated: boolean
  } => {
    const textContent = getTextContent(element);
    const { truncated, wasTruncated } = truncateText(textContent, remainingChars);

    if (!wasTruncated) {
      return { element, charsUsed: textContent.length, wasTruncated: false };
    }

    // Create a truncated version of the element
    const truncatedElement = React.cloneElement(element, {
      ...element.props,
      children: truncated
    });

    return { element: truncatedElement, charsUsed: remainingChars, wasTruncated: true };
  };

  // Process children to extract summary and remaining content
  const { summary, hasMore, remainingContent, isSingleElementTruncated } = useMemo(() => {
    if (!children) return { summary: null, hasMore: false, remainingContent: null, isSingleElementTruncated: false };

    const childrenArray = React.Children.toArray(children);

    if (summaryCharLimit) {
      // Character-based truncation
      let charCount = 0;
      const summaryElements: React.ReactNode[] = [];
      let foundTruncation = false;
      let lastProcessedIndex = -1;
      let remainingContentFromTruncatedElement: React.ReactNode = null;
      let isSingleElementTruncated = false;

      for (let i = 0; i < childrenArray.length; i++) {
        const child = childrenArray[i];
        const remainingChars = summaryCharLimit - charCount;

        if (remainingChars <= 0) break;

        if (React.isValidElement(child)) {
          const { element, charsUsed, wasTruncated } = truncateElement(child, remainingChars);
          summaryElements.push(element);
          charCount += charsUsed;
          lastProcessedIndex = i;

          if (wasTruncated) {
            foundTruncation = true;
            isSingleElementTruncated = (i === 0 && childrenArray.length === 1);

            // Create the remaining content for this truncated element
            const originalText = getTextContent(child);
            const truncatedText = getTextContent(element);
            const remainingText = originalText.substring(truncatedText.length - 3); // Remove the "..."

            if (remainingText.trim()) {
              if (isSingleElementTruncated) {
                // For single element truncation, just return the remaining text without wrapping
                remainingContentFromTruncatedElement = remainingText;
              } else {
                remainingContentFromTruncatedElement = React.cloneElement(child, {
                  ...child.props,
                  children: remainingText
                });
              }
            }
            break;
          }
        } else {
          // Handle text nodes
          const textContent = getTextContent(child);
          const { truncated, wasTruncated } = truncateText(textContent, remainingChars);
          summaryElements.push(truncated);
          charCount += wasTruncated ? remainingChars : textContent.length;
          lastProcessedIndex = i;

          if (wasTruncated) {
            foundTruncation = true;
            isSingleElementTruncated = (i === 0 && childrenArray.length === 1);
            const originalText = textContent;
            const remainingText = originalText.substring(truncated.length - 3); // Remove the "..."
            if (remainingText.trim()) {
              remainingContentFromTruncatedElement = remainingText;
            }
            break;
          }
        }
      }

      const hasMoreContent = foundTruncation || summaryElements.length < childrenArray.length;

      // Build remaining content
      let remainingContent = null;
      if (hasMoreContent) {
        const remainingElements = [];

        // Add the remaining part of the truncated element if any
        if (remainingContentFromTruncatedElement) {
          remainingElements.push(remainingContentFromTruncatedElement);
        }

        // Add all subsequent elements
        if (lastProcessedIndex + 1 < childrenArray.length) {
          remainingElements.push(...childrenArray.slice(lastProcessedIndex + 1));
        }

        remainingContent = remainingElements.length > 0 ? remainingElements : null;
      }

      return {
        summary: summaryElements,
        hasMore: hasMoreContent,
        remainingContent,
        isSingleElementTruncated
      };
    } else {
      // Element-based truncation (default behavior)
      if (childrenArray.length <= summaryRows) {
        return {
          summary: children,
          hasMore: false,
          remainingContent: null,
          isSingleElementTruncated: false
        };
      }

      const summaryElements = childrenArray.slice(0, summaryRows);
      const remainingElements = childrenArray.slice(summaryRows);

      return {
        summary: summaryElements,
        hasMore: remainingElements.length > 0,
        remainingContent: remainingElements,
        isSingleElementTruncated: false
      };
    }
  }, [children, summaryRows, summaryCharLimit]);

  return (
    <section className={styles.section}>
      <h3 id={`${id}-heading`}>{heading}</h3>

      {/* Always show summary content */}
      <div className={styles.summaryContent}>
        {summary}
      </div>

      {/* Show expand/collapse controls only if there's more content */}
      {hasMore && (
        <>
          {!isExpanded ? (
            <p>
              <a
                href={`#${contentId}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(true);
                }}
                aria-expanded="false"
                aria-controls={contentId}
                className={styles.expandLink}
              >
                {expandLabel}
              </a>
              <span aria-live="polite" className="hidden-accessibly">
                Section collapsed
              </span>
            </p>
          ) : (
            <div
              id={contentId}
              className={styles.extraContent}
              role="region"
              aria-labelledby={`${id}-heading`}
            >
              {remainingContent}
              <p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(false);
                  }}
                  aria-expanded="true"
                  aria-controls={contentId}
                  className={styles.collapseLink}
                >
                  {collapseLabel}
                </a>
                <span aria-live="polite" className="hidden-accessibly">
                  Section expanded
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}