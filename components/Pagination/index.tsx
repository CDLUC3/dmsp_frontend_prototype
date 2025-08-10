'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Button, Link } from "react-aria-components";
import styles from './pagination.module.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean | null;
  hasNextPage: boolean | null;
  handlePageClick: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  handlePageClick
}: PaginationProps) {
  const Global = useTranslations('Global');

  const getPages = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // pages around the current page

    // Always show first page
    pages.push(1);

    // Show leading ellipsis if needed
    if (currentPage - delta > 2) {
      pages.push('ellipsis-start');
    }

    // Pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i);
    }

    // Show trailing ellipsis if needed
    if (currentPage + delta < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always show last page if not already shown
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pagesToRender = getPages();

  return (
    <nav aria-label="pagination" className={styles.pagination}>
      <Button
        aria-label={Global('labels.previousPage')}
        onClick={() => handlePageClick(currentPage - 1)}
        isDisabled={!hasPreviousPage}
      >
        {Global('links.prev')}
      </Button>

      <ol>
        {pagesToRender.map((page, index) => (
          page === 'ellipsis-start' || page === 'ellipsis-end' ? (
            <li key={page + index} aria-hidden="true" className={styles.ellipsis}>
              &hellip;
            </li>
          ) : (
            <li aria-setsize={totalPages} aria-posinset={Number(page)} key={page}>
              <Link
                className={(page === currentPage) ? styles.current : ""}
                href="#"
                aria-label={`Page ${page}`}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(Number(page));
                }}
              >
                {page}
              </Link>
            </li>
          )
        ))}
      </ol>

      <Button
        aria-label={Global('labels.nextPage')}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          handlePageClick(currentPage + 1)
        }
        }
        isDisabled={!hasNextPage}
      >
        {Global('links.next')}
      </Button>
    </nav>
  );
}
