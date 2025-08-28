import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function CrearBoleta({ pacientes = [], productos = [] }) {
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para búsqueda
  const [searchPaciente, setSearchPaciente] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [showPacientes, setShowPacientes] = useState(false);
  const [showProductos, setShowProductos] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(null);

  const [formData, setFormData] = useState({
    receptor: {
      name: "",
      rut: "",
      giro: "",
      direccion: "",
      comuna: "",
    },
    detalles: [{ nombre: "", cantidad: 1, precio: "" }],
  });

  // Filtrar pacientes según búsqueda
  const pacientesFiltrados = pacientes.filter(
    (paciente) =>
      paciente.name?.toLowerCase().includes(searchPaciente.toLowerCase()) ||
      paciente.rut?.includes(searchPaciente)
  );

  // Filtrar productos según búsqueda
  const productosFiltrados = productos.filter(
    (producto) =>
      producto.name.toLowerCase().includes(searchProducto.toLowerCase()) ||
      (producto.codigo && producto.codigo.includes(searchProducto))
  );

  const handleChange = (section, index = null, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (index !== null && field) {
        updated[section][index][field] = value;
      } else if (section && field) {
        updated[section][field] = value;
      }
      return updated;
    });
  };

  const seleccionarPaciente = (paciente) => {
    setFormData((prev) => ({
      ...prev,
      receptor: {
        name: paciente.name,
        rut: paciente.rut,
        giro: paciente.giro || "",
        direccion: paciente.address.address || "",
        comuna: paciente.address.comuna.name || "",
      },
    }));
    setSearchPaciente("");
    setShowPacientes(false);
  };

  const seleccionarProducto = (producto, index) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.detalles[index] = {
        name: producto.name,
        cantidad: 1,
        precio: producto.precio || 0,
      };
      return updated;
    });
    setSearchProducto("");
    setShowProductos(false);
    setActiveProductIndex(null);
  };

  const addDetalle = () => {
    setFormData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { nombre: "", cantidad: 1, precio: "" }],
    }));
  };

  const removeDetalle = (index) => {
    setFormData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(null);

    router.post(
      "/boletas",
      {
        ...formData,
      },
      {
        onSuccess: (page) => {
          const data = page.props.flash?.success || page.props;
          setSuccess({
            folio: data.folio,
            total: data.total,
            url_xml: data.url_xml,
          });
        },
        onError: (errors) => {
          setErrors(errors);
        },
        onFinish: () => setLoading(false),
      }
    );
  };

  const total = formData.detalles.reduce((sum, item) => {
    return (
      sum + (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio) || 0)
    );
  }, 0);

  // Cerrar dropdowns cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-pacientes")) {
        setShowPacientes(false);
      }
      if (!event.target.closest(".dropdown-productos")) {
        setShowProductos(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AuthenticatedLayout>
      <Head title="Emitir Boleta Electrónica" />

      <div className="p-6">
        <div className="mx-auto">
          <div className="p-6 bg-white rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              Emitir Boleta Electrónica
            </h1>

            {success ? (
              <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800">
                  ✅ Boleta emitida con éxito
                </h3>
                <p className="mt-1 text-green-700">
                  Folio: <strong>{success.folio}</strong> | Total:{" "}
                  <strong>
                    ${new Intl.NumberFormat("es-CL").format(success.total)}
                  </strong>
                </p>
                <a
                  href={success.url_xml}
                  download
                  className="inline-block px-4 py-2 mt-3 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  📥 Descargar XML
                </a>
                <button
                  onClick={() => setSuccess(null)}
                  className="ml-3 text-sm text-gray-600 hover:text-gray-800"
                >
                  Crear otra
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Receptor/Paciente */}
                <div className="p-4 mb-6 rounded-lg bg-gray-50">
                  <h2 className="mb-4 text-lg font-semibold text-gray-700">
                    Datos del Paciente
                  </h2>

                  {/* Buscador de pacientes */}
                  <div className="relative mb-4 dropdown-pacientes">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Buscar Paciente
                    </label>
                    <input
                      type="text"
                      placeholder="Buscar por nombre o RUT..."
                      value={searchPaciente}
                      onChange={(e) => {
                        setSearchPaciente(e.target.value);
                        setShowPacientes(e.target.value.length > 0);
                      }}
                      onFocus={() =>
                        searchPaciente.length > 0 && setShowPacientes(true)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {showPacientes && pacientesFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48">
                        {pacientesFiltrados.map((paciente) => (
                          <div
                            key={paciente.id}
                            onClick={() => seleccionarPaciente(paciente)}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                          >
                            <div className="font-medium">{paciente.name}</div>
                            <div className="text-sm text-gray-500">
                              {paciente.rut}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.receptor.name}
                        onChange={(e) =>
                          handleChange("receptor", null, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors["receptor.name"] && (
                        <span className="text-xs text-red-500">
                          {errors["receptor.name"]}
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        RUT
                      </label>
                      <input
                        type="text"
                        placeholder="12.345.678-9"
                        value={formData.receptor.rut}
                        onChange={(e) =>
                          handleChange("receptor", null, "rut", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Giro
                      </label>
                      <input
                        type="text"
                        value={formData.receptor.giro}
                        onChange={(e) =>
                          handleChange("receptor", null, "giro", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Comuna
                      </label>
                      <input
                        type="text"
                        value={formData.receptor.comuna}
                        onChange={(e) =>
                          handleChange(
                            "receptor",
                            null,
                            "comuna",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formData.receptor.direccion}
                        onChange={(e) =>
                          handleChange(
                            "receptor",
                            null,
                            "direccion",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles/Productos */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-700">
                      Productos/Servicios
                    </h2>
                    <button
                      type="button"
                      onClick={addDetalle}
                      className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                    >
                      + Agregar
                    </button>
                  </div>

                  {formData.detalles.map((item, index) => (
                    <div key={index} className="p-3 mb-3 rounded-lg bg-gray-50">
                      {/* Buscador de productos para este item */}
                      <div className="relative mb-2 dropdown-productos">
                        <input
                          type="text"
                          placeholder="Buscar producto/servicio..."
                          value={
                            activeProductIndex === index ? searchProducto : ""
                          }
                          onChange={(e) => {
                            setSearchProducto(e.target.value);
                            setActiveProductIndex(index);
                            setShowProductos(e.target.value.length > 0);
                          }}
                          onFocus={() => {
                            setActiveProductIndex(index);
                            if (searchProducto.length > 0)
                              setShowProductos(true);
                          }}
                          className="w-full px-2 py-1 mb-2 text-sm border border-gray-300 rounded"
                        />

                        {showProductos &&
                          activeProductIndex === index &&
                          productosFiltrados.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48">
                              {productosFiltrados.map((producto) => (
                                <div
                                  key={producto.id}
                                  onClick={() =>
                                    seleccionarProducto(producto, index)
                                  }
                                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                                >
                                  <div className="font-medium">
                                    {producto.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {producto.codigo &&
                                      `Código: ${producto.codigo} | `}
                                    Precio: $
                                    {new Intl.NumberFormat("es-CL").format(
                                      producto.precio || 0
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Nombre del producto"
                            value={item.name}
                            onChange={(e) =>
                              handleChange(
                                "detalles",
                                index,
                                "nombre",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                        <div className="w-20">
                          <input
                            type="number"
                            placeholder="Cant"
                            value={item.cantidad}
                            onChange={(e) =>
                              handleChange(
                                "detalles",
                                index,
                                "cantidad",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            min="1"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Precio"
                            value={item.precio}
                            onChange={(e) =>
                              handleChange(
                                "detalles",
                                index,
                                "precio",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            min="0"
                          />
                        </div>
                        {formData.detalles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDetalle(index)}
                            className="text-xl text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
                  <p className="text-lg">
                    <strong>
                      Total: ${new Intl.NumberFormat("es-CL").format(total)}
                    </strong>
                  </p>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-70"
                  >
                    {loading ? "Emitiendo..." : "Emitir Boleta"}
                  </button>
                  <Link
                    href="/boletas/crear"
                    className="px-6 py-2 font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    Limpiar
                  </Link>
                </div>

                {Object.keys(errors).length > 0 && (
                  <div className="p-3 mt-4 border border-red-200 rounded bg-red-50">
                    <p className="text-sm text-red-700">
                      {Object.values(errors).join(". ")}
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
