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
  Package,
  Receipt,
  FileCheck,
  Trash2,
  User,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// --- Estilos consistentes (sin clases dinámicas Tailwind purgables) ---
const TYPE_STYLES = {
  boleta: {
    text: "text-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  boleta_exenta: {
    text: "text-purple-600",
    border: "border-purple-500",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
  },
  factura: {
    text: "text-green-600",
    border: "border-green-500",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
  factura_exenta: {
    text: "text-teal-600",
    border: "border-teal-500",
    bg: "bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
  },
  factura_compra: {
    text: "text-orange-600",
    border: "border-orange-500",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
  },
  nota_credito: {
    text: "text-red-600",
    border: "border-red-500",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
  },
  nota_debito: {
    text: "text-yellow-600",
    border: "border-yellow-500",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-700",
  },
  guia_despacho: {
    text: "text-indigo-600",
    border: "border-indigo-500",
    bg: "bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
  },
};

const STATUS_STYLES = {
  Emitido: "bg-blue-100 text-blue-700",
  Aceptado: "bg-green-100 text-green-700",
  Rechazado: "bg-red-100 text-red-700",
  Anulado: "bg-gray-100 text-gray-700",
};

export default function ChileTaxDocuments() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");

  // Tipos de documentos tributarios
  const documentTypes = [
    {
      id: "boleta",
      code: 39,
      name: "Boleta Electrónica",
      icon: Receipt,
      exento: false,
    },
    {
      id: "boleta_exenta",
      code: 41,
      name: "Boleta Exenta Electrónica",
      icon: Receipt,
      exento: true,
    },
    {
      id: "factura",
      code: 33,
      name: "Factura Electrónica",
      icon: FileText,
      exento: false,
    },
    {
      id: "factura_exenta",
      code: 34,
      name: "Factura Exenta Electrónica",
      icon: FileText,
      exento: true,
    },
    {
      id: "factura_compra",
      code: 46,
      name: "Factura de Compra Electrónica",
      icon: FileCheck,
      exento: false,
    },
    {
      id: "nota_credito",
      code: 61,
      name: "Nota de Crédito Electrónica",
      icon: FileText,
      exento: false,
    },
    {
      id: "nota_debito",
      code: 56,
      name: "Nota de Débito Electrónica",
      icon: FileText,
      exento: false,
    },
    {
      id: "guia_despacho",
      code: 52,
      name: "Guía de Despacho Electrónica",
      icon: Package,
      exento: true,
    },
  ];

  // Datos mock
  const [documents, setDocuments] = useState([
    {
      id: 1,
      type: "factura",
      typeName: "Factura Electrónica",
      number: 1234,
      date: "2024-10-10",
      client: {
        rut: "76.123.456-7",
        razonSocial: "Empresa Demo SpA",
        giro: "Servicios Tecnológicos",
        direccion: "Av. Providencia 1234, Providencia",
        comuna: "Providencia",
        ciudad: "Santiago",
      },
      items: [
        {
          description: "Servicio de Consultoría",
          quantity: 10,
          unitPrice: 50000,
          discount: 0,
        },
        {
          description: "Soporte Técnico",
          quantity: 5,
          unitPrice: 30000,
          discount: 5,
        },
      ],
      subtotal: 642500,
      iva: 122075,
      total: 764575,
      status: "Aceptado",
      folio: "F-2024-001234",
      ted: "abc123xyz",
      paymentMethod: "Transferencia",
      expirationDate: "2024-11-10",
    },
    {
      id: 2,
      type: "boleta",
      typeName: "Boleta Electrónica",
      number: 5678,
      date: "2024-10-11",
      client: {
        rut: "12.345.678-9",
        razonSocial: "Juan Pérez González",
        giro: "Particular",
        direccion: "Los Alamos 567",
        comuna: "Las Condes",
        ciudad: "Santiago",
      },
      items: [
        {
          description: "Producto A",
          quantity: 2,
          unitPrice: 15000,
          discount: 0,
        },
        {
          description: "Producto B",
          quantity: 1,
          unitPrice: 25000,
          discount: 0,
        },
      ],
      subtotal: 55000,
      iva: 10450,
      total: 65450,
      status: "Emitido",
      folio: "B-2024-005678",
      ted: "def456uvw",
      paymentMethod: "Efectivo",
      expirationDate: null,
    },
    {
      id: 3,
      type: "nota_credito",
      typeName: "Nota de Crédito Electrónica",
      number: 45,
      date: "2024-10-12",
      client: {
        rut: "76.123.456-7",
        razonSocial: "Empresa Demo SpA",
        giro: "Servicios Tecnológicos",
        direccion: "Av. Providencia 1234, Providencia",
        comuna: "Providencia",
        ciudad: "Santiago",
      },
      items: [
        {
          description: "Anulación Factura 1230",
          quantity: 1,
          unitPrice: 100000,
          discount: 0,
        },
      ],
      subtotal: 100000,
      iva: 19000,
      total: 119000,
      status: "Aceptado",
      folio: "NC-2024-000045",
      ted: "ghi789rst",
      referenceDoc: "Factura 1230",
      reason: "Anulación por error en monto",
    },
  ]);

  const [formData, setFormData] = useState({
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
    items: [{ description: "", quantity: 1, unitPrice: 0, discount: 0 }],
    observations: "",
    paymentMethod: "Efectivo",
    referenceDoc: "",
    reason: "",
  });

  // --- Helpers ---
  const calculateItemTotal = (item) => {
    const subtotal =
      (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const discountAmount = subtotal * ((Number(item.discount) || 0) / 100);
    return Math.max(0, subtotal - discountAmount);
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + calculateItemTotal(item),
      0
    );
    const docType = documentTypes.find((dt) => dt.id === formData.type);
    const iva = docType && !docType.exento ? Math.round(subtotal * 0.19) : 0;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  // --- Create ---
  const addItem = () =>
    setFormData((f) => ({
      ...f,
      items: [
        ...f.items,
        { description: "", quantity: 1, unitPrice: 0, discount: 0 },
      ],
    }));
  const removeItem = (index) =>
    setFormData((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));
  const updateItem = (index, field, value) =>
    setFormData((f) => {
      const items = [...f.items];
      items[index][field] = value;
      return { ...f, items };
    });

  const handleCreateDocument = () => {
    const { subtotal, iva, total } = calculateTotals();
    const docType = documentTypes.find((dt) => dt.id === formData.type);
    const newDoc = {
      id: documents.length + 1,
      type: formData.type,
      typeName: docType.name,
      number: Math.floor(Math.random() * 10000),
      date: formData.date,
      client: formData.client,
      items: formData.items,
      subtotal,
      iva,
      total,
      status: "Emitido",
      folio: `${formData.type.toUpperCase().substring(0, 2)}-2024-${String(
        Math.floor(Math.random() * 10000)
      ).padStart(6, "0")}`,
      ted: Math.random().toString(36).substring(2, 15),
      paymentMethod: formData.paymentMethod,
      expirationDate: formData.expirationDate || null,
      referenceDoc: formData.referenceDoc || null,
      reason: formData.reason || null,
    };
    setDocuments((docs) => [newDoc, ...docs]);
    setActiveTab("list");
    setFormData({
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
      items: [{ description: "", quantity: 1, unitPrice: 0, discount: 0 }],
      observations: "",
      paymentMethod: "Efectivo",
      referenceDoc: "",
      reason: "",
    });
  };

  // --- Filtros y métricas ---
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.client.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.client.rut.includes(searchTerm);
    const matchesStatus =
      filterStatus === "todos" || doc.status === filterStatus;
    const matchesType = filterType === "todos" || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalEmitidos = documents.filter((d) => d.status === "Emitido").length;
  const totalAceptados = documents.filter(
    (d) => d.status === "Aceptado"
  ).length;
  const totalRechazados = documents.filter(
    (d) => d.status === "Rechazado"
  ).length;
  const totalMonto = documents.reduce((sum, d) => sum + d.total, 0);

  const tabs = [
    { id: "list", label: "Documentos", icon: FileText },
    { id: "create", label: "Nuevo Documento", icon: Plus },
    { id: "stats", label: "Estadísticas", icon: TrendingUp },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Emitir Documento Tributario Electrónico" />
      <div className="min-h-screen p-4 bg-gray-50">
        {/* Header */}
        <div className="mb-4 text-white shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
          <div className="px-4 py-6 mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Documentos Tributarios Electrónicos
                  </h1>
                  <p className="text-blue-100">
                    Sistema de Facturación Electrónica - Chile
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="mr-4 text-right">
                  <p className="text-sm text-blue-100">RUT Empresa</p>
                  <p className="font-bold">76.XXX.XXX-X</p>
                </div>
                <button
                  onClick={() => setActiveTab("create")}
                  className="flex items-center gap-2 px-6 py-3 font-bold text-blue-600 transition-colors bg-white rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Documento
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 mx-auto max-w-7xl">
            <div className="flex gap-2 pb-0 -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap transition-all border-b-2 rounded-t-xl ${
                      activeTab === tab.id
                        ? "text-blue-600 border-white bg-white"
                        : "text-blue-100 border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
            <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Emitidos</h3>
              </div>
              <p className="text-3xl font-bold">{totalEmitidos}</p>
            </div>
            <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Aceptados</h3>
              </div>
              <p className="text-3xl font-bold">{totalAceptados}</p>
            </div>
            <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-red-500 to-red-600">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Rechazados</h3>
              </div>
              <p className="text-3xl font-bold">{totalRechazados}</p>
            </div>
            <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-lg font-semibold">Total Facturado</h3>
              </div>
              <p className="text-2xl font-bold">
                ${totalMonto.toLocaleString("es-CL")}
              </p>
            </div>
          </div>

          {/* Lista de Documentos */}
          {activeTab === "list" && (
            <div className="space-y-4">
              {/* Filtros */}
              <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar por razón social, RUT o folio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="todos">Todos los tipos</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="Emitido">Emitido</option>
                    <option value="Aceptado">Aceptado</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Anulado">Anulado</option>
                  </select>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                          Folio
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                          RUT
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-right text-gray-600 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-xs font-bold text-center text-gray-600 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocuments.map((doc) => {
                        const docType = documentTypes.find(
                          (dt) => dt.id === doc.type
                        );
                        const Icon = docType?.icon || FileText;
                        const typeStyle = TYPE_STYLES[doc.type] || {
                          text: "text-gray-600",
                        };
                        return (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-5 h-5 ${typeStyle.text}`} />
                                <span className="text-sm font-medium text-gray-900">
                                  {doc.typeName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-gray-900">
                              {doc.folio}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(doc.date).toLocaleDateString("es-CL")}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {doc.client.razonSocial}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-gray-600">
                              {doc.client.rut}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                              ${doc.total.toLocaleString("es-CL")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  STATUS_STYLES[doc.status] ||
                                  "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setSelectedDocument(doc)}
                                  className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                                  title="Ver detalle"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                                  title="Descargar PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                                  title="Imprimir"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                                  title="Enviar por email"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Crear Documento */}
          {activeTab === "create" && (
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Crear Nuevo Documento Tributario
              </h2>

              {/* Selección de Tipo de Documento */}
              <div className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Seleccione el tipo de documento
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {documentTypes.map((type) => {
                    const Icon = type.icon;
                    const active = formData.type === type.id;
                    const style = TYPE_STYLES[type.id] || {};
                    return (
                      <button
                        key={type.id}
                        onClick={() =>
                          setFormData({ ...formData, type: type.id })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          active
                            ? `${style.border} ${style.bg}`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mx-auto mb-2 ${
                            style.text || "text-gray-600"
                          }`}
                        />
                        <p className="text-sm font-semibold text-center text-gray-900">
                          {type.name}
                        </p>
                        <p className="mt-1 text-xs text-center text-gray-500">
                          Código {type.code}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.type && (
                <>
                  {/* Datos del Documento */}
                  <div className="mb-6">
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
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      {(formData.type === "factura" ||
                        formData.type === "factura_exenta") && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            Fecha Vencimiento
                          </label>
                          <input
                            type="date"
                            value={formData.expirationDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
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
                          value={formData.paymentMethod}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
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
                  {(formData.type === "nota_credito" ||
                    formData.type === "nota_debito") && (
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
                            value={formData.referenceDoc}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
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
                            value={formData.reason}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
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
                  <div className="mb-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Datos del Cliente/Receptor
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {[
                        {
                          label: "RUT",
                          key: "rut",
                          placeholder: "12.345.678-9",
                        },
                        {
                          label: "Razón Social",
                          key: "razonSocial",
                          placeholder: "Nombre o Razón Social",
                        },
                        {
                          label: "Giro",
                          key: "giro",
                          placeholder: "Giro comercial",
                        },
                        {
                          label: "Dirección",
                          key: "direccion",
                          placeholder: "Dirección completa",
                        },
                        {
                          label: "Comuna",
                          key: "comuna",
                          placeholder: "Comuna",
                        },
                        {
                          label: "Ciudad",
                          key: "ciudad",
                          placeholder: "Ciudad",
                        },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            {f.label}
                          </label>
                          <input
                            type="text"
                            value={formData.client[f.key]}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                client: {
                                  ...formData.client,
                                  [f.key]: e.target.value,
                                },
                              })
                            }
                            placeholder={f.placeholder}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detalle de Items */}
                  <div className="mb-6">
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
                          {formData.items.map((item, index) => (
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
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateItem(
                                      index,
                                      "discount",
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
                                {formData.items.length > 1 && (
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
                    <div className="max-w-md p-6 ml-auto border border-gray-200 bg-gray-50 rounded-xl">
                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal:</span>
                          <span className="font-semibold">
                            $
                            {calculateTotals().subtotal.toLocaleString("es-CL")}
                          </span>
                        </div>
                        {!documentTypes.find((dt) => dt.id === formData.type)
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
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          observations: e.target.value,
                        })
                      }
                      rows="3"
                      placeholder="Observaciones adicionales (opcional)"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateDocument}
                      className="flex items-center justify-center flex-1 gap-2 py-3 font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <FileCheck className="w-5 h-5" /> Emitir Documento
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("list");
                        setFormData({
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
                              discount: 0,
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
              )}
            </div>
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
                    {documentTypes.map((type) => {
                      const count = documents.filter(
                        (d) => d.type === type.id
                      ).length;
                      const total = documents
                        .filter((d) => d.type === type.id)
                        .reduce((sum, d) => sum + d.total, 0);
                      if (count === 0) return null;
                      const style = TYPE_STYLES[type.id] || {
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
                        const count = documents.filter(
                          (d) => d.status === status
                        ).length;
                        const total = documents
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
                        {documents.length}
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
                        {documents
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
                      documents.reduce((acc, doc) => {
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
                        STATUS_STYLES[selectedDocument.status] ||
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
                                ((Number(item.discount) || 0) / 100)
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
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold">
                        ${selectedDocument.subtotal.toLocaleString("es-CL")}
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
