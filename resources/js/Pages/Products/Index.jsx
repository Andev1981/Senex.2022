import React, { useState, useMemo, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import TablePagination from "@/components/TablePagination";
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
  ChevronUp,
  ChevronDown,
  Database,
  Boxes,
  CheckCircle2,
  DollarSign,
  Monitor,
  Tag,
  Layers
} from "lucide-react";
import { fmtCLP } from "@/utils/utils";
import SideModal from "@/components/SideModal";
import ProductModal from "./Partials/ProductModal";
import Swal from "sweetalert2";

export default function Index({ items, categories, filters, active_branch }) {
  const [activeTab, setActiveTab] = useState(filters.type || "product");
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(filters.category_id || "");
  
  const [sorting, setSorting] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  
  // ESTADOS PARA MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sincronizar con URL cuando cambien los filtros
  useEffect(() => {
    const timer = setTimeout(() => {
        router.get(route('products.index'), {
            type: activeTab,
            search: searchTerm,
            category_id: selectedCategory
        }, {
            preserveState: true,
            replace: true,
            only: ['items']
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchTerm, selectedCategory]);

  const openForm = (prod = null) => {
    setSelectedProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = (prod) => {
    Swal.fire({
      title: `¿Eliminar ${activeTab === 'product' ? 'Producto' : 'Servicio'}?`,
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
    const detail = product.product_detail;
    
    if (product.type === 'service' || !detail?.manage_stock) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
          N/A
        </span>
      );
    }

    const stock = detail.stock || 0;
    const critical = detail.critical_stock || 0;

    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-red-50 text-red-600 uppercase tracking-widest border border-red-100">
          Agotado
        </span>
      );
    }
    if (stock <= critical) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest border border-amber-100 animate-pulse">
          Crítico: {stock}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black bg-green-50 text-green-600 uppercase tracking-widest border border-green-100">
        {stock} Unid.
      </span>
    );
  };

  const columns = useMemo(() => [
    {
        accessorKey: "name",
        header: "Detalle del Item",
        cell: ({ row }) => (
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0 transform rotate-3 ${row.original.type === 'product' ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-primary'}`}>
                    {row.original.type === 'product' ? <Package className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight truncate leading-none mb-1.5">{row.original.name}</p>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-brand-gray opacity-60 uppercase tracking-widest">REF: {row.original.sku || 'S/N'}</span>
                        {row.original.category && (
                            <span className="flex items-center gap-1 text-[8px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                <Tag className="w-2 h-2" /> {row.original.category.name}
                            </span>
                        )}
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
            {row.original.is_exempt ? (
              <span className="text-[8px] text-brand-primary uppercase font-black tracking-widest bg-brand-secondary/10 px-1.5 py-0.5 rounded border border-brand-secondary/20">Exento</span>
            ) : (
              <span className="text-[8px] text-amber-600 uppercase font-black tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Afecto IVA</span>
            )}
          </div>
        ),
    },
    {
        id: "stock",
        header: activeTab === 'product' ? "Existencias" : "Control",
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
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => openForm(row.original)}
              className="p-2 text-brand-primary bg-brand-secondary/5 border border-brand-secondary/10 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-90 shadow-sm"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
        enableSorting: false,
    },
  ], [activeTab]);

  const tableData = useMemo(() => {
    if (items?.data) return items.data;
    if (Array.isArray(items)) return items;
    return [];
  }, [items]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, globalFilter: searchTerm, pagination: { pageSize, pageIndex } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
  });

  return (
    <AuthenticatedLayout>
      <Head title={`Catálogo de ${activeTab === 'product' ? 'Productos' : 'Servicios'}`} />

      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50 space-y-8">
        
        {/* HEADER HERO PREMIUM */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl transform rotate-3 ${activeTab === 'product' ? 'bg-brand-primary text-white shadow-brand-primary/20' : 'bg-brand-secondary text-brand-primary shadow-brand-secondary/20'}`}>
                {activeTab === 'product' ? <Boxes className="w-8 h-8" /> : <Monitor className="w-8 h-8" />}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">
                    {activeTab === 'product' ? 'Inventario de Productos' : 'Catálogo de Servicios'}
                </h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-brand-primary opacity-40" /> 
                  {activeTab === 'product' ? 'Control de Existencias & Insumos' : 'Gestión de Prestaciones & Servicios'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1">
                    <button 
                        onClick={() => setActiveTab('product')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'product' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Productos
                    </button>
                    <button 
                        onClick={() => setActiveTab('service')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'service' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Servicios
                    </button>
                </div>

                <a 
                    href={route('categories.index')}
                    className="flex items-center gap-3 px-6 py-4 font-black uppercase tracking-widest text-[10px] text-gray-500 transition-all bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 active:scale-95"
                >
                    <Layers className="w-4 h-4" /> Categorías
                </a>

                <button
                    onClick={() => openForm()}
                    className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Nuevo {activeTab === 'product' ? 'Producto' : 'Servicio'}
                </button>
            </div>
          </div>
        </div>

        {/* BUSQUEDA Y CATEGORIAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl relative">
                <Search className="absolute w-4 h-4 text-brand-gray transform -translate-y-1/2 left-8 top-1/2" />
                <input
                    type="text"
                    placeholder={`Buscar por nombre, SKU o código...`}
                    className="w-full py-3 pl-12 pr-4 border-none bg-transparent text-sm font-bold transition-all outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="lg:col-span-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-3">
                <Layers className="w-4 h-4 text-brand-primary opacity-40 shrink-0" />
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border-none bg-transparent text-xs font-black uppercase tracking-widest text-gray-700 focus:ring-0 cursor-pointer"
                >
                    <option value="">Todas las Categorías</option>
                    {categories.map(cat => (
                        <React.Fragment key={cat.id}>
                            <option value={cat.id}>{cat.name}</option>
                            {cat.children?.map(sub => (
                                <option key={sub.id} value={sub.id}>&nbsp;&nbsp;↳ {sub.name}</option>
                            ))}
                        </React.Fragment>
                    ))}
                </select>
            </div>
        </div>

        {/* TABLA TANSTACK */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
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
                    <td colSpan={columns.length} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                            <div className="p-6 bg-gray-50 rounded-[2.5rem]">
                                <Package className="w-12 h-12" />
                            </div>
                            <p className="enterprise-label">No hay {activeTab === 'product' ? 'productos' : 'servicios'} encontrados</p>
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
                total={items.total || (items.data || items).length}
                pageSize={pageSize}
                setPageSize={setPageSize}
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
            categories={categories}
            initialType={activeTab}
            activeBranch={active_branch}
        />
      </SideModal>

    </AuthenticatedLayout>
  );
}
