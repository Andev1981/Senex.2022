import React, { useEffect, useMemo, useState } from "react";

const TablePagination = ({
  table,
  total, // total de registros del servidor (o del cliente si lo calculas afuera)
  pagesize,
  setpagesize,
  pagesizeOptions = [5, 10, 15, 20, 30, 40, 50],
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
    const start = pageIndex * pagesize + 1;
    const end = Math.min(start + pagesize - 1, total);
    return { startRow: start, endRow: end };
  }, [pageIndex, pagesize, total]);

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
    <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Info izquierda */}
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gray opacity-70">
            Página <span className="text-gray-900">{currentPage}</span> de{" "}
            <span className="text-gray-900">{pageCount || 1}</span> 
            <span className="mx-2 opacity-30">|</span> 
            Registros <span className="text-gray-900">{total ? `${startRow}–${endRow}` : 0}</span> 
            <span className="mx-1 opacity-30">de</span> <span className="text-gray-900">{total ?? 0}</span>
          </p>

          <select
            value={pagesize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setpagesize(newSize); // estado externo (prop)
              table.setpagesize(newSize); // TanStack
              table.setPageIndex(0); // reset a primera página
            }}
            className="px-4 py-2 bg-white border border-gray-100 rounded-xl focus:ring-brand-primary focus:border-brand-primary text-[10px] font-black uppercase tracking-widest text-brand-gray cursor-pointer shadow-sm transition-all"
          >
            {pagesizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        </div>

        {/* Controles derecha */}
        <div className="flex items-center gap-1.5">
          <button
            className="p-3 transition-all bg-white border border-gray-100 rounded-xl-sm hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed text-brand-gray active:scale-95 shadow-sm"
            onClick={() => goToPage(1)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Primera página"
          >
            <span className="text-xs font-black">«</span>
          </button>
          <button
            className="p-3 transition-all bg-white border border-gray-100 rounded-xl-sm hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed text-brand-gray active:scale-95 shadow-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <span className="text-xs font-black">‹</span>
          </button>

          <div className="flex items-center gap-1 px-2">
            {pages.map((p) =>
                typeof p === "string" && p.startsWith("ellipsis-") ? (
                <span key={p} className="px-2 text-brand-gray/30 font-black">
                    …
                </span>
                ) : (
                <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`min-w-[40px] h-10 rounded-xl-sm text-[10px] font-black transition-all active:scale-90 ${
                    currentPage === p
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                        : "bg-white border border-gray-100 text-brand-gray hover:bg-gray-50"
                    }`}
                    aria-current={currentPage === p ? "page" : undefined}
                >
                    {p}
                </button>
                )
            )}
          </div>

          <button
            className="p-3 transition-all bg-white border border-gray-100 rounded-xl-sm hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed text-brand-gray active:scale-95 shadow-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Página siguiente"
          >
            <span className="text-xs font-black">›</span>
          </button>
          <button
            className="p-3 transition-all bg-white border border-gray-100 rounded-xl-sm hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed text-brand-gray active:scale-95 shadow-sm"
            onClick={() => goToPage(pageCount)}
            disabled={!table.getCanNextPage()}
            aria-label="Última página"
          >
            <span className="text-xs font-black">»</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
