import styles from "./RelatedWorksList.module.scss";
import RelatedWorksListItem from "@/components/RelatedWorksListItem";
import Pagination from "@/components/Pagination";
import LinkFilter from "@/components/LinkFilter";
import React, {useCallback, useMemo, useState} from "react";
import {Switch,} from "react-aria-components";
import {useToast} from "@/context/ToastContext";
import {useTranslations} from "next-intl";
import {useQuery} from '@apollo/client/react';
import {
  RelatedWorkConfidence,
  RelatedWorksDocument,
  RelatedWorkSearchResult,
  RelatedWorksIdentifierType,
  RelatedWorkStatus,
  WorkType,
} from "@/generated/graphql";
import {updateRelatedWorkStatusAction} from "@/app/actions";
import {
  ProjectPlanSelect,
  RelatedWorksSelect
} from "@/components/RelatedWorksSelect";

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
  identifierType: RelatedWorksIdentifierType;
  identifier: number;
  status: RelatedWorkStatus;
  defaultConfidence?: ConfidenceOptions;
  defaultType?: WorkType | null;
  defaultHighlightMatches?: boolean;
  defaultPage?: number;
}

export const RelatedWorksList = ({
  identifierType,
  identifier,
  status,
  defaultConfidence = ConfidenceOptions.All,
  defaultType = null,
  defaultHighlightMatches = false,
  defaultPage = 1,
}: RelatedWorksListProps) => {
  const t = useTranslations("RelatedWorksList");
  const dataTypes = useTranslations("RelatedWorksDataTypes");

  // UI State
  const [confidence, setConfidence] = useState<string>(defaultConfidence);
  const [workType, setWorkType] = useState<string | null>(defaultType);
  const [highlightMatches, setHighlightMatches] = useState<boolean>(defaultHighlightMatches);
  const [currentPage, setCurrentPage] = useState<number>(defaultPage);
  const [sortBy, setSortBy] = useState<string | null>(getDefaultSortBy(status));
  const [planId, setPlanId] = useState<number | null>(null);

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
  } = useQuery(RelatedWorksDocument, {
    variables: {
      id: identifier,
      idType: identifierType,
      filterOptions: {
        planId,
        status,
        workType: apiWorkType,
        confidence: apiConfidence,
      },
      paginationOptions: {
        offset: (currentPage - 1) * LIMIT,
        limit: LIMIT,
        type: "OFFSET",
        sortField,
        sortDir,
      },
    },
    fetchPolicy: "cache-and-network", // required so that results in different tabs update when status of a related work is updated
  });

  // Use previous data when loading new data, stops flickering results
  const relatedWorksData = data?.relatedWorks || previousData?.relatedWorks;

  // Remaining pagination variables
  const statusOnlyCount = relatedWorksData?.statusOnlyCount ?? 0;
  const totalCount = relatedWorksData?.totalCount ?? 0;
  const totalPages = Math.ceil((relatedWorksData?.totalCount ?? 0) / LIMIT);
  const hasPreviousPage = relatedWorksData?.hasPreviousPage ?? null;
  const hasNextPage = relatedWorksData?.hasNextPage ?? null;
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
    [toastState],
  );

  // Confidence items
  const confidenceCounts = new Map(
    relatedWorksData?.confidenceCounts?.map((item) => [item.typeId, item.count]),
  );
  const confidenceItems = Object.values(ConfidenceOptions).map((key: string) => ({
    id: key,
    label: dataTypes(`confidence.${key}`),
    count: key === ConfidenceOptions.All ? undefined : (confidenceCounts.get(key) ?? 0),
  }));

  // Work type items
  const typeItems =
    relatedWorksData?.workTypeCounts
      ?.map((item) => ({ id: item.typeId, label: `${dataTypes(`workType.${item.typeId}`)} (${item.count ?? 0})` }))
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

        {
          identifierType === RelatedWorksIdentifierType.ProjectId && (
            <div className={styles.filter}>
              <span className={styles.filterLabel}>{t("filters.planId")}</span>
              <div className={styles.spacer}>
                <ProjectPlanSelect projectId={identifier} selectedKey={planId} setSelectedKey={setPlanId} />
              </div>
            </div>
          )
        }

        <div className={styles.filter}>
          <span className={styles.filterLabel}>{t("filters.filterByType")}</span>
          <div className={styles.spacer}>
            <RelatedWorksSelect<string>
              placeholder={t("filters.filterByTypePlaceholder")}
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
            <RelatedWorksSelect<string>
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
        {relatedWorksData?.items?.map((relatedWork) => (
          <RelatedWorksListItem
            identifierType={identifierType}
            key={relatedWork?.id}
            relatedWork={relatedWork as RelatedWorkSearchResult}
            highlightMatches={highlightMatches}
            updateRelatedWorkStatus={updateRelatedWorkStatus}
          />
        ))}

        {!relatedWorksDataLoading && statusOnlyCount == 0 && totalCount == 0 && (
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

const getDefaultSortBy = (status: RelatedWorkStatus): SortByOptions => {
  if (status === RelatedWorkStatus.Pending) {
    return SortByOptions.ConfidenceHigh;
  } else if (status === RelatedWorkStatus.Accepted) {
    return SortByOptions.PublishedNew;
  } else if (status === RelatedWorkStatus.Rejected) {
    return SortByOptions.ReviewedNew;
  }

  return SortByOptions.ConfidenceHigh;
};
