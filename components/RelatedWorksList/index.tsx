import styles from "./RelatedWorksList.module.scss";
import RelatedWorksListItem from "@/components/RelatedWorksListItem";
import Pagination from "@/components/Pagination";
import LinkFilter from "@/components/LinkFilter";
import React, { useCallback, useMemo, useState } from "react";
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
import { useToast } from "@/context/ToastContext";
import { useTranslations } from "next-intl";
import {
  RelatedWorkConfidence,
  RelatedWorkSearchResult,
  RelatedWorkStatus,
  useRelatedWorksByPlanQuery,
  WorkType,
} from "@/generated/graphql";
import { updateRelatedWorkStatusAction } from "@/app/[locale]/projects/[projectId]/dmp/[dmpid]/related-works/actions";

const LIMIT = 20;
const FADEOUT_TIMEOUT = 550;

export enum ConfidenceOptions {
  All = "ALL",
  High = "HIGH",
  Medium = "MEDIUM",
  Low = "LOW",
}

export enum SortByOptions {
  ConfidenceHigh = "ConfidenceHigh",
  ConfidenceLow = "ConfidenceLow",
  ReviewedNew = "ReviewedNew",
  ReviewedOld = "ReviewedOld",
  PublishedNew = "PublishedNew",
  PublishedOld = "PublishedOld",
  DateFoundNew = "DateFoundNew",
  DateFoundOld = "DateFoundOld",
}

export enum RelatedWorksSortBy {
  ScoreNorm = "scoreNorm",
  Modified = "modified",
  PublicationDate = "publicationDate",
  Created = "created",
}

export enum RelatedWorksSortDir {
  Ascending = "ASC",
  Descending = "DESC",
}

const SORT_MAP = new Map<SortByOptions | string | null, [RelatedWorksSortBy, RelatedWorksSortDir]>([
  [SortByOptions.ConfidenceHigh, [RelatedWorksSortBy.ScoreNorm, RelatedWorksSortDir.Descending]],
  [SortByOptions.ConfidenceLow, [RelatedWorksSortBy.ScoreNorm, RelatedWorksSortDir.Ascending]],
  [SortByOptions.ReviewedNew, [RelatedWorksSortBy.Modified, RelatedWorksSortDir.Descending]],
  [SortByOptions.ReviewedOld, [RelatedWorksSortBy.Modified, RelatedWorksSortDir.Ascending]],
  [SortByOptions.PublishedNew, [RelatedWorksSortBy.PublicationDate, RelatedWorksSortDir.Descending]],
  [SortByOptions.PublishedOld, [RelatedWorksSortBy.PublicationDate, RelatedWorksSortDir.Ascending]],
  [SortByOptions.DateFoundNew, [RelatedWorksSortBy.Created, RelatedWorksSortDir.Descending]],
  [SortByOptions.DateFoundOld, [RelatedWorksSortBy.Created, RelatedWorksSortDir.Ascending]],
]);

interface RelatedWorksListProps {
  planId: number;
  status: RelatedWorkStatus;
  defaultConfidence?: ConfidenceOptions;
  defaultType?: WorkType | null;
  defaultHighlightMatches?: boolean;
  defaultPage?: number;
  defaultSortBy?: SortByOptions;
}

export const RelatedWorksList = ({
  planId,
  status,
  defaultConfidence = ConfidenceOptions.All,
  defaultType = null,
  defaultHighlightMatches = false,
  defaultPage = 1,
  defaultSortBy = SortByOptions.ConfidenceHigh,
}: RelatedWorksListProps) => {
  const t = useTranslations("RelatedWorksList");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  // UI State
  const [confidence, setConfidence] = useState<string>(defaultConfidence);
  const [workType, setWorkType] = useState<string | null>(defaultType);
  const [highlightMatches, setHighlightMatches] = useState<boolean>(defaultHighlightMatches);
  const [currentPage, setCurrentPage] = useState<number>(defaultPage);
  const [sortBy, setSortBy] = useState<string | null>(defaultSortBy);

  // Derived API values
  const apiConfidence = useMemo(() => {
    return confidence === ConfidenceOptions.All ? undefined : (confidence.toUpperCase() as RelatedWorkConfidence);
  }, [confidence]);
  const [sortField, sortDir] = useMemo(() => {
    const sortConfig = SORT_MAP.get(sortBy);
    if (sortConfig != null) {
      return sortConfig;
    }
    return [undefined, undefined];
  }, [sortBy]);
  const apiWorkType = useMemo(() => {
    return workType == null ? undefined : (workType as WorkType);
  }, [workType]);

  // Query data
  const {
    data,
    previousData,
    loading: relatedWorksDataLoading,
    refetch: relatedWorksRefetch,
  } = useRelatedWorksByPlanQuery({
    variables: {
      planId,
      filterOptions: {
        status,
        workType: apiWorkType,
        confidence: apiConfidence,
      },
      paginationOptions: {
        offset: currentPage,
        limit: LIMIT,
        type: "OFFSET",
        sortField,
        sortDir,
      },
    },
    fetchPolicy: "cache-and-network", // required so that results in different tabs update when status of a related work is updated
  });

  // Use previous data when loading new data, stops flickering results
  const relatedWorksData = data || previousData;

  // Remaining pagination variables
  const statusOnlyCount = relatedWorksData?.relatedWorksByPlan?.statusOnlyCount ?? 0;
  const totalCount = relatedWorksData?.relatedWorksByPlan?.totalCount ?? 0;
  const totalPages = Math.ceil((relatedWorksData?.relatedWorksByPlan?.totalCount ?? 0) / LIMIT);
  const hasPreviousPage = relatedWorksData?.relatedWorksByPlan?.hasPreviousPage ?? null;
  const hasNextPage = relatedWorksData?.relatedWorksByPlan?.hasNextPage ?? null;
  const handlePageClick = async (page: number) => {
    setCurrentPage(page);
  };

  const toastState = useToast();
  const updateRelatedWorkStatus = useCallback(
    async (relatedWorkId: number, status: RelatedWorkStatus) => {
      // Update related works status and wait at least FADEOUT_TIMEOUT
      // until updating UI so that the fadeout can complete
      const updatePromise = updateRelatedWorkStatusAction({
        id: relatedWorkId,
        status,
      });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, FADEOUT_TIMEOUT));
      const [response] = await Promise.all([updatePromise, delayPromise]);

      if (response.success) {
        // Refreshes the related works query in this component
        await relatedWorksRefetch();
      } else {
        toastState.add(`Error updating related work. ${response?.errors?.join(", ")}`, { type: "error" });
      }
    },
    [toastState, FADEOUT_TIMEOUT],
  );

  // Confidence items
  const confidenceCounts = new Map(relatedWorksData?.relatedWorksByPlan?.confidenceCounts?.map(item => [item.typeId, item.count]));
  const confidenceItems = Object.values(ConfidenceOptions).map((key: string) => ({
    id: key,
    label: dataTypes(`confidence.${key}`),
    count: key === ConfidenceOptions.All? undefined: confidenceCounts.get(key) ?? 0,
  }));

  // Work type items
  const typeItems = relatedWorksData?.relatedWorksByPlan?.workTypeCounts
    ?.map((item) => ({ id: item.typeId, label: `${dataTypes(`workType.${item.typeId}`)} (${item.count ?? 0})`}))
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())) ?? [];

  const sortItems = Object.values(SortByOptions)
    .map((id) => ({ id, label: t(`filters.sortBy.${id}`) }))
    .filter((item) => {
      const pendingReviewed =
        [RelatedWorkStatus.Pending].includes(status) &&
        [SortByOptions.ReviewedNew, SortByOptions.ReviewedOld].includes(item.id);
      const relatedDiscardedDateFound =
        [RelatedWorkStatus.Accepted, RelatedWorkStatus.Rejected].includes(status) &&
        [SortByOptions.DateFoundNew, SortByOptions.DateFoundOld].includes(item.id);
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
              selectedKey={workType}
              setSelectedKey={setWorkType}
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
        {relatedWorksData?.relatedWorksByPlan?.items?.map((relatedWork) => (
          <RelatedWorksListItem
            key={relatedWork?.workVersion?.work?.doi}
            relatedWork={relatedWork as RelatedWorkSearchResult}
            highlightMatches={highlightMatches}
            updateRelatedWorkStatus={updateRelatedWorkStatus}
          />
        ))}

        {!relatedWorksDataLoading && statusOnlyCount == 0 && (
          <div className={styles.noResults}>{t("messages." + status + ".noResults")}</div>
        )}
        {!relatedWorksDataLoading && statusOnlyCount > 0 && totalCount == 0 && (
          <div className={styles.noResults}>{t("messages." + status + ".noFilteredResults")}</div>
        )}
      </div>
      <div className={styles.footer}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          handlePageClick={handlePageClick}
        />
      </div>
    </div>
  );
};

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
