import { useState } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";

import {
  FieldError,
  Label,
  Select,
  SelectValue,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  Text,
  Key,
  ValidationResult
} from "react-aria-components";
import { DmpIcon } from "@/components/Icons";
import styles from "./tooltipSelect.module.scss";

// Option type for the select items
export interface TooltipSelectOption {
  id: string;
  label: string;
  tooltip?: string;
  badge?: {
    label: string;
    bg: string;
    color: string;
  };
  sub?: string;
}

// Props type for TooltipSelect
export interface TooltipSelectProps {
  label?: string;
  ariaLabel?: string;
  options?: TooltipSelectOption[];
  placeholder?: string;
  description?: string;
  onSelectionChange?: (key: Key | null) => void;
  name?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  helpMessage?: string;
  isRequired?: boolean;
  isRequiredVisualOnly?: boolean;
  defaultSelectedKey?: string;
}

const dummyElement = typeof document !== "undefined"
  ? document.createElement("div")
  : null;

const getPortalTarget = (): HTMLElement => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    // In SSR, return a dummy element or null (if even document is not available)
    return dummyElement as HTMLElement;
  }
  return (
    (document.querySelector('body > div[style*="display: contents"]') as HTMLElement) ??
    document.body
  );
};

export default function TooltipSelect({
  label,
  ariaLabel,
  options = [],
  placeholder = "Select an option",
  description,
  onSelectionChange,
  name,
  errorMessage,
  helpMessage,
  isRequired = false,
  isRequiredVisualOnly = false,
  defaultSelectedKey,
}: TooltipSelectProps) {
  const showRequired = isRequired || isRequiredVisualOnly;
  const t = useTranslations('Global.labels');
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    transform: string;
  } | null>(null);

  // Helper to calculate tooltip position
  const calcTooltipPos = (rect: DOMRect) => {
    const tooltipWidth = 220;
    const tooltipHeight = 100;
    const spaceOnRight = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceOnRight >= tooltipWidth + 10) {
      return { top: rect.top + rect.height / 2, left: rect.right + 10, transform: "translateY(-50%)" };
    } else if (spaceBelow >= tooltipHeight + 8) {
      return { top: rect.bottom + 8, left: Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2), transform: "none" };
    } else {
      return { top: rect.top - tooltipHeight - 8, left: Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2), transform: "none" };
    }
  };

  return (
    <Select
      isOpen={isSelectOpen}
      onOpenChange={(open) => {
        // If a tooltip is active, don't let React Aria close the SELECT
        if (!open && activeTooltip) return;
        setIsSelectOpen(open);
      }}
      aria-label={ariaLabel}
      name={name}
      isInvalid={!!errorMessage}
      data-invalid={errorMessage}
      aria-required={isRequired}
      defaultSelectedKey={defaultSelectedKey}
      onChange={onSelectionChange}
    >
      {(state) => (
        <>
          <Label>
            {label}{showRequired && <span className="is-required" aria-hidden="true"> ({t('required')})</span>}
          </Label>
          {description && (
            <Text slot="description" className="help">
              {description}</Text>
          )}
          <Button
            className="react-aria-Button selectButton"
            onPress={() => setIsSelectOpen(!isSelectOpen)}
          >
            <SelectValue>
              {({ selectedText, isPlaceholder }) => (
                isPlaceholder ? placeholder : selectedText
              )}
            </SelectValue>
            <span
              aria-hidden="true"
              style={{
                transform: state.isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <svg width="10" height="5" viewBox="0 0 10 5" fillRule="evenodd">
                <title>Open drop down</title>
                <path d="M10 0L5 5 0 0z"></path>
              </svg>
            </span>
          </Button>
          {errorMessage && <FieldError className='error-message'>{errorMessage}</FieldError>}
          {helpMessage && (
            <Text slot="description" className='help-text'>
              {helpMessage}
            </Text>
          )}
          <Popover>
            <ListBox items={options} className="react-aria-ListBox">
              {(option) => (
                <ListBoxItem id={option.id} textValue={option.label} className={`${styles.tsItem} react-aria-ListBoxItem`}>
                  {({ isSelected }) => (
                    <>
                      <div className={styles.tsItemBody}>
                        <span>{option.label}</span>
                        {option.sub && <span>{option.sub}</span>}
                      </div>

                      {option.badge && (
                        <span className={styles.tsBadge} style={{ background: option.badge.bg, color: option.badge.color }}>
                          {option.badge.label}
                        </span>
                      )}

                      {isSelected && <DmpIcon icon="check" />}
                      {/** Can't use React Aria Component's Tooltip inside a Popover, so we use a custom tooltip */}
                      {option.tooltip && (
                        <span
                          className={styles.tsInfoTrigger}
                          aria-label={`Info: ${option.label}`}
                          tabIndex={0}
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent ListBoxItem from selection on click
                            e.preventDefault();
                          }}
                          onPointerDown={(e) => {
                            // 👇 touch only — tap to toggle
                            if (e.pointerType === 'touch') {
                              e.stopPropagation();
                              e.preventDefault();
                              if (activeTooltip === option.id) {
                                setActiveTooltip(null);
                                setTooltipPos(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltipPos(calcTooltipPos(rect));
                                setActiveTooltip(option.id);
                              }
                            }
                          }}
                          onPointerEnter={(e) => {
                            e.stopPropagation();
                            if (e.pointerType !== 'mouse') return; // mouse only
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos(calcTooltipPos(rect));
                            setActiveTooltip(option.id);
                          }}
                          onPointerLeave={(e) => {
                            e.stopPropagation();
                            if (e.pointerType !== 'mouse') return; // mouse only
                            setActiveTooltip(null);
                            setTooltipPos(null);
                          }}
                          onFocus={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos(calcTooltipPos(rect));
                            setActiveTooltip(option.id);
                          }}
                          onBlur={() => { setActiveTooltip(null); setTooltipPos(null); }}
                          onKeyDown={e => { // For accessibility: allow keyboard users to toggle tooltip with Enter or Space
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (activeTooltip === option.id) {
                                setActiveTooltip(null);
                                setTooltipPos(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const tooltipWidth = 220;
                                const tooltipHeight = 100;
                                const spaceOnRight = window.innerWidth - rect.right;
                                const spaceBelow = window.innerHeight - rect.bottom;
                                if (spaceOnRight >= tooltipWidth + 10) {
                                  setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10, transform: "translateY(-50%)" });
                                } else if (spaceBelow >= tooltipHeight + 8) {
                                  setTooltipPos({ top: rect.bottom + 8, left: Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2), transform: "none" });
                                } else {
                                  setTooltipPos({ top: rect.top - tooltipHeight - 8, left: Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2), transform: "none" });
                                }
                                setActiveTooltip(option.id);
                              }
                            }
                          }}
                        >
                          <DmpIcon icon="info" fill="currentColor" />
                        </span>
                      )}
                    </>
                  )}
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
          {activeTooltip && tooltipPos && (() => {
            const option = options.find(o => o.id === activeTooltip);
            if (!option) return null;
            // Detect mobile (simple check)
            const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
            return createPortal(
              <div
                className={`${styles.tsTooltip}`}
                role="tooltip"
                style={{
                  position: "fixed",
                  top: tooltipPos.top,
                  left: tooltipPos.left,
                  transform: tooltipPos.transform,
                  pointerEvents: isMobile ? "auto" : "none",
                  zIndex: 100001,
                }}
              >
                <div className={styles.tsTooltipHeader}>
                  <p className={styles.tsTooltipTitle}>{option.label}</p>
                  <button
                    className={styles.tsTooltipClose}
                    aria-label="Close tooltip"

                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveTooltip(null);
                      setTooltipPos(null);
                    }}
                    tabIndex={0}
                  >
                    <DmpIcon icon="close" />
                  </button>
                </div>
                <p className={styles.tsTooltipBody}>{option.tooltip}</p>
                {option.badge && (
                  <span className={styles.tsBadge} style={{ background: option.badge.bg, color: option.badge.color }}>
                    {option.badge.label}
                  </span>
                )}
              </div>,
              getPortalTarget() // portal into React Aria's container, and not document.body, to avoid issues with React Aria's focus management and inert handling
            );
          })()}
        </>
      )}
    </Select>
  );
}