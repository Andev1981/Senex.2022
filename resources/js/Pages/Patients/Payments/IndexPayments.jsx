import {
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Plus,
  Activity,
  Search,
  ChevronUp,
  ChevronDown,
  Receipt,
  FileText,
  Calendar,
} from "lucide-react";
import { clp } from "@/utils/utils";
import React, { useMemo, useState } from "react";
import SideModal from "@/Components/SideModal";
import TablePagination from "@/Components/TablePagination";
import PaymentForm from "./PaymentForm";
import { paymentMethods } from "@/helpers/status";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function IndexPayments({ payments = [], sessions, patient }) {
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagesize, setpagesize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const totalPaid = useMemo(
    () =>
      payments
        .filter((p) => p.status === "completed")
        .reduce((s, p) => s + (p.amount_clp || 0), 0),
    [payments]
  );
  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pending")
        .reduce((s, p) => s + (p.amount_clp || 0), 0),
    [payments]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "paid_at",
        header: "Fecha de Operación",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-brand-primary opacity-50" />
            {new Date(getValue()).toLocaleDateString("es-CL")}
          </div>
        ),
      },
      {
        accessorKey: "transaction_reference",
        header: "Referencia / Concepto",
        cell: ({ getValue }) => (
          <div className="text-sm font-black text-gray-900 uppercase tracking-tight truncate max-w-[200px]">
            {getValue() || "Atención Clínica"}
          </div>
        ),
      },
      {
        accessorKey: "invoice",
        header: "Documento",
        cell: ({ getValue }) => (
          <span className="font-mono text-[10px] font-black text-brand-primary bg-brand-secondary/10 px-2 py-1 rounded-lg">
            {getValue() || "S/N"}
          </span>
        ),
      },
      {
        accessorKey: "amount_clp",
        header: "Monto Total",
        cell: ({ getValue }) => (
          <div className="font-mono text-sm font-black text-right text-gray-900">
            {clp.format(getValue() || 0)}
          </div>
        ),
      },
      {
        accessorKey: "payment_method",
        header: "Medio de Pago",
        cell: ({ getValue }) => {
          const method = paymentMethods.find((m) => m.value === getValue());
          return (
            <div className="flex items-center gap-2 px-3 py-1 border border-gray-100 rounded-lg bg-gray-50 w-fit">
              <span className="text-sm">{method?.icon || "💰"}</span>
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                {method?.label || getValue()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Estatus",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] ${
                getValue() === "completed"
                  ? "bg-green-50 text-green-600 border border-green-100"
                  : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}
            >
              {getValue() === "completed" ? "Validado" : "Pendiente"}
            </span>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: payments,
    columns,
    state: {
      sorting,
      globalFilter: searchTerm,
      pagination: { pagesize, pageIndex },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
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
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* 1. Header Hero */}
      <div className="relative p-8 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full bg-brand-primary/5 blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center transform shadow-xl w-14 h-14 shadow-brand-primary/20 bg-brand-primary rounded-2xl rotate-3">
              <Receipt className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="mb-1 text-3xl font-black leading-none tracking-tight text-gray-900 uppercase">
                Transacciones
              </h1>
              <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                Balance Financiero & Historial de Recaudación
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenPaymentModal(true)}
            className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* 2. KPIs Compactos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Recaudación Validada"
          icon={CheckCircle}
          colorClass="bg-green-500"
          value={clp.format(totalPaid)}
        />
        <StatCard
          title="Cobros Pendientes"
          icon={Clock}
          colorClass="bg-amber-500"
          value={clp.format(totalPending)}
        />
        <StatCard
          title="Balance Acumulado"
          icon={Activity}
          colorClass="bg-gray-900"
          value={clp.format(totalPaid + totalPending)}
        />
      </div>

      {/* 3. Search Bar */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
        <div className="relative max-w-md group">
          <Search className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por referencia o documento..."
            className="w-full py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none border-gray-50 bg-gray-50/50 rounded-2xl focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 focus:bg-white"
          />
        </div>
      </div>

      {/* 4. Tabla TanStack */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-xl-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-6 py-5 text-left transition-colors cursor-pointer select-none hover:bg-gray-100 group"
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.id === "amount_clp" ? "justify-end" : ""
                        } ${
                          header.column.id === "status" ? "justify-center" : ""
                        }`}
                      >
                        <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary">
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-all hover:bg-brand-secondary/5 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-20 text-center enterprise-label opacity-40"
                  >
                    No se han detectado transacciones registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          table={table}
          total={payments.length}
          pagesize={pagesize}
          setpagesize={setpagesize}
          pagesizeOptions={[5, 10, 20]}
        />
      </div>
    </div>
  );
}

function StatCard({ title, icon: Icon, value, colorClass }) {
  return (
    <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-xl text-white shadow-lg ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="enterprise-label opacity-60">{title}</p>
      <p className="text-3xl font-black leading-none tracking-tighter text-gray-900">
        {value}
      </p>
    </div>
  );
}
