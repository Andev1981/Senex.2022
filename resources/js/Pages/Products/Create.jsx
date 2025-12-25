import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Package, Save, Barcode, DollarSign } from "lucide-react";

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    sku: "",
    barcode: "",
    cost_price: "",
    price: "",
    stock: "0",
    critical_stock: "5",
    is_exempt: false,
    manage_stock: true,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("products.store"));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Nuevo Producto" />
      <div className="py-12">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100">
            <div className="p-6 bg-white border-b border-gray-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" /> Nuevo Producto /
                Item
              </h2>
            </div>

            <form
              onSubmit={submit}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Identificación */}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  className="w-full mt-1 border-gray-300 rounded-lg"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && (
                  <div className="text-red-500 text-xs">{errors.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Código SKU (Interno)
                </label>
                <input
                  type="text"
                  className="w-full mt-1 border-gray-300 rounded-lg"
                  value={data.sku}
                  onChange={(e) => setData("sku", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-1">
                  <Barcode className="w-4 h-4" /> Código de Barras
                </label>
                <input
                  type="text"
                  className="w-full mt-1 border-gray-300 rounded-lg"
                  value={data.barcode}
                  onChange={(e) => setData("barcode", e.target.value)}
                />
              </div>

              {/* Precios */}
              <div className="p-4 bg-gray-50 rounded-lg col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200">
                <div>
                  <label className="block text-sm font-bold text-gray-600">
                    Costo Neto (Compra)
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      $
                    </div>
                    <input
                      type="number"
                      className="w-full pl-7 border-gray-300 rounded-lg"
                      value={data.cost_price}
                      onChange={(e) => setData("cost_price", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-black text-indigo-700">
                    Precio Venta (PVP)
                  </label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      $
                    </div>
                    <input
                      type="number"
                      className="w-full pl-7 border-indigo-300 rounded-lg font-bold"
                      value={data.price}
                      onChange={(e) => setData("price", e.target.value)}
                    />
                  </div>
                  {errors.price && (
                    <div className="text-red-500 text-xs">{errors.price}</div>
                  )}
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-indigo-600"
                      checked={data.is_exempt}
                      onChange={(e) => setData("is_exempt", e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Producto Exento (Sin IVA)
                    </span>
                  </label>
                </div>
              </div>

              {/* Inventario */}
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border-gray-300 rounded-lg"
                  value={data.stock}
                  onChange={(e) => setData("stock", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Stock Crítico (Alerta)
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border-gray-300 rounded-lg"
                  value={data.critical_stock}
                  onChange={(e) => setData("critical_stock", e.target.value)}
                />
              </div>

              <div className="col-span-2 pt-4 flex justify-end gap-3">
                <Link
                  href={route("products.index")}
                  className="px-4 py-2 bg-white border rounded-lg text-gray-700"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
