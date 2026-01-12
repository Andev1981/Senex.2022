import Swal from "sweetalert2";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Search,
  ScanEye,
  BrickWallShield,
  List,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import TablePagination from "@/Components/TablePagination";

export default function TableInsurances({
  insurances,
  handleOpenModalEdit,
  openPlanListModal,
  user,
}) {
  const handleOpenModalDelete = (insurance) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede revertir!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3292b3",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route("insurances.destroy", insurance.id), {
          onSuccess: () => {
            // Inertia flash message will handle success toast
          },
          onError: (errors) => {
            toast.error(
              "Error al eliminar: " + (errors.message || "Error desconocido.")
            );
          },
        });
      }
    });
  };

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagesize, setpagesize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const data = useMemo(() => insurances || [], [insurances]);

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "name",
        header: "Institución Previsora",
        cell: ({ row, getValue }) => (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[1rem] bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0 transform -rotate-2">
              <BrickWallShield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-sm font-black leading-none tracking-tight text-gray-900 uppercase truncate">
                {getValue()?.replace(/^\d+\s-\s/, "")}
              </p>
              <p className="text-[9px] font-black text-brand-gray opacity-60 uppercase tracking-widest font-mono">
                {row.original.rut}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "contact",
        header: "Contacto Directo",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 truncate max-w-[180px]">
              <Mail className="w-3 h-3 text-brand-primary opacity-40" />{" "}
              {row.original.email || "Sin Correo"}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
              <Phone className="w-3 h-3 text-brand-primary opacity-40" />{" "}
              {row.original.phone || "---"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Disponibilidad",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                getValue()
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {getValue() ? "Operativa" : "Suspendida"}
            </span>
          </div>
        ),
      },
      {
        id: "planes",
        header: "Capacidad",
        cell: ({ row }) => {
          const count = row.original.plans?.length || 0;
          return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 w-fit">
              <Layers className="w-3.5 h-3.5 text-brand-primary opacity-50" />
              <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                {count} Planes
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Gestión",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => openPlanListModal(row.original)}
              className="flex items-center gap-2 p-2 px-4 transition-all border text-brand-primary bg-brand-secondary/5 border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white active:scale-90"
              title="Ver Planes de Cobertura"
            >
              <span className="text-[9px] font-black uppercase tracking-widest">
                Planes
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-6 mx-1 bg-gray-100"></div>
            <button
              onClick={() => handleOpenModalEdit(row.original)}
              className="p-2 text-gray-400 transition-all hover:text-brand-primary hover:bg-gray-50 rounded-xl active:scale-90"
              title="Editar Entidad"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenModalDelete(row.original)}
              className="p-2 text-gray-300 transition-all hover:text-red-500 hover:bg-red-50 rounded-xl active:scale-90"
              title="Eliminar Registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ];

    if (user && user.roles.some((role) => role.name === "superadmin")) {
      baseColumns.splice(1, 0, {
        accessorKey: "company_id",
        header: "Company ID",
      });
    }

    return baseColumns;
  }, [handleOpenModalEdit, openPlanListModal, user]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination: { pagesize, pageIndex } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pagesize })
          : updater;
      setPageIndex(newState.pageIndex);
      setpagesize(newState.pagesize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <div className="space-y-6 duration-700 animate-in fade-in">
      <div className="relative p-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl">
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl">
          <div className="relative z-10 max-w-xl group">
            <Search className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por nombre de Isapre o RUT..."
              className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all border-gray-100 shadow-inner outline-none bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-enterprise-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/30">
            <h2 className="flex items-center gap-3 text-sm font-black tracking-tight text-gray-900 uppercase">
              <BrickWallShield className="w-5 h-5 text-brand-primary" /> Nómina
              de Previsión
            </h2>
            <span className="text-[9px] font-black text-brand-gray uppercase tracking-[0.2em] bg-white px-4 py-1.5 rounded-xl shadow-sm border border-gray-100">
              {table.getFilteredRowModel().rows.length} Entidades Registradas
            </span>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-gray-50/50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-8 py-5 text-left cursor-pointer select-none group"
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.id === "actions" ? "justify-end" : ""
                          } ${
                            header.column.id === "is_active"
                              ? "justify-center"
                              : ""
                          }`}
                        >
                          <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="transition-opacity opacity-0 group-hover:opacity-100">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="w-3 h-3 text-brand-primary" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-brand-primary" />
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
                    <td
                      colSpan={columns.length}
                      className="px-8 py-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-6 bg-gray-50 rounded-[2rem] text-gray-200">
                          <Layers className="w-12 h-12" />
                        </div>
                        <p className="enterprise-label opacity-40">
                          No se detectaron aseguradorasvinculadas
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-all hover:bg-brand-secondary/5 group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-8 py-3 whitespace-nowrap"
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

          <div className="p-6 border-t border-gray-100 bg-gray-50/30">
            <TablePagination
              table={table}
              total={insurances.length}
              pagesize={pagesize}
              setpagesize={setpagesize}
              pagesizeOptions={[5, 10, 20]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
