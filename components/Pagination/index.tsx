'use client';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean | null;
  hasNextPage: boolean | null;
  handlePageClick: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, hasPreviousPage, hasNextPage, handlePageClick }: PaginationProps) {
  return (
    <div>
      <button onClick={async () => handlePageClick(currentPage - 1)} disabled={!hasPreviousPage}>
        Prev
      </button>

      {
        [...Array(totalPages)].map((_, index) => {
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
        Next
      </button>
    </div >
  );
}