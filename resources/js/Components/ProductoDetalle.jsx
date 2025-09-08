import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

const ProductoDetalle = ({
  item,
  index,
  productos,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(
    (producto) =>
      producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.codigo && producto.codigo.includes(searchTerm))
  );

  const seleccionarProducto = (producto) => {
    onUpdate(index, {
      nombre: producto.name,
      cantidad: item.cantidad,
      precio: producto.base_price || 0,
    });
    setSearchTerm("");
    setShowSearch(false);
  };

  // Cerrar búsqueda al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Barra de búsqueda superior */}
      <div className="p-3 border-b border-gray-200" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />

          {/* Resultados de búsqueda */}
          {showSearch && productosFiltrados.length > 0 && searchTerm && (
            <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  onClick={() => seleccionarProducto(producto)}
                  className="px-4 py-2 border-b cursor-pointer hover:bg-gray-50 last:border-b-0"
                >
                  <div className="font-medium text-gray-700">
                    {producto.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {producto.codigo && `Código: ${producto.codigo} | `}
                    Precio: $
                    {new Intl.NumberFormat("es-CL").format(
                      producto.base_price || 0
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detalles del producto */}
      <div className="grid grid-cols-12 gap-3 p-3">
        <div className="col-span-6">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={item.nombre}
            onChange={(e) =>
              onUpdate(index, { ...item, nombre: e.target.value })
            }
            className={`w-full px-3 py-2 text-sm border rounded ${
              item.nombre.trim() === "" ? "border-red-300" : "border-gray-300"
            }`}
            readOnly
          />
          {item.nombre.trim() === "" && (
            <p className="mt-1 text-xs text-red-500">Nombre es obligatorio</p>
          )}
        </div>

        <div className="col-span-2">
          <input
            type="number"
            placeholder="Cantidad"
            value={item.cantidad}
            onChange={(e) =>
              onUpdate(index, {
                ...item,
                cantidad: parseInt(e.target.value) || 1,
              })
            }
            className={`w-full px-3 py-2 text-sm border rounded ${
              item.cantidad <= 0 ? "border-red-300" : "border-gray-300"
            }`}
            min="1"
          />
          {item.cantidad <= 0 && (
            <p className="mt-1 text-xs text-red-500">Cantidad mayor a 0</p>
          )}
        </div>

        <div className="col-span-3">
          <input
            type="number"
            placeholder="Precio"
            value={item.precio}
            onChange={(e) =>
              onUpdate(index, {
                ...item,
                precio: parseFloat(e.target.value) || 0,
              })
            }
            className={`w-full px-3 py-2 text-sm border rounded ${
              item.precio <= 0 ? "border-red-300" : "border-gray-300"
            }`}
            min="0"
          />
          {item.precio <= 0 && (
            <p className="mt-1 text-xs text-red-500">Precio mayor a 0</p>
          )}
        </div>

        {canRemove && (
          <div className="flex items-center justify-center col-span-1">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-red-500 rounded-full hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductoDetalle;
