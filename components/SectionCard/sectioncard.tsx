import './sectioncard.scss';
import React, {ReactNode} from 'react';

// Main SectionCard component
interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
                                            children,
                                            className = '',
                                            ...rest
                                          }) => (
  <div className={`section-card ${className}`} {...rest}>
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
  <div className={`section-card-eyebrow ${className}`} {...rest}>
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
  <h3 className={`section-card-heading ${className}`} {...rest}>
    {children}
  </h3>
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
  <div className={`section-card-body ${className}`} {...rest}>
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
  <div className={`section-card-text-muted ${className}`} {...rest}>
    {children}
  </div>
);

// Footer component
interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const SectionCardControls: React.FC<FooterProps> = ({
                                                    children,
                                                    className = '',
                                                    ...rest
                                                  }) => (
  <div className={`section-card-controls ${className}`} {...rest}>
    {children}
  </div>
);
