"use client";

import React from "react";
import DOMPurify from "dompurify";

export type SafeHtmlProps = {
  html: string | null | undefined;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // wrapper element for HTML content (when HTML tags exist)
  wrapPlainText?: boolean; // wrap plain strings (no tags) in a block element
  plainTextWrapper?: keyof JSX.IntrinsicElements; // which element to wrap plain text with
};

/**
 * SafeHtml
 * Renders sanitized HTML. If the string contains no HTML tags and wrapPlainText is true,
 * it wraps the content in a plainTextWrapper (defaults to <p>).</n*>
 * Note: This is a client component because it uses DOMPurify.
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({
  html,
  className,
  as = "div",
  wrapPlainText = true,
  plainTextWrapper = "p",
}) => {
  if (!html) return null;

  const sanitized = DOMPurify.sanitize(html);
  if (!sanitized || sanitized.trim() === "") return null;

  const containsTag = /<[^>]+>/i.test(sanitized);

  if (!containsTag && wrapPlainText) {
    const PlainWrapper = (plainTextWrapper || "p") as keyof JSX.IntrinsicElements;
    // Using React.createElement to keep typing simple for dynamic tag
    return React.createElement(PlainWrapper, { className }, sanitized);
  }

  const Wrapper = (as || "div") as keyof JSX.IntrinsicElements;
  // Using React.createElement to support dynamic wrapper element
  return React.createElement(Wrapper, {
    className,
    dangerouslySetInnerHTML: { __html: sanitized },
  });
};

export default SafeHtml;
