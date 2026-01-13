import React, { useState, useMemo } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
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
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Barcode,
  ChevronUp,
  ChevronDown,
  Database,
  TrendingUp,
  Boxes,
  Eye,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { fmtCLP } from "@/utils/utils";
import SideModal from "@/Components/SideModal";
import ProductModal from "./Partials/ProductModal";
import Swal from "sweetalert2";

export default function Index({ products }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagesize, setpagesize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  
  // ESTADOS PARA MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openForm = (prod = null) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = (prod) => {
    Swal.fire({
      title: "¿Eliminar Producto?",
      text: `Se dará de baja: ${prod.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route("products.destroy", prod.id));
      }
    });
  };

  const getStockBadge = (product) => {
    if (!product.manage_stock) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
          Infinito
        </span>
      );
    }
    if (product.stock <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-red-50 text-red-600 uppercase tracking-widest border border-red-100">
          Agotado
        </span>
      );
    }
    if (product.stock <= product.critical_stock) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100 animate-pulse">
          Crítico: {product.stock}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-green-50 text-green-600 uppercase tracking-widest border border-green-100">
        {product.stock} Dispo.
      </span>
    );
  };

  const columns = useMemo(() => [
    {
        accessorKey: "name",
        header: "Detalle del Item",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0 transform rotate-3">
                    <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">{row.original.name}</p>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-brand-gray opacity-60 uppercase tracking-widest">SKU: {row.original.sku || 'S/N'}</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        accessorKey: "price",
        header: "Precio Venta",
        cell: ({ getValue, row }) => (
          <div className="text-right">
            <div className="font-black text-gray-900 font-mono text-sm tracking-tighter">
              {fmtCLP(getValue())}
            </div>
            {row.original.is_exempt && (
              <span className="text-[8px] text-brand-primary uppercase font-black tracking-widest bg-brand-secondary/10 px-1.5 py-0.5 rounded border border-brand-secondary/20">Exento</span>
            )}
          </div>
        ),
    },
    {
        accessorKey: "stock",
        header: "Inventario",
        cell: ({ row }) => <div className="text-center">{getStockBadge(row.original)}</div>,
    },
    {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ getValue }) => (
          <div className="text-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] shadow-sm border ${getValue() ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                {getValue() ? "Activo" : "Baja"}
            </span>
          </div>
        ),
    },
    {
        id: "actions",
        header: "Gestión",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => openForm(row.original)}
              className="p-2 text-brand-primary bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-90 shadow-sm"
              title="Editar Producto"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
              title="Eliminar Item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
    },
  ], []);

  const table = useReactTable({
    data: products.data || products,
    columns,
    state: { sorting, globalFilter: searchTerm, pagination: { pagesize, pageIndex } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater({ pageIndex, pagesize }) : updater;
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
    <AuthenticatedLayout>
      <Head title="Gestión de Inventario" />

      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50 space-y-10">
        
        {/* HEADER HERO */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="flex items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 transform rotate-3">
                <Boxes className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">Control de Inventario</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-brand-primary opacity-40" /> Insumos & Productos a la Venta
                </p>
              </div>
            </div>
            <button
                onClick={() => openForm()}
                className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
            >
                <Plus className="w-4 h-4" /> Ingresar Producto
            </button>
          </div>
        </div>

        {/* KPIs COMPACTOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl border-b-4 border-b-brand-primary hover:scale-[1.02] transition-all group">
                <p className="enterprise-label !text-[8px] opacity-60 mb-2 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-brand-primary" /> Universo de Items
                </p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{(products.data || products).length}</p>
            </div>
            <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl border-b-4 border-b-orange-400 hover:scale-[1.02] transition-all group">
                <p className="enterprise-label !text-[8px] text-orange-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> Stock Crítico
                </p>
                <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{(products.data || products).filter(p => p.manage_stock && p.stock <= p.critical_stock).length}</p>
            </div>
            <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-xl border-b-4 border-b-green-500 hover:scale-[1.02] transition-all group">
                <p className="enterprise-label !text-[8px] text-green-600 mb-2 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" /> Valor del Inventario
                </p>
                <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
                    {fmtCLP((products.data || products).reduce((sum, p) => sum + (p.price * (p.manage_stock ? p.stock : 0)), 0))}
                </p>
            </div>
        </div>

        {/* BUSCADOR */}
        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl relative overflow-hidden">
          <div className="relative group max-w-xl z-10">
            <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-4 top-1/2 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Filtrar por nombre, SKU o código de barras..."
              className="w-full py-4 pl-12 pr-4 border-gray-100 bg-gray-50 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary text-sm font-bold transition-all outline-none shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLA TANSTACK */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-gray-100">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-8 py-5 text-left select-none group cursor-pointer"
                      >
                        <div className={`flex items-center gap-2 ${header.column.id === 'price' ? 'justify-end' : ''} ${['stock', 'is_active'].includes(header.column.id) ? 'justify-center' : ''} ${header.column.id === 'actions' ? 'justify-end' : ''}`}>
                          <span className="enterprise-label !mb-0 text-gray-900 group-hover:text-brand-primary transition-colors">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {header.column.getIsSorted() === "asc" ? <ChevronUp className="w-3 h-3 text-brand-primary" /> : <ChevronDown className="w-3 h-3 text-brand-primary" />}
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
                    <tr key={row.id} className="hover:bg-brand-secondary/5 transition-all group">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-8 py-3.5 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                            <div className="p-6 bg-gray-50 rounded-[2.5rem]">
                                <Package className="w-12 h-12" />
                            </div>
                            <p className="enterprise-label">Inventario Vacío</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/30 border-t border-gray-100">
            <TablePagination
                table={table}
                total={products.total || (products.data || products).length}
                pagesize={pagesize}
                setpagesize={setpagesize}
                pagesizeOptions={[10, 20, 50]}
            />
          </div>
        </div>
      </div>

      {/* MODAL MAESTRO DE PRODUCTO */}
      <SideModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        width="2xl"
      >
        <ProductModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            product={selectedProduct}
        />
      </SideModal>

    </AuthenticatedLayout>
  );
}