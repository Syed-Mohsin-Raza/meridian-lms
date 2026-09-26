"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getVisiblePages } from "@/lib/hooks/use-pagination";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  // If there's nothing to paginate, don't render
  if (totalElements === 0) return null;

  const firstItemIndex = currentPage * pageSize + 1;
  const lastItemIndex = Math.min((currentPage + 1) * pageSize, totalElements);
  const pages = getVisiblePages(currentPage, totalPages);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-4 py-4 sm:flex-row",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{firstItemIndex}</span> to{" "}
        <span className="font-medium">{lastItemIndex}</span> of{" "}
        <span className="font-medium">{totalElements}</span> results
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Page <span className="font-medium">{currentPage + 1}</span> of{" "}
          <span className="font-medium">{totalPages || 1}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(0)}
            disabled={isFirstPage}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={isFirstPage}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="hidden items-center gap-1 sm:flex">
            {pages.map((page, idx) => {
              if (page === null) {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isCurrent ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page)}
                  aria-label={`Go to page ${page + 1}`}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {page + 1}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={isLastPage}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={isLastPage}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
