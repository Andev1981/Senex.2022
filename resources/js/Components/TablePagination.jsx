import React from "react";

const TablePagination = ({
  table,
  total,
  pageSize,
  setPageSize,
  pageSizeOptions = [5, 10, 15, 20, 30, 40, 50],
}) => {
  return (
    <div className="flex flex-col items-center justify-between gap-2 mt-4 sm:flex-row">
      <div className="text-sm text-gray-700">
        Página {table.getState().pagination.pageIndex + 1} de{" "}
        {table.getPageCount()} | Total de registros: {total}
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
      </div>
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          table.setPageSize(Number(e.target.value));
        }}
        className="px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            Mostrar {size}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TablePagination;
