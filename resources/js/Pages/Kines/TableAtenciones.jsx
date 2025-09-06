import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { STATUS_MAP, STATUS_OPTIONS } from "./status";

// PDF export
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function TableAtenciones({
  atenciones,
  handleOpenModalOptions,
  handleOpenModalContactPersons,
  logoUrl, // <- URL del logo (opcional)
  kineName, // <- nombre del kinesiólogo para mostrar bajo el título
}) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // set pageSize to all rows by default to show everything
  const [pageSize, setPageSize] = useState(
    atenciones?.length > 0 ? atenciones?.length : 1
  );

  // default filter to the current month on load
  const [columnFilters, setColumnFilters] = useState([
    { id: "fecha_atencion", value: currentMonth },
  ]);
  const [pageIndex, setPageIndex] = useState(0);

  // Helpers
  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      // handle "1.234,56" or "1234,56" -> 1234.56
      const s = v.replace(/\./g, "").replace(",", ".");
      const n = Number(s);
      return Number.isNaN(n) ? 0 : n;
    }
    return 0;
  };
  const clp = (n) =>
    (Number(n) || 0).toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  const fmtDate = (val) =>
    val ? new Date(val).toLocaleDateString("es-CL") : "-";

  // Filtrado global simple (busca en todas las columnas del dataset original)
  const filteredData = useMemo(() => {
    if (!globalFilter) return atenciones || [];
    const filter = globalFilter.toLowerCase();
    return (atenciones || []).filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, atenciones]);

  const columns = useMemo(
    () => [
      { accessorKey: "patient_full", header: "Paciente" },
      {
        header: "FECHA ATENCIÓN (MES)",
        accessorFn: (row) => row?.fecha_atencion,
        id: "fecha_atencion",
        cell: ({ getValue }) => (getValue() ? fmtDate(getValue()) : "-"),
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) return true; // si no hay filtro, mostrar todo
          const value = row.getValue(columnId);
          if (!value) return false;
          const date = new Date(value);
          const month = date.getMonth() + 1; // enero = 0 → sumamos 1
          return month === Number(filterValue);
        },
        Filter: ({ column }) => {
          const meses = [
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
          ];

          return (
            <select
              value={column.getFilterValue() ?? ""}
              onChange={(e) =>
                column.setFilterValue(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="overflow-hidden uppercase truncate whitespace-nowrap"
            >
              <option value="">Todos</option>
              {meses.map((mes, i) => (
                <option key={i} value={i + 1}>
                  {mes}
                </option>
              ))}
            </select>
          );
        },
      },
      { accessorKey: "application_type_name", header: "Tipo" },
      { accessorKey: "numero_sesion", header: "Número de Sesión" },
      // NUEVA COLUMNA: Valor (apply_item_price o valor)
      {
        header: "Valor",
        accessorFn: (row) =>
          row?.apply_item_price != null ? row.apply_item_price : row?.valor,
        id: "valor",
        cell: ({ getValue }) => {
          const v = getValue();
          return v != null && v !== "" ? v : "-";
        },
      },
      { accessorKey: "valor_senex", header: "Valor Cliente" },
      { accessorKey: "valor_kine", header: "Valor Kine" },
      { accessorKey: "total_senex", header: "Total Senex" },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ getValue }) => {
          const v = Number(getValue() ?? -1);
          const meta = STATUS_MAP[v] || {
            label: "Desconocido",
            chip: "bg-gray-100 text-gray-700",
          };
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${meta.chip}`}
            >
              {meta.label}
            </span>
          );
        },
        // permite filtrar por valor único o por array (multi-select)
        filterFn: (row, columnId, filterValue) => {
          if (
            filterValue == null ||
            (Array.isArray(filterValue) && filterValue.length === 0)
          )
            return true;
          const cell = Number(row.getValue(columnId));
          return Array.isArray(filterValue)
            ? filterValue.map(Number).includes(cell)
            : cell === Number(filterValue);
        },
        meta: { options: STATUS_OPTIONS },
      },
    ],
    [handleOpenModalOptions, handleOpenModalContactPersons]
  );

  const meses = [
    { name: "Enero", value: 1 },
    { name: "Febrero", value: 2 },
    { name: "Marzo", value: 3 },
    { name: "Abril", value: 4 },
    { name: "Mayo", value: 5 },
    { name: "Junio", value: 6 },
    { name: "Julio", value: 7 },
    { name: "Agosto", value: 8 },
    { name: "Septiembre", value: 9 },
    { name: "Octubre", value: 10 },
    { name: "Noviembre", value: 11 },
    { name: "Diciembre", value: 12 },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  // Totales de filas filtradas actualmente en la tabla
  const filteredRows = table.getFilteredRowModel().rows;
  const totalAtenciones = filteredRows.length;

  const totals = useMemo(() => {
    const sumBy = (getter) =>
      filteredRows.reduce((acc, r) => acc + toNumber(getter(r.original)), 0);

    const totalValor = sumBy((o) =>
      o.apply_item_price != null && o.apply_item_price !== ""
        ? o.apply_item_price
        : o.valor
    );
    const totalValorSenex = sumBy((o) => o.valor_senex);
    const totalValorKine = sumBy((o) => o.valor_kine);
    const totalSenex = sumBy((o) => o.total_senex);

    return {
      valor: totalValor,
      valor_senex: totalValorSenex,
      valor_kine: totalValorKine,
      total_senex: totalSenex,
    };
  }, [filteredRows]);

  // Cargar logo a dataURL (si hay CORS abierto)
  const loadImageAsDataURL = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve(null);
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL("image/png");
            resolve(dataUrl);
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch (e) {
        resolve(null);
      }
    });

  const exportToPDF = async () => {
    const totalAtenciones = filteredRows.length;
    const doc = new jsPDF({ orientation: "portrait" });

    // Header con logo y título
    const monthFilter = columnFilters.find(
      (f) => f.id === "fecha_atencion"
    )?.value;
    const monthName =
      meses.find((x) => x.value === Number(monthFilter || currentMonth))
        ?.name || "";
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo (si viene)
    const dataUrl = await loadImageAsDataURL(logoUrl);
    if (dataUrl) {
      // x, y, width, height
      doc.addImage(dataUrl, "PNG", 14, 8, 28, 14);
    }

    // Título centrado
    doc.setFontSize(18);
    const title = "Atenciones";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, pageWidth / 2 - titleWidth / 2, 14);

    // Nombre de Kine (si se pasó) y Subtítulo con mes/año
    doc.setFontSize(11);
    const kineLabel =
      typeof kineName !== "undefined" && kineName
        ? `Kinesiólogo: ${kineName}`
        : "";
    if (kineLabel) {
      const kineWidth = doc.getTextWidth(kineLabel);
      doc.text(kineLabel, pageWidth / 2 - kineWidth / 2, 20);
    }
    const subtitle = `Mes: ${monthName} ${currentYear}`;
    const subtitleWidth = doc.getTextWidth(subtitle);
    doc.text(subtitle, pageWidth / 2 - subtitleWidth / 2, kineLabel ? 26 : 20);

    // Total de atenciones (texto pequeño a la derecha)
    doc.setFontSize(9);
    const totalText = `Total de atenciones: ${totalAtenciones}`;
    const totalTextWidth = doc.getTextWidth(totalText);
    doc.text(totalText, pageWidth - 14 - totalTextWidth, kineLabel ? 26 : 20);

    // Línea divisoria
    doc.setDrawColor(180);
    doc.line(14, 30, pageWidth - 14, 30);

    // Columnas para PDF (sin columnas Senex)
    const head = [["Paciente", "Fecha", "Tipo", "N° Sesión", "Valor Kine"]];

    const body = filteredRows.map((r) => {
      const o = r.original || {};
      return [
        o.patient_full ?? "-",
        fmtDate(o.fecha_atencion),
        o.application_type_name ?? "-",
        o.numero_sesion ?? "-",
        clp(toNumber(o.valor_kine)),
      ];
    });

    // Añadimos fila de totales (solo las columnas visibles en PDF)
    body.push([
      `Totales (Atenciones: ${totalAtenciones})`,
      "",
      "",
      "",
      clp(totals.valor_kine),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 34,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      bodyStyles: { textColor: 20 },
      columnStyles: {
        4: { halign: "right" }, // Valor Kine
      },
      didDrawPage: (data) => {
        // Footer simple con fecha de exportación
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        const footer = `Exportado: ${new Date()
          .toLocaleString("es-CL")
          .replace(",", " - ")} | Página ${pageCount}`;
        doc.text(
          footer,
          data.settings.margin.left,
          doc.internal.pageSize.height - 5
        );
      },
    });

    // Nombre del archivo con mes/año
    const monthNum = String(monthFilter || currentMonth).padStart(2, "0");
    doc.save(`atenciones-${currentYear}-${monthNum}.pdf`);
  };

  return (
    <div className="max-w-full p-4">
      <div className="flex flex-col w-full gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          className="w-full px-3 py-2 transition border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={exportToPDF}
          className="px-2 py-1 text-sm text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
          title="Exporta PDF con logo, título y sin columnas Senex"
        >
          Exportar&nbsp;PDF
        </button>
      </div>
      <div className="w-full overflow-x-auto ">
        <table className="min-w-[900px] w-full border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3 text-sm font-semibold text-left text-gray-700 transition border border-gray-200 cursor-pointer select-none hover:bg-gray-200"
                    scope="col"
                  >
                    <div className="flex">
                      <div className="overflow-hidden uppercase truncate whitespace-nowrap">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                      <span>
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="inline w-4 h-4 ml-1" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="inline w-4 h-4 ml-1" />
                        ) : null}
                      </span>
                    </div>
                    {/* Filtros por columna */}
                    {header.column.getCanFilter() && (
                      <div className="flex gap-1 mt-1">
                        {/* Filtro atención (mes) */}
                        {["FECHA ATENCIÓN (MES)"].includes(
                          header.column.columnDef.header
                        ) ? (
                          <select
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(
                                e.target.value || undefined
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          >
                            <option value="">Todos</option>
                            {meses.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={header.column.getFilterValue() ?? ""}
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            placeholder="Filtrar..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        )}
                        {header.column.getCanFilter() &&
                          header.column.columnDef.meta?.filterComponent?.({
                            column: header.column,
                          })}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-6 text-center text-gray-500"
                >
                  No se han encontrado datos
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition border-b border-gray-200 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-gray-800 whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          {/* Fila de totales al final (en pantalla mantiene todas las columnas) */}
          <tfoot>
            <tr className="font-semibold bg-gray-100">
              {/* Paciente, Fecha, Tipo, N° Sesión */}
              <td className="px-4 py-3" colSpan={4}>
                Totales (Atenciones: {totalAtenciones})
              </td>
              {/* Valor */}
              <td className="px-4 py-3 text-right">{clp(totals.valor)}</td>
              {/* Valor Cliente */}
              <td className="px-4 py-3 text-right">
                {clp(totals.valor_senex)}
              </td>
              {/* Valor Kine */}
              <td className="px-4 py-3 text-right">{clp(totals.valor_kine)}</td>
              {/* Total Senex */}
              <td className="px-4 py-3 text-right">
                {clp(totals.total_senex)}
              </td>
              {/* Estado (vacío) */}
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
