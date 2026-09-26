"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/constants";

interface UsePaginationOptions {
  defaultSize?: number;
  defaultSort?: string;
}

interface PaginationState {
  page: number;
  size: number;
  sort: string;
}

interface PaginationActions {
  setPage(page: number): void;
  setSize(size: number): void;
  setSort(sort: string): void;
  reset(): void;
}

/**
 * Pagination state synced to URL query params.
 *
 * Why URL sync: shareable links, survives refresh, works with browser
 * back/forward, and Next.js caches by URL for prefetching.
 */
export function usePagination(
  options: UsePaginationOptions = {}
): PaginationState & PaginationActions {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaultSize = options.defaultSize ?? DEFAULT_PAGE_SIZE;
  const defaultSort = options.defaultSort ?? "appliedAt,desc";

  const state = useMemo<PaginationState>(() => {
    const pageParam = searchParams.get("page");
    const sizeParam = searchParams.get("size");
    const sortParam = searchParams.get("sort");

    const page = pageParam ? Math.max(0, Number.parseInt(pageParam, 10)) : 0;
    const size = sizeParam ? Number.parseInt(sizeParam, 10) : defaultSize;
    const sort = sortParam ?? defaultSort;

    return {
      page: Number.isFinite(page) ? page : 0,
      size: PAGE_SIZE_OPTIONS.includes(
        size as (typeof PAGE_SIZE_OPTIONS)[number]
      )
        ? size
        : defaultSize,
      sort,
    };
  }, [searchParams, defaultSize, defaultSort]);

  const buildUrl = useCallback(
    (next: Partial<PaginationState>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.page !== undefined) {
        if (next.page === 0) params.delete("page");
        else params.set("page", String(next.page));
      }
      if (next.size !== undefined) {
        if (next.size === defaultSize) params.delete("size");
        else params.set("size", String(next.size));
      }
      if (next.sort !== undefined) {
        if (next.sort === defaultSort) params.delete("sort");
        else params.set("sort", next.sort);
      }

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [searchParams, pathname, defaultSize, defaultSort]
  );

  const setPage = useCallback(
    (page: number) => {
      router.push(buildUrl({ page }));
    },
    [router, buildUrl]
  );

  const setSize = useCallback(
    (size: number) => {
      // Reset to page 0 when size changes — otherwise you may be past the last page.
      router.push(buildUrl({ size, page: 0 }));
    },
    [router, buildUrl]
  );

  const setSort = useCallback(
    (sort: string) => {
      router.push(buildUrl({ sort, page: 0 }));
    },
    [router, buildUrl]
  );

  const reset = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return { ...state, setPage, setSize, setSort, reset };
}

/**
 * Compute visible page numbers with ellipsis.
 * Example output for currentPage=5, totalPages=20: [1, null, 4, 5, 6, null, 20]
 * `null` means render an ellipsis.
 */
export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  siblingCount = 1
): (number | null)[] {
  const totalNumbers = siblingCount * 2 + 5; // current + 2 siblings + 2 boundaries + 2 ellipses

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 2);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 3;

  const pages: (number | null)[] = [0];

  if (showLeftEllipsis) {
    pages.push(null);
  } else {
    for (let i = 1; i < leftSibling; i++) pages.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) pages.push(i);

  if (showRightEllipsis) {
    pages.push(null);
  } else {
    for (let i = rightSibling + 1; i < totalPages - 1; i++) pages.push(i);
  }

  pages.push(totalPages - 1);

  return pages;
}
