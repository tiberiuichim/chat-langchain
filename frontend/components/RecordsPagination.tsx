import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { UsePaginationResult } from "@/lib/usePagination";

type RecordsPaginationProps = {
  pagination: UsePaginationResult;
};

export const RecordsPagination: React.FC<RecordsPaginationProps> = ({
  pagination: p,
}) => {
  const nextChunk = p.totalPage - p.currentPage;

  const previousButton = p.hasPreviousPage && (
    <PaginationItem>
      <PaginationPrevious onClick={() => p.back()} />
    </PaginationItem>
  );

  const firstPageNumber = p.currentPage > 1 && (
    <PaginationItem>
      <PaginationLink onClick={() => p.back(true)}>1</PaginationLink>
    </PaginationItem>
  );

  const headEllipsis = p.currentPage > 3 && (
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
  );

  const prevPageNumber = p.currentPage > 2 && (
    <PaginationItem>
      <PaginationLink onClick={() => p.go(p.currentPage - 2)}>
        {p.currentPage - 1}
      </PaginationLink>
    </PaginationItem>
  );

  const currentPageNumber = (
    <PaginationItem>
      <PaginationLink className="font-black">{p.currentPage}</PaginationLink>
    </PaginationItem>
  );

  const nextPageNumber = p.totalPage - p.currentPage > 1 && (
    <PaginationItem>
      <PaginationLink onClick={() => p.go(p.currentPage + 1)}>
        {p.currentPage + 1}
      </PaginationLink>
    </PaginationItem>
  );

  const tailEllipsis = nextChunk > 2 && (
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
  );

  const nextButton = p.hasNextPage && p.currentPage < p.totalPage && (
    <PaginationItem>
      <PaginationNext onClick={() => p.next()} />
    </PaginationItem>
  );

  const lastPageNumber = p.currentPage > 1 &&
    p.hasNextPage &&
    p.totalPage !== p.currentPage && (
      <PaginationItem>
        <PaginationLink onClick={() => p.go(p.totalPage)}>
          {p.totalPage}
        </PaginationLink>
      </PaginationItem>
    );

  return (
    <Pagination>
      <PaginationContent>
        {previousButton}
        {firstPageNumber}
        {headEllipsis}
        {prevPageNumber}
        {currentPageNumber}
        {nextPageNumber}
        {tailEllipsis}
        {lastPageNumber}
        {nextButton}
      </PaginationContent>
    </Pagination>
  );
};
