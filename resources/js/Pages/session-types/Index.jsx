import { useState, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import TablePagination from "@/Components/TablePagination";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Edit,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Search,
  Shell,
  Type,
  ArrowBigDown,
  X,
  Check,
  ListChecksIcon,
  Stethoscope,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import SessionTypeModal from "./SessionTypeModal";
import { fmtCLP } from "../../utils/utils";

export default function Index({ sessionTypes }) {
  const { delete: destroy } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const handleCreate = () => {
    setSelectedType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sessionType) => {
    setSelectedType(sessionType);
    setIsModalOpen(true);
  };

  const handleDelete = (sessionType) => {
    if (
      confirm(
        `¿Estás seguro de eliminar el tipo de sesión "${sessionType.name}"?`
      )
    ) {
      destroy(route("sessions.types.destroy", sessionType.id));
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nombre Servicio",
        cell: ({ row }) => {
          const sessionType = row.original;
          return (
            <div>
              <div className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {sessionType.name}
              </div>
              <div className="mt-0.5 font-mono text-[9px] font-bold text-brand-gray uppercase">
                {fmtCLP(sessionType.base_price_clp / sessionType.duration_minutes)} / min
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Categoría",
        cell: ({ getValue }) => (
          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "duration_minutes",
        header: "Duración",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-700">
            <Clock className="w-3.5 h-3.5 text-brand-primary opacity-50" />
            {getValue()} MIN
          </div>
        ),
      },
      {
        accessorKey: "code",
        header: "Código",
        cell: ({ getValue }) => (
          <span className="font-mono text-[10px] font-black text-brand-primary bg-brand-secondary/10 px-2 py-0.5 rounded-md">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "base_price_clp",
        header: "Precio Base",
        cell: ({ getValue }) => (
          <span className="text-xs font-black text-gray-900 font-mono">
            {fmtCLP(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "plan_discount_clp",
        header: "Precio Plan",
        cell: ({ getValue }) => (
          <span className="text-xs font-black text-brand-primary font-mono">
            {fmtCLP(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "default_doctor_commission_clp",
        header: "Costo Kine",
        cell: ({ getValue }) => (
          <span className="text-xs font-black text-orange-600 font-mono">
            {fmtCLP(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ getValue }) => {
          const isActive = getValue();
          return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}
            >
              {isActive ? "Activo" : "Inactivo"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => handleEdit(row.original)}
              className="p-2 text-brand-primary hover:bg-brand-secondary/10 transition-all rounded-xl border border-transparent"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-red-400 hover:bg-red-50 transition-all rounded-xl border border-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: sessionTypes,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      pagination: { pageSize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
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

  const activeCount = sessionTypes.filter((t) => t.is_active).length;
  const planEligibleCount = sessionTypes.filter(
    (t) => t.plan_discount_clp > 0
  ).length;

  return (
    <AuthenticatedLayout>
      <Head title="Sesiones Pacientes" />
      <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
        {/* Header */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                <Shell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Portafolio de Servicios</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Configuración de Prestaciones • {/* Senex Enterprise */}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCreate()}
                className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Nuevo Servicio
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-brand-secondary/10 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                <Shell className="w-8 h-8" />
              </div>
              <div>
                <p className="enterprise-label opacity-60">Total Servicios</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{sessionTypes.length}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl hover:scale-[1.02] transition-all duration-300 group border-b-4 border-b-green-500">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="enterprise-label opacity-60 text-green-600">Disponibles</p>
                <p className="text-4xl font-black text-green-600 tracking-tighter">{activeCount}</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl hover:scale-[1.02] transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-brand-secondary/10 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <p className="enterprise-label opacity-60">En Planes</p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter">{planEligibleCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <div className="relative group">
            <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscador inteligente de servicios..."
              className="w-full py-4 pl-12 pr-4 transition-all border-gray-200 bg-gray-50/50 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 focus:bg-white text-sm font-bold outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-3 text-left transition-colors cursor-pointer select-none hover:bg-gray-100 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="w-3 h-3 text-brand-primary" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="w-3 h-3 text-brand-primary" />
                              ) : (
                                <div className="w-3 h-3 border-2 border-brand-primary/20 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-50">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center enterprise-label opacity-40">
                      {searchTerm
                        ? "No se encontraron coincidencias"
                        : "No hay registros configurados"}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-all hover:bg-brand-secondary/5 group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-2.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            table={table}
            total={sessionTypes.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            pagesizeOptions={[5, 10, 15, 20, 30, 40, 50]}
          />
        </div>

        {/* Modal */}
      <SideModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="3xl"
      >
        <SessionTypeModal
          setIsModalOpen={setIsModalOpen}
          selectedType={selectedType}
        />
      </SideModal>
      </div>
    </AuthenticatedLayout>
  );
}
