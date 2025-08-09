'use client';
import React from 'react';
import { useTranslations } from 'next-intl';


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean | null;
  hasNextPage: boolean | null;
  handlePageClick: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, hasPreviousPage, hasNextPage, handlePageClick }: PaginationProps) {
  // Localization keys
  const Global = useTranslations('Global');
  return (
    <nav aria-label="pagination" id="pagination">
      <button onClick={async () => handlePageClick(currentPage - 1)} disabled={!hasPreviousPage}>
        {Global('links.prev')}
      </button>

      {
        [...Array(totalPages)].map((_, index: number) => {
          const page = index + 1;
          return (
            <button
              key={page}
              data-page={page}
              data-current={currentPage}
              onClick={async () => handlePageClick(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          );
        })
      }

      <button onClick={async () => handlePageClick(currentPage + 1)} disabled={!hasNextPage}>
        {Global('links.next')}
      </button>
    </nav>
  );
}