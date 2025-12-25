import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Users,
  Download,
  Send,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  DollarSign,
  FileCheck,
  Trash2,
} from "lucide-react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { DTES_TYPES, getDtesConfigByCode } from "@/constants/dtesTypes";
import { DTES_STATUSES } from "@/constants/dtesStatuses";
import HeaderDocuments from "./partials/HeaderDocuments";
import List from "./partials/List";

export default function IndexDocuments({ invoices }) {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  // 🎯 VERIFICAR: La desestructuración debe estar al principio
  const { data, setData, post, processing, errors, reset } = useForm({
    dte_type: "",
    issue_date: new Date().toISOString().split("T")[0],
    patient: {
      rut: "",
      name: "",
      last_name: "",
    },
    items: [],
  });

  // --- Helpers ---
  const calculateItemTotal = (item) => {
    const subtotal_clp =
      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const discountAmount =
      subtotal_clp * ((Number(item.discount_clp) || 0) / 100);
    return Math.max(0, subtotal_clp - discountAmount);
  };

  const calculateTotals = () => {
    const subtotal_clp = data.items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
    const docType = DTES_TYPES.find((dt) => dt.code === data.dte_type);
    const iva =
      docType && !docType.exento ? Math.round(subtotal_clp * 0.19) : 0;
    const total = subtotal_clp + iva;
    return { subtotal_clp, iva, total };
  };

  // --- Create ---
  const addItem = () =>
    setData((f) => ({
      ...f,
      items: [
        ...f.items,
        { description: "", quantity: 1, unitPrice: 0, discount_clp: 0 },
      ],
    }));

  const removeItem = (index) =>
    setData((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));

  const updateItem = (index, field, value) =>
    setData((f) => {
      const items = [...f.items];
      items[index][field] = value;
      return { ...f, items };
    });

  const handleCreateDocument = () => {
    const { subtotal_clp, iva, total } = calculateTotals();
    const docType = DTES_TYPES.find((dt) => dt.code === data.type);
    const newDoc = {
      id: invoices.length + 1,
      type: data.type,
      typeName: docType.name,
      number: Math.floor(Math.random() * 10000),
      date: data.date,
      client: data.client,
      items: data.items,
      subtotal_clp,
      iva,
      total,
      status: "Emitido",
      folio: `${data.type.toUpperCase().substring(0, 2)}-2024-${String(
        Math.floor(Math.random() * 10000)
      ).padStart(6, "0")}`,
      ted: Math.random().toString(36).substring(2, 15),
      paymentMethod: data.paymentMethod,
      expirationDate: data.expirationDate || null,
      referenceDoc: data.referenceDoc || null,
      reason: data.reason || null,
    };
    setDocuments((docs) => [newDoc, ...docs]);
    setActiveTab("list");
    setData({
      type: "",
      date: new Date().toISOString().split("T")[0],
      expirationDate: "",
      client: {
        rut: "",
        razonSocial: "",
        giro: "",
        direccion: "",
        comuna: "",
        ciudad: "Santiago",
      },
      items: [{ description: "", quantity: 1, unitPrice: 0, discount_clp: 0 }],
      observations: "",
      paymentMethod: "Efectivo",
      referenceDoc: "",
      reason: "",
    });
  };

  // --- Filtros y métricas ---
  const filteredDocuments = invoices.filter((doc) => {
    const matchesSearch =
      doc.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patient.rut.includes(searchTerm);
    const matchesStatus =
      filterStatus === "todos" || doc.status === filterStatus;
    const matchesType = filterType === "todos" || doc.dte_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalMonto = invoices.reduce((sum, d) => sum + d.total, 0);

  const tabs = [
    { id: "list", label: "Documentos", icon: FileText },
    { id: "create", label: "Nuevo Documento", icon: Plus },
    { id: "stats", label: "Estadísticas", icon: TrendingUp },
  ];

  // 🎯 Calcula la configuración del documento seleccionado
  const selectedDte = getDtesConfigByCode(data.dte_type);
  const docStyles = selectedDte.styles || {};

  return (
    <AuthenticatedLayout>
      <Head title="Emitir Documento Tributario Electrónico" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <HeaderDocuments
          setActiveTab={setActiveTab}
          tabs={tabs}
          activeTab={activeTab}
        />

        <div className="mx-auto">
          {/* Lista de Documentos */}
          {activeTab === "list" && (
            <List
              invoices={invoices}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filteredDocuments={filteredDocuments}
              setSelectedDocument={setSelectedDocument}
              DTES_TYPES={DTES_TYPES}
              DTES_STATUSES={DTES_STATUSES}
            />
          )}

          {/* Crear Documento */}
          {activeTab === "create" && (
            <>
              <div className="grid grid-cols-4 gap-4 px-6 md:grid-cols-8">
                {DTES_TYPES.map((type) => {
                  // 1. Desestructuración de datos de la lista
                  const Icon = type.icon;

                  // 2. Acceso directo al objeto de estilos
                  const styles = type.styles ?? {};

                  // 3. Lógica de activación
                  const active = data.dte_type === type.code;

                  console.log(data);
                  return (
                    <button
                      // ✅ Usamos type.code como clave, ya que es único
                      key={type.code}
                      type="button"
                      // ✅ Guardamos el código numérico DTE en el estado
                      onClick={() => setData("dte_type", type.code)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        active
                          ? `${styles.border} ${styles.bg}`
                          : "border-gray-200 hover:border-gray-300 bg-white scale-90"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          styles.text || "text-gray-600"
                        }`}
                      />
                      <p className="text-sm font-semibold text-center text-gray-900">
                        {type.label}
                      </p>
                      <p className="mt-1 text-xs text-center text-gray-500">
                        Código {type.code}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="p-6 -mt-10 bg-white border border-gray-200 shadow-sm rounded-xl">
                {/*          <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Crear Nuevo Documento Tributario
              </h2> */}

                {/* Selección de Tipo de Documento */}
                <div className="mb-8">
                  {/*        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Seleccione el tipo de documento
                </h3> */}
                </div>

                {data.type ? (
                  <>
                    {/* Datos del Documento */}
                    <div
                      className={`mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Datos del Documento
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Fecha Emisión
                          </label>
                          <input
                            type="date"
                            value={data.date}
                            onChange={(e) =>
                              setData({ ...data, date: e.target.value })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        {(data.dte_type === 33 /* "factura" */ ||
                          data.dte_type === 34) /* "factura_exenta" */ && (
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Fecha Vencimiento
                            </label>
                            <input
                              type="date"
                              value={data.expirationDate}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  expirationDate: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Forma de Pago
                          </label>
                          <select
                            value={data.paymentMethod}
                            onChange={(e) =>
                              setData({
                                ...data,
                                paymentMethod: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          >
                            <option>Efectivo</option>
                            <option>Transferencia</option>
                            <option>Cheque</option>
                            <option>Tarjeta de Crédito</option>
                            <option>Tarjeta de Débito</option>
                            <option>Crédito</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Referencia (para NC y ND) */}
                    {(data.dte_type === 61 /* "nota_credito" */ ||
                      data.dte_type === 56) /* "nota_debito" */ && (
                      <div className="p-4 mb-6 border-2 border-yellow-200 bg-yellow-50 rounded-xl">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                          Documento de Referencia
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Documento Referenciado
                            </label>
                            <input
                              type="text"
                              value={data.referenceDoc}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  referenceDoc: e.target.value,
                                })
                              }
                              placeholder="Ej: Factura 1234"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                              Motivo
                            </label>
                            <input
                              type="text"
                              value={data.reason}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  reason: e.target.value,
                                })
                              }
                              placeholder="Motivo de la emisión"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Datos del Cliente */}
                    <div
                      className={`mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Datos del Cliente/Receptor
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* CAMPO 1: RUT */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            RUT
                          </label>
                          <input
                            type="text"
                            placeholder="12.345.678-9"
                            value={data?.client?.rut || ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                client: { ...data.client, rut: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* CAMPO 2: Razón Social */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Razón Social
                          </label>
                          <input
                            type="text"
                            placeholder="Nombre o Razón Social"
                            value={data?.client?.razonSocial || ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                client: {
                                  ...data.client,
                                  razonSocial: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* CAMPO 3: Giro */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Giro
                          </label>
                          <input
                            type="text"
                            placeholder="Giro comercial"
                            value={data?.client?.giro || ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                client: {
                                  ...data.client,
                                  giro: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* CAMPO 4: Dirección */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Dirección
                          </label>
                          <input
                            type="text"
                            placeholder="Dirección completa"
                            value={data?.client?.direccion || ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                client: {
                                  ...data.client,
                                  direccion: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* CAMPO 5: Comuna */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Comuna
                          </label>
                          <input
                            type="text"
                            placeholder="Comuna"
                            value={data?.client?.comuna || ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                client: {
                                  ...data.client,
                                  comuna: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* CAMPO 6: Ciudad */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            placeholder="Ciudad"
                            value={data?.client?.ciudad || ""}
                            onChange={(e) =>
                              setData({
                                ...data,
                                client: {
                                  ...data.client,
                                  ciudad: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Detalle de Items */}
                    <div
                      className={`mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Detalle del Documento
                        </h3>
                        <button
                          onClick={addItem}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" /> Agregar Línea
                        </button>
                      </div>
                      <div className="overflow-hidden border-2 border-gray-200 rounded-xl">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                                Descripción
                              </th>
                              <th className="w-24 px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                                Cantidad
                              </th>
                              <th className="w-32 px-4 py-3 text-xs font-bold text-right text-gray-600 uppercase">
                                Precio Unit.
                              </th>
                              <th className="w-24 px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                                Desc %
                              </th>
                              <th className="w-32 px-4 py-3 text-xs font-bold text-right text-gray-600 uppercase">
                                Total
                              </th>
                              <th className="w-16 px-4 py-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {data.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Descripción del producto o servicio"
                                    className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "quantity",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    min="0"
                                    step="0.01"
                                    className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "unitPrice",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    min="0"
                                    step="1"
                                    className="w-full px-2 py-1 text-right border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    value={item.discount_clp}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "discount_clp",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-2 font-semibold text-right">
                                  $
                                  {calculateItemTotal(item).toLocaleString(
                                    "es-CL"
                                  )}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  {data.items.length > 1 && (
                                    <button
                                      onClick={() => removeItem(index)}
                                      className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Totales */}
                    <div className="mb-6">
                      <div
                        /* className="max-w-md p-6 ml-auto border border-gray-200 bg-gray-50 rounded-xl" */ className={`max-w-md p-6 ml-auto mb-6 border-l-4 rounded-xl ${
                          docStyles.bg || "bg-gray-50"
                        } ${docStyles.border || "border-gray-200"}`}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between text-gray-700">
                            <span>subtotal_clp:</span>
                            <span className="font-semibold">
                              $
                              {calculateTotals().subtotal_clp.toLocaleString(
                                "es-CL"
                              )}
                            </span>
                          </div>
                          {!DTES_TYPES.find((dt) => dt.code === data.type)
                            ?.exento && (
                            <div className="flex justify-between text-gray-700">
                              <span>IVA (19%):</span>
                              <span className="font-semibold">
                                ${calculateTotals().iva.toLocaleString("es-CL")}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-3 text-xl font-bold text-gray-900 border-t-2 border-gray-200">
                            <span>Total:</span>
                            <span>
                              ${calculateTotals().total.toLocaleString("es-CL")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Observaciones */}
                    <div
                      className={`mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Observaciones
                      </label>
                      <textarea
                        value={data.observations}
                        onChange={(e) =>
                          setData({
                            ...data,
                            observations: e.target.value,
                          })
                        }
                        rows="3"
                        placeholder="Observaciones adicionales (opcional)"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      ></textarea>
                    </div>

                    {/* Botones de Acción */}
                    <div
                      /*  className="flex gap-3"   */ className={`flex gap-4 mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <button
                        onClick={handleCreateDocument}
                        className={`flex rounded-lg items-center justify-center flex-1 gap-2 py-3 font-bold text-gray-50  transition-colors border-2 ${docStyles.bg_cover} hover:${docStyles.bg} hover:${docStyles.border} hover:${docStyles.text}`}
                      >
                        <FileCheck className="w-5 h-5" /> Emitir{" "}
                        {selectedDte?.name}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("list");
                          setData({
                            type: "",
                            date: new Date().toISOString().split("T")[0],
                            expirationDate: "",
                            client: {
                              rut: "",
                              razonSocial: "",
                              giro: "",
                              direccion: "",
                              comuna: "",
                              ciudad: "Santiago",
                            },
                            items: [
                              {
                                description: "",
                                quantity: 1,
                                unitPrice: 0,
                                discount_clp: 0,
                              },
                            ],
                            observations: "",
                            paymentMethod: "Efectivo",
                            referenceDoc: "",
                            reason: "",
                          });
                        }}
                        className="px-6 py-3 font-bold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <div
                      className={`mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Seleccione el tipo de documento
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Estadísticas */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Por Tipo de Documento */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <FileText className="w-5 h-5 text-blue-600" /> Documentos
                    por Tipo
                  </h3>
                  <div className="space-y-3">
                    {DTES_TYPES.map((type) => {
                      const count = invoices.filter(
                        (d) => d.type === type.id
                      ).length;
                      const total = invoices
                        .filter((d) => d.type === type.id)
                        .reduce((sum, d) => sum + d.total, 0);
                      if (count === 0) return null;
                      const style = DTES_TYPES[type.id] || {
                        text: "text-gray-600",
                      };
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${style.text}`} />
                            <span className="font-medium text-gray-900">
                              {type.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {count} docs
                            </p>
                            <p className="text-sm text-gray-600">
                              ${total.toLocaleString("es-CL")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Por Estado */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <CheckCircle className="w-5 h-5 text-green-600" />{" "}
                    Documentos por Estado
                  </h3>
                  <div className="space-y-3">
                    {["Emitido", "Aceptado", "Rechazado", "Anulado"].map(
                      (status) => {
                        const count = invoices.filter(
                          (d) => d.status === status
                        ).length;
                        const total = invoices
                          .filter((d) => d.status === status)
                          .reduce((sum, d) => sum + d.total, 0);
                        if (count === 0) return null;
                        const dot =
                          status === "Aceptado"
                            ? "bg-green-500"
                            : status === "Emitido"
                            ? "bg-blue-500"
                            : status === "Rechazado"
                            ? "bg-red-500"
                            : "bg-gray-500";
                        return (
                          <div
                            key={status}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${dot}`}
                              ></div>
                              <span className="font-medium text-gray-900">
                                {status}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {count} docs
                              </p>
                              <p className="text-sm text-gray-600">
                                ${total.toLocaleString("es-CL")}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Resumen Mensual */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <Calendar className="w-5 h-5 text-purple-600" /> Resumen del
                    Mes
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-blue-100 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                      <p className="mb-1 text-sm text-blue-700">
                        Total Documentos
                      </p>
                      <p className="text-3xl font-bold text-blue-900">
                        {invoices.length}
                      </p>
                    </div>
                    <div className="p-4 border border-green-100 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                      <p className="mb-1 text-sm text-green-700">
                        Facturación Total
                      </p>
                      <p className="text-3xl font-bold text-green-900">
                        ${totalMonto.toLocaleString("es-CL")}
                      </p>
                    </div>
                    <div className="p-4 border border-purple-100 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                      <p className="mb-1 text-sm text-purple-700">IVA Total</p>
                      <p className="text-3xl font-bold text-purple-900">
                        $
                        {invoices
                          .reduce((sum, d) => sum + d.iva, 0)
                          .toLocaleString("es-CL")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clientes Frecuentes */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                    <Users className="w-5 h-5 text-orange-600" /> Top Clientes
                  </h3>
                  <div className="space-y-3">
                    {Object.values(
                      invoices.reduce((acc, doc) => {
                        const key = doc.client.rut;
                        if (!acc[key])
                          acc[key] = {
                            rut: doc.client.rut,
                            name: doc.client.razonSocial,
                            count: 0,
                            total: 0,
                          };
                        acc[key].count++;
                        acc[key].total += doc.total;
                        return acc;
                      }, {})
                    )
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 5)
                      .map((client) => (
                        <div
                          key={client.rut}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {client.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {client.rut}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {client.count} docs
                            </p>
                            <p className="text-sm text-gray-600">
                              ${client.total.toLocaleString("es-CL")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Detalle Documento */}
        {selectedDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold">
                      {selectedDocument.typeName}
                    </h2>
                    <p className="text-blue-100">
                      Folio: {selectedDocument.folio}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-white hover:text-blue-100"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Info del Documento */}
                <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Fecha Emisión</p>
                    <p className="font-semibold">
                      {new Date(selectedDocument.date).toLocaleDateString(
                        "es-CL"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        DTES_STATUSES[selectedDocument.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedDocument.status}
                    </span>
                  </div>
                  {selectedDocument.expirationDate && (
                    <div>
                      <p className="text-sm text-gray-600">Fecha Vencimiento</p>
                      <p className="font-semibold">
                        {new Date(
                          selectedDocument.expirationDate
                        ).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Forma de Pago</p>
                    <p className="font-semibold">
                      {selectedDocument.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Datos del Cliente */}
                <div className="pb-6 mb-6 border-b border-gray-200">
                  <h3 className="mb-3 font-bold text-gray-900">
                    Datos del Cliente
                  </h3>
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="font-semibold text-gray-900">
                      {selectedDocument.client.razonSocial}
                    </p>
                    <p className="text-sm text-gray-600">
                      RUT: {selectedDocument.client.rut}
                    </p>
                    <p className="text-sm text-gray-600">
                      Giro: {selectedDocument.client.giro}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDocument.client.direccion}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDocument.client.comuna},{" "}
                      {selectedDocument.client.ciudad}
                    </p>
                  </div>
                </div>

                {/* Detalle Items */}
                <div className="pb-6 mb-6 border-b border-gray-200">
                  <h3 className="mb-3 font-bold text-gray-900">Detalle</h3>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-xs font-bold text-left text-gray-600">
                          Descripción
                        </th>
                        <th className="px-3 py-2 text-xs font-bold text-center text-gray-600">
                          Cant.
                        </th>
                        <th className="px-3 py-2 text-xs font-bold text-right text-gray-600">
                          P. Unit.
                        </th>
                        <th className="px-3 py-2 text-xs font-bold text-right text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDocument.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm">
                            {item.description}
                          </td>
                          <td className="px-3 py-2 text-sm text-center">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-sm text-right">
                            ${item.unitPrice.toLocaleString("es-CL")}
                          </td>
                          <td className="px-3 py-2 text-sm font-semibold text-right">
                            $
                            {(
                              (Number(item.quantity) || 0) *
                                (Number(item.unitPrice) || 0) -
                              (Number(item.quantity) || 0) *
                                (Number(item.unitPrice) || 0) *
                                ((Number(item.discount_clp) || 0) / 100)
                            ).toLocaleString("es-CL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totales */}
                <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">subtotal_clp:</span>
                      <span className="font-semibold">
                        ${selectedDocument.subtotal_clp.toLocaleString("es-CL")}
                      </span>
                    </div>
                    {selectedDocument.iva > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">IVA (19%):</span>
                        <span className="font-semibold">
                          ${selectedDocument.iva.toLocaleString("es-CL")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 text-xl font-bold text-gray-900 border-t-2 border-gray-200">
                      <span>Total:</span>
                      <span>
                        ${selectedDocument.total.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Referencia */}
                {selectedDocument.referenceDoc && (
                  <div className="p-4 mb-6 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                    <p className="mb-1 text-sm text-gray-600">
                      Documento Referenciado
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedDocument.referenceDoc}
                    </p>
                    {selectedDocument.reason && (
                      <>
                        <p className="mt-2 mb-1 text-sm text-gray-600">
                          Motivo
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedDocument.reason}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Timbre Electrónico */}
                <div className="p-4 mb-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <p className="mb-2 text-sm font-semibold text-blue-600">
                    Timbre Electrónico Digital (TED)
                  </p>
                  <p className="font-mono text-xs text-gray-600 break-all">
                    {selectedDocument.ted}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button className="flex items-center justify-center flex-1 gap-2 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4" /> Descargar PDF
                  </button>
                  <button className="flex items-center justify-center flex-1 gap-2 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700">
                    <Printer className="w-4 h-4" /> Imprimir
                  </button>
                  <button className="flex items-center justify-center flex-1 gap-2 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                    <Send className="w-4 h-4" /> Enviar Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
