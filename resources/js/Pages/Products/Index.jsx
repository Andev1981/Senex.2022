import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Barcode,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Función auxiliar para formatear pesos
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount);
};

export default function Index({ products, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Lógica de búsqueda con debounce (espera que termines de escribir)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        router.get(
          route("products.index"),
          { search: searchTerm },
          { preserveState: true, replace: true }
        );
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      router.delete(route("products.destroy", id));
    }
  };

  // Lógica del Semáforo de Stock
  const getStockBadge = (product) => {
    if (!product.manage_stock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Infinito
        </span>
      );
    }

    if (product.stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Agotado
        </span>
      );
    }

    if (product.stock <= product.critical_stock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Crítico ({product.stock})
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {product.stock} Unid.
      </span>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Inventario de Productos" />

      <div className="py-12">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Header y Acciones */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-7 h-7 text-indigo-600" />
                Inventario
              </h2>
              <p className="text-sm text-gray-500">
                Gestiona tus insumos y productos para la venta.
              </p>
            </div>

            <Link
              href={route("products.create")}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              <Plus className="w-5 h-5" /> Nuevo Producto
            </Link>
          </div>

          {/* Filtros y Buscador */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o código de barras..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Aquí podrías agregar más filtros (Select Categoría, etc) */}
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <th className="p-4">Producto</th>
                    <th className="p-4">Códigos</th>
                    <th className="p-4 text-right">Precio Venta</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.data.length > 0 ? (
                    products.data.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-gray-800">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-xs text-gray-400 truncate max-w-[200px]">
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {product.sku && (
                              <span className="block text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded w-fit">
                                SKU: {product.sku}
                              </span>
                            )}
                            {product.barcode && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Barcode className="w-3 h-3" />
                                {product.barcode}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(product.price)}
                          </div>
                          {product.is_exempt && (
                            <div className="text-[10px] text-gray-400 uppercase font-bold">
                              Exento
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {getStockBadge(product)}
                        </td>
                        <td className="p-4 text-center">
                          {product.is_active ? (
                            <span className="text-xs font-bold text-green-600">
                              Activo
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={route("products.edit", product.id)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Package className="w-12 h-12 mb-3 text-gray-200" />
                          <p className="text-lg font-medium">
                            No se encontraron productos
                          </p>
                          <p className="text-sm">
                            Intenta ajustar tu búsqueda o crea uno nuevo.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {products.links && products.links.length > 3 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Mostrando {products.from} a {products.to} de {products.total}{" "}
                  resultados
                </div>
                <div className="flex gap-1">
                  {products.links.map((link, key) => (
                    <Link
                      key={key}
                      href={link.url || "#"}
                      preserveState
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        link.active
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                      } ${!link.url && "opacity-50 cursor-not-allowed"}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
