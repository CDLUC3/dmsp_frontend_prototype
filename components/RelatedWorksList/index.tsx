import styles from "./RelatedWorksList.module.scss";
import RelatedWorksListItem from "@/components/RelatedWorksListItem";
import Pagination from "@/components/Pagination";
import LinkFilter from "@/components/LinkFilter";
import React, { useCallback } from "react";
import {
  Button,
  FieldError,
  ListBox,
  ListBoxItem,
  Popover,
  Select as ReactAriaSelect,
  SelectValue,
  Switch,
} from "react-aria-components";

import { Confidence, RelatedWorksSortBy, Status, WorkType } from "@/app/types";
import { useRelatedWorksListContext } from "@/providers/relatedWorksListProvider";
import { useRelatedWorksContext } from "@/providers/relatedWorksProvider";
import { useTranslations } from "next-intl";
import { scoreToConfidence } from "@/lib/relatedWorks";

interface RelatedWorksListProps {
  status: Status;
}

export const RelatedWorksList = ({ status }: RelatedWorksListProps) => {
  const t = useTranslations("RelatedWorksList");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  // TODO: each list can probably be independent when hooked up the GraphQL API, so useRelatedWorksContext will
  // be unnecessary then.
  const { works, setWorks } = useRelatedWorksContext();
  const { confidence, setConfidence, type, setType, highlightMatches, setHighlightMatches, page, sortBy, setSortBy } =
    useRelatedWorksListContext();

  // TODO: these will call the GraphQL API
  const acceptWork = useCallback(
    (doi: string) => {
      setWorks((prev) =>
        prev.map((work) =>
          work.work.doi === doi ? { ...work, status: Status.Related, dateReviewed: new Date() } : work,
        ),
      );
    },
    [works],
  );
  const discardWork = useCallback(
    (doi: string) => {
      setWorks((prev) =>
        prev.map((work) =>
          work.work.doi === doi ? { ...work, status: Status.Discarded, dateReviewed: new Date() } : work,
        ),
      );
    },
    [works],
  );

  // Status counts
  // TODO: these will be computed by the GraphQL API
  const statusInitialValue: { [key: string]: number } = {
    [Status.Pending]: 0,
    [Status.Related]: 0,
    [Status.Discarded]: 0,
  };
  const statusCounts = works.reduce((acc, work) => {
    acc[work.status] += 1;
    return acc;
  }, statusInitialValue);

  // Confidence items
  // TODO: these will be computed by the GraphQL API
  const confidenceInitialValue: { [key: string]: number } = {
    [Confidence.High]: 0,
    [Confidence.Medium]: 0,
    [Confidence.Low]: 0,
  };
  const confidenceCounts = works
    .filter((work) => work.status === status)
    .reduce((acc, work) => {
      acc[scoreToConfidence(work.score)] += 1;
      return acc;
    }, confidenceInitialValue);
  const confidenceItems = Object.values(Confidence).map((key: string) => ({
    id: key,
    label: dataTypes(`confidence.${key}`),
    count: confidenceCounts[key] ?? undefined,
  }));

  // Work type items
  // Filter based on available work types
  // TODO: available work types needs to be supplied by GraphQL query
  const typeCounts = new Map<string, number>(works.map((work) => [work.work.type, 0]));
  works.forEach((work) => {
    if (work.status === status) {
      const type = work.work.type as string;
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }
  });
  const workTypeSet = new Set(typeCounts.keys());
  const typeItems = Object.values(WorkType)
    .filter((key: string) => workTypeSet.has(key))
    .map((key: string) => ({ id: key, label: `${dataTypes(`workType.${key}`)} (${typeCounts.get(key)})` }));

  // Filter and sort works
  // TODO: this will be done with GraphQL
  const sortFieldMap: { [key: string]: { field: string; direction: number } } = {
    [RelatedWorksSortBy.ConfidenceHigh]: { field: "score", direction: 1 },
    [RelatedWorksSortBy.ConfidenceLow]: { field: "score", direction: -1 },
    [RelatedWorksSortBy.ReviewedNew]: { field: "dateReviewed", direction: 1 },
    [RelatedWorksSortBy.ReviewedOld]: { field: "dateReviewed", direction: -1 },
    [RelatedWorksSortBy.PublishedNew]: { field: "work.publicationDate", direction: 1 },
    [RelatedWorksSortBy.PublishedOld]: { field: "work.publicationDate", direction: -1 },
    [RelatedWorksSortBy.DateFoundNew]: { field: "dateFound", direction: 1 },
    [RelatedWorksSortBy.DateFoundOld]: { field: "dateFound", direction: -1 },
  };
  const filteredWorks = works.filter((work) => {
    const confidenceInclude = confidence === Confidence.All || confidence === scoreToConfidence(work.score);
    const typeInclude = type === null || type === work.work.type;
    const statusInclude = work.status === status;
    return confidenceInclude && typeInclude && statusInclude;
  });
  filteredWorks.sort((a, b) => {
    const { field, direction } = sortFieldMap[sortBy as string];
    if (get(a, field) > get(b, field)) {
      return -1 * direction;
    } else if (get(a, field) < get(b, field)) {
      return direction;
    }
    return 0;
  });

  const sortItems = Object.values(RelatedWorksSortBy)
    .map((id) => ({ id, label: t(`filters.sortBy.${id}`) }))
    .filter((item) => {
      const pendingReviewed =
        [Status.Pending].includes(status) &&
        [RelatedWorksSortBy.ReviewedNew, RelatedWorksSortBy.ReviewedOld].includes(item.id);
      const relatedDiscardedDateFound =
        [Status.Related, Status.Discarded].includes(status) &&
        [RelatedWorksSortBy.DateFoundNew, RelatedWorksSortBy.DateFoundOld].includes(item.id);
      return !(pendingReviewed || relatedDiscardedDateFound);
    });

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.filter}>
          <span className={styles.filterLabel}>{t("filters.filterByConfidence")}</span>
          <div className={styles.spacer}>
            <LinkFilter
              aria-label={t("filters.filterByConfidence")}
              selected={confidence}
              setSelected={setConfidence}
              items={confidenceItems}
            />
          </div>
        </div>

        <div className={styles.filter}>
          <span className={styles.filterLabel}>{t("filters.filterByType")}</span>
          <div className={styles.spacer}>
            <Select
              placeholder={t("filters.filterByType")}
              selectedKey={type}
              setSelectedKey={setType}
              items={typeItems}
              containerClassName={styles.filterByType}
              includeEmptyValue
            />
          </div>
        </div>

        <div className={styles.filter}>
          <span className={styles.filterLabel}>Sort by</span>
          <div className={styles.spacer}>
            <Select
              placeholder={t("filters.sort")}
              selectedKey={sortBy}
              setSelectedKey={setSortBy}
              items={sortItems}
              containerClassName={styles.sortBy}
            />
          </div>
        </div>

        <div className={styles.filter}>
          <span className={styles.filterLabel}>{t("filters.highlightMatches")}</span>
          <div className={styles.spacer}>
            <Switch
              aria-label={t("filters.highlightMatches")}
              style={{ marginBottom: 0 }}
              isSelected={highlightMatches}
              onChange={setHighlightMatches}
            >
              <div className="indicator" />
            </Switch>
          </div>
        </div>
      </div>

      <div
        className={styles.list}
        data-testid="related-works-list"
        role="list"
      >
        {filteredWorks.map((work) => (
          <RelatedWorksListItem
            key={work.work.doi}
            item={work}
            highlightMatches={highlightMatches}
            acceptWork={acceptWork}
            discardWork={discardWork}
          />
        ))}
        {status == Status.Pending && statusCounts[Status.Pending] == 0 && (
          <div className={styles.noResults}>{t("messages.noPendingResults")}</div>
        )}
        {status == Status.Pending && statusCounts[Status.Pending] > 0 && filteredWorks.length == 0 && (
          <div className={styles.noResults}>{t("messages.noPendingFilteredResults")}</div>
        )}
        {status == Status.Related && statusCounts[Status.Related] == 0 && (
          <div className={styles.noResults}>{t("messages.noRelatedResults")}</div>
        )}
        {status == Status.Related && statusCounts[Status.Related] > 0 && filteredWorks.length == 0 && (
          <div className={styles.noResults}>{t("messages.noRelatedFilteredResults")}</div>
        )}
        {status == Status.Discarded && statusCounts[Status.Discarded] == 0 && (
          <div className={styles.noResults}>{t("messages.noDiscardedResults")}</div>
        )}
        {status == Status.Discarded && statusCounts[Status.Discarded] > 0 && filteredWorks.length == 0 && (
          <div className={styles.noResults}>{t("messages.noDiscardedFilteredResults")}</div>
        )}
      </div>
      <div className={styles.footer}>
        <Pagination
          currentPage={page}
          totalPages={1}
          hasPreviousPage={false}
          hasNextPage={false}
          handlePageClick={() => { }}
        />
      </div>
    </div>
  );
};

// TODO delete this function after integration with GraphQL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(obj: any, path: string, defaultValue?: any) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? defaultValue;
}

// TODO: should some of this functionality be combined with Form/FormSelect?
interface SelectProps {
  label?: string;
  placeholder: string;
  selectedKey: string | null;
  setSelectedKey: (selectedKey: string | null) => void;
  items: { id: string; label: string }[];
  containerClassName?: string;
  includeEmptyValue?: boolean;
}

const Select = ({
  label,
  placeholder,
  selectedKey,
  setSelectedKey,
  items,
  containerClassName,
  includeEmptyValue = false,
}: SelectProps) => {
  return (
    <div className={containerClassName}>
      <ReactAriaSelect
        aria-label={placeholder}
        placeholder={placeholder}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          setSelectedKey(key !== "" ? (key as string) : null);
        }}
      >
        {label != null && <span>{placeholder}</span>}
        <Button
          type="button"
          className="react-aria-Button selectButton"
        >
          <SelectValue />
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover>
          <ListBox>
            {includeEmptyValue && (
              <ListBoxItem
                id=""
                style={{ fontStyle: "italic" }}
              >
                {placeholder}
              </ListBoxItem>
            )}

            {items.map((item) => (
              <ListBoxItem
                key={item.id}
                id={item.id}
              >
                {item.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
        <FieldError />
      </ReactAriaSelect>
    </div>
  );
};
