'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean | null;
  hasNextPage: boolean | null;
  fetchTemplates: (page: number) => Promise<void>
}

export default function Pagination({ currentPage, totalPages, hasPreviousPage, hasNextPage, fetchTemplates }: PaginationProps) {
  return (
    <div>
      <button onClick={() => fetchTemplates(currentPage - 1)} disabled={!hasPreviousPage}>
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            data-page={page}
            data-current={currentPage}
            onClick={() => fetchTemplates(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        );
      })}

      <button onClick={() => fetchTemplates(currentPage + 1)} disabled={!hasNextPage}>
        Next
      </button>
    </div>
  );
}