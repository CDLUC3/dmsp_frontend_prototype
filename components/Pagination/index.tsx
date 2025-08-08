'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean | null;
  hasNextPage: boolean | null;
  bestPractice?: boolean;
  selectedOwnerURIs?: string[];
  fetchTemplates: (args: {
    page?: number;
    bestPractice?: boolean;
    selectedOwnerURIs?: string[]
  }) => Promise<void>;

}

export default function Pagination({ currentPage, totalPages, hasPreviousPage, hasNextPage, bestPractice, selectedOwnerURIs, fetchTemplates }: PaginationProps) {
  return (
    <div>
      <button onClick={async () => await fetchTemplates({ page: currentPage - 1, bestPractice, selectedOwnerURIs })} disabled={!hasPreviousPage}>
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            data-page={page}
            data-current={currentPage}
            onClick={async () => await fetchTemplates({ page, bestPractice, selectedOwnerURIs })}
            disabled={page === currentPage}
          >
            {page}
          </button>
        );
      })}

      <button onClick={async () => await fetchTemplates({ page: currentPage + 1 })} disabled={!hasNextPage}>
        Next
      </button>
    </div>
  );
}