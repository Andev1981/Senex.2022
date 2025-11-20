import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import {
  ChevronDown,
  ChevronUp,
  FileDown,
  Filter,
  Mail,
  Phone,
  Search,
  Stethoscope,
  UserCog,
} from "lucide-react";
import TablePagination from "@/Components/TablePagination";
import { fmtCLP } from "@/utils/utils";

export default function TableDoctors({
  doctors,
  setSelectedDoctor,
  setIsModalOpen,
  setIsModalOpenDetail,
  setIsModalOpenAttendences,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Filtrado global simple (busca en todas las columnas)
  const filteredData = useMemo(() => {
    if (!globalFilter) return doctors || [];
    const filter = globalFilter.toLowerCase();
    return doctors.filter((row) =>
      Object.values(row).some(
        (val) => val && val.toString().toLowerCase().includes(filter)
      )
    );
  }, [globalFilter, doctors]);

  useEffect(() => {
    const id = setTimeout(() => {
      setGlobalFilter(searchTerm);
    }, 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const columns = useMemo(
    () => [
      {
        id: "profesional",
        header: "PROFESIONAL",
        cell: ({ row }) => {
          const { name, last_name, phone, email, full_name } = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center font-bold text-white rounded-lg w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {full_name}
                </p>
                <p className="flex items-center gap-3 text-xs text-gray-500 truncate">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {phone}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {email}
                  </span>
                </p>
              </div>
            </div>
          );
        },
      },
      { accessorKey: "rut", header: "RUT" },
      {
        id: "speciality",
        header: "ESPECIALIDAD",
        cell: ({ row }) => {
          const { specialty } = row.original;
          return (
            <span className="inline-flex items-center gap-1">
              <Stethoscope className="w-4 h-4 text-gray-400" />
              {specialty}
            </span>
          );
        },
      },
      {
        id: "is_active",
        header: "ESTADO",
        cell: ({ row }) => {
          const { is_active } = row.original;
          const color = is_active ? "bg-green-500" : "bg-gray-500";
          const label = is_active ? "Activo" : "Inactivo";
          return (
            <span
              className={`inline-flex text-white items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}
            >
              {label}
            </span>
          );
        },
      },
      { accessorKey: "sessions_month", header: "SESIONES (MES)" },
      {
        id: "revenue_month",
        header: "INGRESOS (MES)",
        cell: ({ row }) => {
          const { revenue_month } = row.original;
          return <div> {fmtCLP(revenue_month || 0)}</div>;
        },
      },
      {
        id: "actions",
        header: "ACCIONES",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => (
                setSelectedDoctor(row.original), setIsModalOpen(true)
              )}
            >
              Ficha
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => (
                setSelectedDoctor(row.original), setIsModalOpenDetail(true)
              )}
            >
              Detalles
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => (
                setSelectedDoctor(row.original), setIsModalOpenAttendences(true)
              )}
            >
              Atenciones
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [setIsModalOpen, setIsModalOpenDetail, setIsModalOpenAttendences]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  const exportToExcel = () => {
    const exportData = filteredData.map((item) => ({
      Nombre: item?.name,
      Apellido: item?.last_name,
      Edad: item?.birth
        ? new Date().getFullYear() - new Date(item.birth).getFullYear()
        : "N/A",
      Email: item?.email,
      Rut: item?.rut,
      Teléfono: item?.phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pacientes");
    XLSX.writeFile(workbook, "pacientes.xlsx");
  };

  return (
    <div className="max-w-full">
      <div className="p-4 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row">
          <div className="flex items-center flex-1 gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg focus-within:border-blue-500">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, RUT, correo, fono, especialidad..."
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={searchTerm}
              onChange={(e) => setSpecialty(e.target.value)}
              className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
            >
              {[
                "Todas",
                ...Array.from(new Set(doctors.map((d) => d.specialty))),
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg"
            >
              <option>Todos</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" /> Más filtros
            </button>
            <button
              onClick={exportToExcel}
              className="inline-flex items-center gap-2 text-sm font-medium border-2 border-gray-200 px-2 py-2 text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              <FileDown className="w-4 h-4" /> Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm lg:col-span-2 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <UserCog className="w-5 h-5 text-blue-600" /> Doctores/Kines
          </h2>
          <span className="text-sm text-gray-600">
            {/* {filtrados.length}  */}resultados
          </span>
        </div>

        <div className="w-full overflow-x-auto ">
          <table className="min-w-[700px] w-full border-collapse border border-gray-200 shadow-sm rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="text-left border-b-2 border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-xs font-bold text-gray-600 uppercase cursor-pointer"
                      scope="col"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronDown className="inline w-4 h-4 ml-1" />,
                        desc: <ChevronUp className="inline ml-1" />,
                      }[header.column.getIsSorted()] ?? null}
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
          </table>
        </div>
        {/* Paginación */}
        <TablePagination
          table={table}
          total={doctors.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
          pageSizeOptions={[5, 10, 15, 20, 30, 40, 50]} // Opcional
        />
      </div>
    </div>
  );
}
