import './sectioncard.scss.scss';
import React, { ReactNode } from 'react';

// Main SectionCard component
interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Sectionard: React.FC<SectionCardProps> = ({
                                            children,
                                            className = '',
                                            ...rest
                                          }) => (
  <div className={`card ${className}`} {...rest}>
    {children}
  </div>
);

// Eyebrow component
interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCardEyebrow: React.FC<EyebrowProps> = ({
                                                      children,
                                                      className = '',
                                                      ...rest
                                                    }) => (
  <div className={`card-eyebrow ${className}`} {...rest}>
    {children}
  </div>
);

// Heading component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCardHeading: React.FC<HeadingProps> = ({
                                                      children,
                                                      className = '',
                                                      ...rest
                                                    }) => (
  <h2 className={`card-heading ${className}`} {...rest}>
    {children}
  </h2>
);

// Body component
interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCardBody: React.FC<BodyProps> = ({
                                                children,
                                                className = '',
                                                ...rest
                                              }) => (
  <div className={`card-body ${className}`} {...rest}>
    {children}
  </div>
);

// MutedText component
interface MutedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCardMutedText: React.FC<MutedTextProps> = ({
                                                          children,
                                                          className = '',
                                                          ...rest
                                                        }) => (
  <div className={`card-text-muted ${className}`} {...rest}>
    {children}
  </div>
);

// Footer component
interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCardFooter: React.FC<FooterProps> = ({
                                                    children,
                                                    className = '',
                                                    ...rest
                                                  }) => (
  <div className={`card-footer ${className}`} {...rest}>
    {children}
  </div>
);
