import React, { useState, useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ProductoDetalle from "@/Components/ProductoDetalle"; // Asegúrate de importar el componente ProductoDetalle
import { tiposDocumento } from "@/constants/documentos";
import axios from "axios";

export default function CrearBoleta({ pacientes = [], productos = [] }) {
  const [success, setSuccess] = useState(null);
  const [loadingReferencia, setLoadingReferencia] = useState(false);

  // Estados para búsqueda
  const [searchPaciente, setSearchPaciente] = useState("");
  const [searchProducto, setSearchProducto] = useState("");
  const [showPacientes, setShowPacientes] = useState(false);
  const [showProductos, setShowProductos] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(null);

  const { data, setData, errors, post, processing, reset } = useForm({
    tipo_documento: 39, // Por defecto Boleta Electrónica
    receptor: {
      name: "",
      rut: "",
      giro: "",
      direccion: "",
      comuna: "",
    },
    detalles: [{ nombre: "", cantidad: 1, precio: "" }],
    // Campos adicionales para diferentes tipos de documentos
    condiciones_pago: "",
    fecha_vencimiento: "",
    direccion_entrega: "",
    transportista: "",
    fecha_entrega: "",
    documento_referencia: "",
    motivo: "",
    // Campos para notas de crédito/débito
    folio_referencia: "",
    fecha_referencia: "",
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

  // Funciones helper para determinar qué campos mostrar
  const esFactura = () => [33, 34, 43, 46].includes(data.tipo_documento);
  const esGuiaDespacho = () => data.tipo_documento === 52;
  const esNotaCreditoDebito = () => [56, 61].includes(data.tipo_documento);
  const requiereRut = () => esFactura() || esNotaCreditoDebito();

  // Función para buscar datos del documento referenciado
  const handleFolioBlur = async () => {
    if (!data.folio_referencia || !esNotaCreditoDebito()) return;

    setLoadingReferencia(true);
    try {
      const response = await axios.get(
        `/dte/lookup/${data.folio_referencia}`
      );
      const { client, items, issue_date } = response.data;

      // Actualizar datos del formulario
      setData((prev) => ({
        ...prev,
        receptor: {
          name: client.razonSocial || "",
          rut: client.rut || "",
          giro: client.giro || "",
          direccion: client.direccion || "",
          comuna: client.comuna || "",
        },
        detalles: items.map(item => ({
             nombre: item.nombre,
             cantidad: item.cantidad,
             precio: item.precio
        })),
        fecha_referencia: issue_date || "",
      }));

    } catch (error) {
      console.error("Error buscando folio:", error);
      // Opcional: Mostrar alerta si no encuentra
      // alert("No se encontró el documento con ese folio");
    } finally {
      setLoadingReferencia(false);
    }
  };

  // Función para validar si el formulario está completo según el tipo de documento
  const formularioCompleto = () => {
    // Validaciones básicas que siempre se requieren
    const datosBasicosCompletos =
      data.receptor.name.trim() !== "" &&
      data.detalles.length > 0 &&
      data.detalles.every(
        (item) =>
          item.nombre.trim() !== "" && item.cantidad > 0 && item.precio > 0
      );

    if (!datosBasicosCompletos) return false;

    // Validaciones específicas según tipo de documento
    switch (data.tipo_documento) {
      case 39: // Boleta Electrónica
      case 41: // Boleta Exenta Electrónica
        // Solo requiere datos básicos
        return true;

      case 33: // Factura Electrónica
      case 34: // Factura Exenta Electrónica
      case 43: // Liquidación Factura Electrónica
      case 46: // Factura de Compra Electrónica
        // Requiere RUT válido
        return (
          data.receptor.rut.trim() !== "" &&
          data.receptor.rut !== "66.666.666-6"
        );

      case 52: // Guía de Despacho Electrónica
        // Requiere dirección de entrega (opcional pero recomendado)
        return true;

      case 56: // Nota de Débito Electrónica
      case 61: // Nota de Crédito Electrónica
        // Requiere RUT válido, folio de referencia y motivo
        return (
          data.receptor.rut.trim() !== "" &&
          data.receptor.rut !== "66.666.666-6" &&
          data.folio_referencia.trim() !== "" &&
          data.motivo.trim() !== ""
        );

      default:
        return false;
    }
  };

  // Función para obtener mensaje de validación
  const obtenerMensajeValidacion = () => {
    if (formularioCompleto()) return null;

    const mensajes = [];

    // Validaciones básicas
    if (data.receptor.name.trim() === "") {
      mensajes.push("Nombre del receptor es obligatorio");
    }

    if (data.detalles.length === 0) {
      mensajes.push("Debe agregar al menos un producto/servicio");
    } else {
      data.detalles.forEach((item, index) => {
        if (item.nombre.trim() === "") {
          mensajes.push(`Producto ${index + 1}: nombre es obligatorio`);
        }
        if (item.cantidad <= 0) {
          mensajes.push(`Producto ${index + 1}: cantidad debe ser mayor a 0`);
        }
        if (item.precio <= 0) {
          mensajes.push(`Producto ${index + 1}: precio debe ser mayor a 0`);
        }
      });
    }

    // Validaciones específicas por tipo
    if (
      requiereRut() &&
      (data.receptor.rut.trim() === "" || data.receptor.rut === "66.666.666-6")
    ) {
      mensajes.push("RUT válido es obligatorio para este tipo de documento");
    }

    if (esNotaCreditoDebito()) {
      if (data.folio_referencia.trim() === "") {
        mensajes.push("Folio del documento referenciado es obligatorio");
      }
      if (data.motivo.trim() === "") {
        mensajes.push("Motivo es obligatorio para notas de crédito/débito");
      }
    }

    return mensajes.length > 0 ? mensajes.join(", ") : null;
  };

  const handleChange = (section, index = null, field, value) => {
    setData((prev) => {
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
    setData((prev) => ({
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
    const newDetalles = [...data.detalles];
    newDetalles[index] = {
      nombre: producto.name,
      cantidad: 1,
      precio: producto.precio || 0,
    };
    setData((prev) => ({
      ...prev,
      detalles: newDetalles,
    }));
    setSearchProducto("");
    setShowProductos(false);
    setActiveProductIndex(null);
  };

  const addDetalle = () => {
    setData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { nombre: "", cantidad: 1, precio: "" }],
    }));
  };

  const removeDetalle = (index) => {
    setData((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    post("/boletas", {
      onSuccess: (page) => {
        const responseData = page.props.flash?.success || page.props;
        setSuccess({
          folio: responseData.folio,
          total: responseData.total,
          url_xml: responseData.url_xml,
        });
        reset(); // Limpia el formulario automáticamente
      },
    });
  };

  const total = data.detalles.reduce((sum, item) => {
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
      <Head title="Emitir Documento Tributario Electrónico" />

      <div className="p-6">
        <div className="mx-auto">
          <div className="p-6 bg-white rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              Emitir Documento Tributario Electrónico
            </h1>

            {success ? (
              <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800">
                  ✅ Documento emitido con éxito
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
                  Crear otro
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Tipo de Documento */}
                <div className="p-4 mb-6 rounded-lg bg-blue-50 border border-blue-200">
                  <h2 className="mb-4 text-lg font-semibold text-blue-800">
                    📄 Tipo de Documento Tributario
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-blue-700">
                        Seleccionar Tipo de DTE *
                      </label>
                      <select
                        value={data.tipo_documento}
                        onChange={(e) =>
                          setData("tipo_documento", parseInt(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {tiposDocumento.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nombre} (Tipo {tipo.id})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-blue-600">
                        {
                          tiposDocumento.find(
                            (t) => t.id === data.tipo_documento
                          )?.descripcion
                        }
                      </p>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          Tipo {data.tipo_documento}
                        </div>
                        <div className="text-sm text-blue-500">
                          {
                            tiposDocumento.find(
                              (t) => t.id === data.tipo_documento
                            )?.nombre
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receptor/Paciente */}
                <div className="p-4 mb-6 rounded-lg bg-gray-50">
                  <h2 className="mb-4 text-lg font-semibold text-gray-700">
                    Datos del Receptor
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
                        Nombre *{" "}
                        {errors["receptor.name"] && (
                          <span className="text-xs text-red-500 ml-1">
                            {errors["receptor.name"]}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={data.receptor.name}
                        onChange={(e) =>
                          handleChange("receptor", null, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        RUT{" "}
                        {requiereRut() && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder="12.345.678-9"
                        value={data.receptor.rut}
                        onChange={(e) =>
                          handleChange("receptor", null, "rut", e.target.value)
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                          requiereRut() &&
                          (data.receptor.rut.trim() === "" ||
                            data.receptor.rut === "66.666.666-6")
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      />
                      {requiereRut() &&
                        (data.receptor.rut.trim() === "" ||
                          data.receptor.rut === "66.666.666-6") && (
                          <p className="mt-1 text-xs text-red-500">
                            Este tipo de documento requiere RUT válido
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Giro
                      </label>
                      <input
                        type="text"
                        value={data.receptor.giro}
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
                        value={data.receptor.comuna}
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
                        value={data.receptor.direccion}
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

                {/* Campos adicionales para Facturas */}
                {esFactura() && (
                  <div className="p-4 mb-6 rounded-lg bg-green-50 border border-green-200">
                    <h2 className="mb-4 text-lg font-semibold text-green-800">
                      📋 Información Adicional para Facturas
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-green-700">
                          Condiciones de Pago
                        </label>
                        <select
                          value={data.condiciones_pago}
                          onChange={(e) =>
                            setData("condiciones_pago", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="contado">Contado</option>
                          <option value="30dias">30 días</option>
                          <option value="60dias">60 días</option>
                          <option value="90dias">90 días</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-green-700">
                          Fecha de Vencimiento
                        </label>
                        <input
                          type="date"
                          value={data.fecha_vencimiento}
                          onChange={(e) =>
                            setData("fecha_vencimiento", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos adicionales para Guías de Despacho */}
                {esGuiaDespacho() && (
                  <div className="p-4 mb-6 rounded-lg bg-orange-50 border border-orange-200">
                    <h2 className="mb-4 text-lg font-semibold text-orange-800">
                      🚚 Información de Despacho
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="block mb-1 text-sm font-medium text-orange-700">
                          Dirección de Entrega
                        </label>
                        <input
                          type="text"
                          placeholder="Dirección específica de entrega..."
                          value={data.direccion_entrega}
                          onChange={(e) =>
                            setData("direccion_entrega", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-orange-700">
                          Transportista
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre de la empresa transportista"
                          value={data.transportista}
                          onChange={(e) =>
                            setData("transportista", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-orange-700">
                          Fecha de Entrega Estimada
                        </label>
                        <input
                          type="date"
                          value={data.fecha_entrega}
                          onChange={(e) =>
                            setData("fecha_entrega", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos adicionales para Notas de Crédito/Débito */}
                {esNotaCreditoDebito() && (
                  <div className="p-4 mb-6 rounded-lg bg-purple-50 border border-purple-200">
                    <h2 className="mb-4 text-lg font-semibold text-purple-800">
                      📝 Información de Referencia
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-purple-700">
                          Folio del Documento Referenciado *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Folio del documento original"
                            value={data.folio_referencia}
                            onChange={(e) =>
                              setData("folio_referencia", e.target.value)
                            }
                            onBlur={handleFolioBlur}
                            disabled={loadingReferencia}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                              data.folio_referencia.trim() === ""
                                ? "border-red-300 focus:ring-red-500"
                                : "border-purple-300 focus:ring-purple-500"
                            } ${loadingReferencia ? "bg-gray-100" : ""}`}
                            required
                          />
                          {loadingReferencia && (
                            <div className="absolute right-3 top-2.5">
                              <svg className="w-4 h-4 text-purple-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        {data.folio_referencia.trim() === "" && !loadingReferencia && (
                          <p className="mt-1 text-xs text-red-500">
                            Folio de referencia es obligatorio
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-purple-700">
                          Fecha del Documento Referenciado
                        </label>
                        <input
                          type="date"
                          value={data.fecha_referencia}
                          onChange={(e) =>
                            setData("fecha_referencia", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-1 text-sm font-medium text-purple-700">
                          Motivo{" "}
                          {data.tipo_documento === 56
                            ? "del Cargo"
                            : "del Descuento"}{" "}
                          *
                        </label>
                        <select
                          value={data.motivo}
                          onChange={(e) => setData("motivo", e.target.value)}
                          className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 bg-white ${
                            data.motivo.trim() === ""
                              ? "border-red-300 focus:ring-red-500"
                              : "border-purple-300 focus:ring-purple-500"
                          }`}
                          required
                        >
                          <option value="">Seleccionar motivo...</option>
                          {data.tipo_documento === 56 ? (
                            <>
                              <option value="intereses">
                                Intereses por mora
                              </option>
                              <option value="gastos">Gastos de cobranza</option>
                              <option value="comisiones">
                                Comisiones bancarias
                              </option>
                              <option value="otros">Otros cargos</option>
                            </>
                          ) : (
                            <>
                              <option value="descuento">
                                Descuento comercial
                              </option>
                              <option value="devolucion">
                                Devolución de mercadería
                              </option>
                              <option value="error">
                                Error en facturación
                              </option>
                              <option value="otros">Otros descuentos</option>
                            </>
                          )}
                        </select>
                        {data.motivo.trim() === "" && (
                          <p className="mt-1 text-xs text-red-500">
                            Motivo es obligatorio para notas de crédito/débito
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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

                  {data.detalles.map((item, index) => (
                    <ProductoDetalle
                      key={index}
                      item={item}
                      index={index}
                      productos={productos}
                      onUpdate={(index, updatedItem) => {
                        setData((prev) => ({
                          ...prev,
                          detalles: prev.detalles.map((d, i) =>
                            i === index ? updatedItem : d
                          ),
                        }));
                      }}
                      onRemove={removeDetalle}
                      canRemove={data.detalles.length > 1}
                    />
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

                {/* Mensaje de validación */}
                {!formularioCompleto() && obtenerMensajeValidacion() && (
                  <div className="p-4 mb-6 border border-amber-200 rounded-lg bg-amber-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-amber-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          ⚠️ Datos requeridos incompletos
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>{obtenerMensajeValidacion()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={processing || !formularioCompleto()}
                    className={`px-6 py-2 font-medium rounded transition-colors ${
                      formularioCompleto()
                        ? "text-white bg-blue-600 hover:bg-blue-700"
                        : "text-gray-400 bg-gray-300 cursor-not-allowed"
                    } ${processing ? "opacity-70" : ""}`}
                  >
                    {processing ? "Emitiendo..." : "Emitir Documento"}
                  </button>
                  <button
                    type="button"
                    onClick={() => reset()}
                    className="px-6 py-2 font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    Limpiar
                  </button>
                </div>

                {/* Indicador de estado del formulario */}
                <div className="mt-4 text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      formularioCompleto()
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {formularioCompleto() ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Formulario completo - Listo para emitir
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Completar datos requeridos
                      </>
                    )}
                  </div>
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
