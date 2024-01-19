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

  return (
    <Pagination>
      <PaginationContent>
        {p.hasPreviousPage && (
          <PaginationItem>
            <PaginationPrevious onClick={() => p.back()} />
          </PaginationItem>
        )}

        {p.currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {p.currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => p.go(p.currentPage - 1)}>
              {p.currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationLink>{p.currentPage}</PaginationLink>
        </PaginationItem>

        {p.totalPage - p.currentPage > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => p.go(p.currentPage + 1)}>
              {p.currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {nextChunk > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {p.hasNextPage && (
          <PaginationItem>
            <PaginationNext onClick={() => p.next()} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
