import React, { useEffect, useMemo, useState } from "react";

const TablePagination = ({
  table,
  total, // total de registros del servidor (o del cliente si lo calculas afuera)
  pageSize,
  setPageSize,
  pageSizeOptions = [5, 10, 15, 20, 30, 40, 50],
}) => {
  const pageIndex = table.getState().pagination.pageIndex; // 0-based
  const pageCount = table.getPageCount(); // número de páginas
  const [currentPage, setCurrentPage] = useState(pageIndex + 1); // 1-based para UI

  // Mantener currentPage sincronizado con TanStack
  useEffect(() => {
    setCurrentPage(pageIndex + 1);
  }, [pageIndex]);

  // Calcular rango "Mostrando A–B de N"
  const { startRow, endRow } = useMemo(() => {
    if (total == null || total === 0) {
      return { startRow: 0, endRow: 0 };
    }
    const start = pageIndex * pageSize + 1;
    const end = Math.min(start + pageSize - 1, total);
    return { startRow: start, endRow: end };
  }, [pageIndex, pageSize, total]);

  // Construir lista de páginas con elipsis
  const pages = useMemo(() => {
    const pagesArr = [];
    const showWindow = 1; // cuántas a cada lado de la actual

    for (let i = 1; i <= pageCount; i++) {
      if (
        i === 1 ||
        i === pageCount ||
        (i >= currentPage - showWindow && i <= currentPage + showWindow)
      ) {
        pagesArr.push(i);
      } else if (
        i === currentPage - (showWindow + 1) ||
        i === currentPage + (showWindow + 1)
      ) {
        pagesArr.push("ellipsis-" + i);
      }
    }
    return pagesArr;
  }, [currentPage, pageCount]);

  const goToPage = (p) => {
    // p es 1-based
    table.setPageIndex(Math.max(0, Math.min(pageCount - 1, p - 1)));
  };

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Info izquierda */}
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-700">
            Página <span className="font-semibold">{currentPage}</span> de{" "}
            <span className="font-semibold">{pageCount || 1}</span> — Mostrando{" "}
            <span className="font-semibold">
              {total ? `${startRow}–${endRow}` : 0}
            </span>{" "}
            de <span className="font-semibold">{total ?? 0}</span> registros
          </p>

          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize); // estado externo (prop)
              table.setPageSize(newSize); // TanStack
              table.setPageIndex(0); // reset a primera página
            }}
            className="px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        </div>

        {/* Controles derecha */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 transition-colors border-2 border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => goToPage(1)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Primera página"
          >
            {"<<"}
          </button>
          <button
            className="p-2 transition-colors border-2 border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            {"<"}
          </button>

          {pages.map((p) =>
            typeof p === "string" && p.startsWith("ellipsis-") ? (
              <span key={p} className="px-2 select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "border-2 border-gray-200 hover:bg-gray-100 text-gray-700"
                }`}
                aria-current={currentPage === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            className="p-2 transition-colors border-2 border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            {">"}
          </button>
          <button
            className="p-2 transition-colors border-2 border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => goToPage(pageCount)}
            disabled={!table.getCanNextPage()}
            aria-label="Última página"
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
