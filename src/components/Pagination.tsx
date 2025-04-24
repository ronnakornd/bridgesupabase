import React from "react";
import { MoveRight, MoveLeft } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="join border-black border">
      <button
        className="join-item btn border-r-black"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <MoveLeft />
      </button>
      <button className="join-item btn btn-neutral">
        Page {currentPage}/{totalPages}
      </button>
      <button
        className="join-item btn border-l-black"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <MoveRight />
      </button>
    </div>
  );
};

export default Pagination;
