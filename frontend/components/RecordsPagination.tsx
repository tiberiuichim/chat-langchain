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
  const headEllipsis = p.currentPage > 2 && (
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
  );
  const prevPageNumber = p.currentPage > 2 && (
    <PaginationItem>
      <PaginationLink onClick={() => p.go(p.currentPage - 1)}>
        {p.currentPage}
      </PaginationLink>
    </PaginationItem>
  );
  const currentPageNumber = (
    <PaginationItem>
      <PaginationLink className="font-black">
        {p.currentPage + 1}
      </PaginationLink>
    </PaginationItem>
  );
  const nextPageNumber = p.totalPage - p.currentPage > 2 && (
    <PaginationItem>
      <PaginationLink onClick={() => p.go(p.currentPage + 1)}>
        {p.currentPage + 2}
      </PaginationLink>
    </PaginationItem>
  );
  const tailEllipsis = nextChunk > 2 && (
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
  );
  const nextButton = p.hasNextPage && (
    <PaginationItem>
      <PaginationNext onClick={() => p.next()} />
    </PaginationItem>
  );

  return (
    <Pagination>
      <PaginationContent>
        {previousButton}
        {headEllipsis}
        {prevPageNumber}
        {currentPageNumber}
        {nextPageNumber}
        {tailEllipsis}
        {nextButton}
      </PaginationContent>
    </Pagination>
  );
};
