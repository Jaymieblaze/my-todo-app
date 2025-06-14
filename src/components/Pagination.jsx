import Button from './Button';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center mt-6" aria-label="Pagination">
      <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
        <li>
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            className="min-h-touch min-w-touch"
            aria-label="Previous page"
          >
            Previous
          </Button>
        </li>
        {pageNumbers.map((page) => (
          <li key={page}>
            <Button
              onClick={() => onPageChange(page)}
              variant={page === currentPage ? 'default' : 'outline'}
              className={`min-h-touch min-w-touch ${page === currentPage ? 'hover:bg-indigo-700' : ''}`}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Button>
          </li>
        ))}
        <li>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            className="min-h-touch min-w-touch"
            aria-label="Next page"
          >
            Next
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;