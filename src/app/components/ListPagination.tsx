import { Fragment } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  totalItems?: number;
}

export function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20],
  totalItems,
}: ListPaginationProps) {
  const canSelectItemsPerPage = itemsPerPage !== undefined && onItemsPerPageChange !== undefined;

  if (totalPages <= 1 && !canSelectItemsPerPage) {
    return null;
  }

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  const firstVisibleItem = itemsPerPage && totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const lastVisibleItem = itemsPerPage && totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : 0;

  return (
    <nav aria-label="Paginacja" className="mt-6 flex flex-wrap items-center justify-between gap-4">
      {canSelectItemsPerPage && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <label className="flex items-center gap-2">
            Na stronie:
            <select
              value={itemsPerPage}
              onChange={(event) => {
                onItemsPerPageChange(Number(event.target.value));
                onPageChange(1);
              }}
              className="rounded-lg border border-border bg-white px-3 py-2 text-foreground"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          {totalItems !== undefined && totalItems > 0 && (
            <span>Wyświetlono {firstVisibleItem}-{lastVisibleItem} z {totalItems}</span>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Poprzednia strona"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {visiblePages.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && page - visiblePages[index - 1] > 1 && (
                <span className="px-1 text-muted-foreground" aria-hidden="true">...</span>
              )}
              <button
                type="button"
                aria-label={`Strona ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => onPageChange(page)}
                className={`h-10 w-10 rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'border border-border hover:bg-secondary'
                }`}
              >
                {page}
              </button>
            </Fragment>
          ))}

          <button
            type="button"
            aria-label="Następna strona"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-border p-2 transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </nav>
  );
}
