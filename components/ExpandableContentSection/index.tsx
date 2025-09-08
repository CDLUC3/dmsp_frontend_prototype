'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ExpandableContentSection.module.scss';

export default function ExpandableContentSection({
  id,
  heading,
  expandLabel,
  collapseLabel,
  summaryCharLimit,
  children
}: {
  id: string;
  heading?: string;
  expandLabel?: string;
  collapseLabel?: string;
  summaryCharLimit?: number;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = `${id}-content`;

  // localization keys
  const Global = useTranslations('Global');

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

  // Truncate the text up to the max length (i.e., specified summaryCharLimit)
  const truncateText = (text: string, maxLength: number): { truncated: string; wasTruncated: boolean } => {

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;

    // Add ellipsis to summary or truncated text
    return { truncated: finalText + '...', wasTruncated: true };
  };

  // Truncate content assuming children is a valid React Element, like a <p> tag
  const { summaryElements, wasTruncated } = useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    let charCount = 0;
    const limit = summaryCharLimit ?? Infinity; // If no character limit is specified, just show all the content
    const summary: React.ReactNode[] = [];
    let reachedLimit = false;

    for (const child of childrenArray) {
      // Skip if not a valid React element
      const allowedTags = ['p', 'div', 'span'];
      if (!React.isValidElement(child) || !allowedTags.includes(child.type as string)) continue;

      const textContent = getTextContent(child);
      const remaining = limit - charCount; // How much of the summaryCharLimit is remaining

      if (reachedLimit) break;

      // If the textContent length is still under the specified summaryCharLimit, 
      // then add text to summary and update the character count
      if (textContent.length <= remaining) {
        summary.push(child);
        charCount += textContent.length;
      } else {
        // Otherwise we need to truncate the node, such as a paragraph
        const { truncated } = truncateText(textContent, remaining);
        const truncatedElement = React.cloneElement(
          child as React.ReactElement<{ children?: React.ReactNode }>,
          { children: truncated }
        );

        // Set summary content to the truncated element
        summary.push(truncatedElement);
        charCount += remaining;
        reachedLimit = true;
      }
    }

    return {
      summaryElements: summary,
      wasTruncated: reachedLimit || summary.length < childrenArray.length,
    };
  }, [children, summaryCharLimit]);


  return (
    <section className={styles.section}>
      {heading && (
        <h3 id={`${id}-heading`} className="h5">{heading}</h3>
      )}
      {/**Don't show the summaryElements if the content is expanded */}
      <div className={styles.summaryContent} id={contentId}>
        {isExpanded || !wasTruncated ? children : summaryElements}
      </div>

      {wasTruncated && (
        <p>
          <a
            href={`#${contentId}`}
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            className={isExpanded ? styles.collapseLink : styles.expandLink}
          >
            {isExpanded
              ? collapseLabel || Global('links.collapse')
              : expandLabel || Global('links.expand')}
          </a>
          <span aria-live="polite" className="hidden-accessibly">
            {isExpanded
              ? Global('messaging.sectionIsExpanded')
              : Global('messaging.sectionIsCollapsed')}
          </span>
        </p>
      )}
    </section>

  );
}