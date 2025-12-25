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
import RutInput from "@/Components/RutInput";
import SearchSelect from "@/Components/SearchSelect";
import Swal from "sweetalert2";
import axios from "axios";

export default function IndexDocuments({ invoices, communes, patients, sellables }) {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterType, setFilterType] = useState("todos");
  // 🎯 VERIFICAR: La desestructuración debe estar al principio
  const { data, setData, post, processing, errors, reset } = useForm({
    dte_type: "",
    issue_date: new Date().toISOString().split("T")[0],
    expiration_date: "",
    client: {
      rut: "",
      razonSocial: "",
      giro: "",
      direccion: "",
      comuna: "",
      ciudad: "Santiago",
    },
    patient_id: null,
    items: [],
    global_discount: 0,
    payment_method: "Efectivo",
    transaction_number: "", // Nuevo campo
    transaction_date: "",   // Nuevo campo opcional
    observations: "",
    reference_doc: "",
    reason: "",
    simulate: true,
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
    let net_subtotal = 0;
    let exempt_subtotal = 0;
    const subtotal_items = data.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const docType = DTES_TYPES.find((dt) => dt.code === data.dte_type);
    const isDocExempt = docType?.exento;

    // Clasificar montos item por item
    data.items.forEach(item => {
        const lineTotal = calculateItemTotal(item);
        // Si el documento es exento, TODO es exento.
        // Si el documento es afecto, miramos si el ítem individual es exento.
        if (isDocExempt || item.is_exempt) {
            exempt_subtotal += lineTotal;
        } else {
            net_subtotal += lineTotal;
        }
    });

    // Aplicar descuento global proporcionalmente (simple approach: restar del neto primero)
    // Nota: Para precisión contable estricta se debería prorratear, pero para este flujo:
    const discount_global = Number(data.global_discount) || 0;
    
    // Si hay descuento, lo descontamos del neto primero (beneficio cliente), luego exento si sobra
    let remainingDiscount = discount_global;
    
    if (net_subtotal >= remainingDiscount) {
        net_subtotal -= remainingDiscount;
        remainingDiscount = 0;
    } else {
        remainingDiscount -= net_subtotal;
        net_subtotal = 0;
        exempt_subtotal = Math.max(0, exempt_subtotal - remainingDiscount);
    }

    const iva = Math.round(net_subtotal * 0.19);
    const subtotal_clp = net_subtotal; // Base Imponible
    const total = net_subtotal + exempt_subtotal + iva;

    return { subtotal_items, discount_global, subtotal_clp, exempt_subtotal, iva, total };
  };

  // --- Create ---
  const addItem = (sellable = null) =>
    setData((f) => ({
      ...f,
      items: [
        ...f.items,
        { 
            description: sellable ? sellable.name : "", 
            quantity: 1, 
            unitPrice: sellable ? sellable.price : 0, 
            discount_clp: 0,
            comment: "",
            is_exempt: sellable ? (sellable.is_exempt ? true : false) : false, // Capturar exención
            sellable_type: sellable 
                ? (sellable.type === 'Producto' ? 'App\\Models\\Product' : 'App\\Models\\SessionType') 
                : undefined,
            sellable_id: sellable ? sellable.id : undefined
        },
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

  const handleTypeChange = (newType) => {
      setData(current => ({
          ...current,
          dte_type: newType,
          items: [], // Limpiar items al cambiar tipo (precios/impuestos pueden variar)
          reference_doc: "",
          reason: "",
          // Mantenemos client, fecha, etc.
      }));
  };

  const handleReferenceBlur = async () => {
      if (!data.reference_doc) return;
      
      try {
          const response = await axios.get(route('dte.lookup', data.reference_doc));
          const doc = response.data;
          
          if (doc.found) {
              setData(d => ({
                  ...d,
                  patient_id: doc.patient_id,
                  client: doc.client,
                  reason: d.reason || `Referencia a ${doc.type_name} del ${doc.issue_date}`, // Sugerencia de motivo
              }));
              
              const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
              });
              
              Toast.fire({
                  icon: 'success',
                  title: 'Documento referenciado encontrado'
              });
          }
      } catch (error) {
          if (error.response && error.response.status === 404) {
              Swal.fire({
                  icon: 'warning',
                  title: 'Documento no encontrado',
                  text: 'No se encontró un documento emitido con este folio en el sistema.',
              });
          }
      }
  };

  const handleCreateDocument = (e) => {
    e.preventDefault();

    Swal.fire({
      title: "¿Emitir Documento?",
      text: data.simulate 
        ? "Se generará en MODO SIMULACIÓN (No válido ante SII)" 
        : "Se enviará al SII. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, emitir",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        post(route("documents.store"), {
          onSuccess: () => {
            setActiveTab("list");
            reset();
            Swal.fire(
              "¡Emitido!",
              "El documento ha sido generado correctamente.",
              "success"
            );
          },
          onError: () => {
             Swal.fire(
              "Error",
              "Hubo un problema al emitir el documento.",
              "error"
            );
          }
        });
      }
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
                      onClick={() => handleTypeChange(type.code)}
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

                {data.dte_type ? (
                  <>
                    {/* Buscador Principal de Paciente */}
                    <div className="mb-6 p-6 bg-white border border-blue-100 shadow-sm rounded-xl">
                        <label className="block mb-2 text-lg font-semibold text-gray-900">
                            Buscar Paciente / Cliente
                        </label>
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <SearchSelect
                                    items={patients}
                                    value={null}
                                    onChange={(val, p) => {
                                        if (p) {
                                            setData(d => ({
                                                ...d,
                                                patient_id: p.id,
                                                client: {
                                                    rut: p.rut,
                                                    razonSocial: p.full_name,
                                                    giro: "Particular",
                                                    direccion: p.address ? `${p.address.street} ${p.address.number || ''}` : '',
                                                    comuna: p.address?.commune_name || '',
                                                    ciudad: p.address?.region_name || 'Santiago',
                                                    insurance_name: p.insurance_name // Guardamos esto visualmente en client si queremos, o usamos estado local
                                                }
                                            }));
                                        }
                                    }}
                                    config={{
                                        displayKey: "full_name",
                                        secondaryKeys: ["rut", "insurance_name"],
                                        searchKeys: ["full_name", "rut"],
                                        emptyMessage: "Paciente no encontrado. Ingrese los datos manualmente abajo."
                                    }}
                                    placeholder="Buscar por Nombre o RUT..."
                                />
                            </div>
                            {data.client.razonSocial && (
                                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs text-blue-600 font-bold uppercase">Previsión</p>
                                    <p className="text-sm font-semibold text-blue-900">
                                        {patients.find(p => p.rut === data.client.rut)?.insurance_name || 'Desconocida'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

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
                            value={data.issue_date}
                            onChange={(e) =>
                              setData({ ...data, issue_date: e.target.value })
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
                              value={data.expiration_date}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  expiration_date: e.target.value,
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
                            value={data.payment_method}
                            onChange={(e) =>
                              setData({
                                ...data,
                                payment_method: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                            <option value="Crédito">Crédito</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Campos condicionales de Pago */}
                      {['Transferencia', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Cheque'].includes(data.payment_method) && (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 pt-4 border-t border-gray-200">
                             <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    N° Comprobante / Operación
                                </label>
                                <input
                                    type="text"
                                    value={data.transaction_number}
                                    onChange={(e) => setData('transaction_number', e.target.value)}
                                    placeholder="Ej: 12345678"
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                             </div>
                             <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Fecha de Transacción
                                </label>
                                <input
                                    type="date"
                                    value={data.transaction_date || data.issue_date}
                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                             </div>
                          </div>
                      )}
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
                              value={data.reference_doc}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  reference_doc: e.target.value,
                                })
                              }
                              onBlur={handleReferenceBlur}
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
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Datos del Cliente/Receptor
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* CAMPO 1: RUT */}
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-700">
                            RUT
                          </label>
                          <RutInput
                            value={data?.client?.rut || ""}
                            onChange={(val) =>
                              setData({
                                ...data,
                                client: { ...data.client, rut: val },
                              })
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                            placeholder="12.345.678-9"
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
                          <select
                            value={data?.client?.comuna || ""}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              const selectedCommune = communes.find(c => c.name === selectedName);
                              
                              setData({
                                ...data,
                                client: {
                                  ...data.client,
                                  comuna: selectedName,
                                  ciudad: selectedCommune ? selectedCommune.region_name : (data.client.ciudad || '')
                                },
                              });
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                          >
                            <option value="">Seleccione una comuna</option>
                            {communes.map((commune) => (
                              <option key={commune.id} value={commune.name}>
                                {commune.name}
                              </option>
                            ))}
                          </select>
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
                        <div className="flex-1 mr-4">
                             <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Detalle del Documento
                             </h3>
                             <div className="max-w-xl">
                                <SearchSelect 
                                    items={sellables}
                                    onChange={(val, item) => {
                                        if (item) addItem(item);
                                    }}
                                    config={{
                                        displayKey: 'name',
                                        secondaryKeys: ['price', 'type'],
                                        searchKeys: ['name'],
                                        renderSelected: (item) => `${item.name} - $${item.price}`,
                                        valueKey: 'unique_id'
                                    }}
                                    placeholder="Buscar Producto o Servicio para agregar..."
                                />
                             </div>
                        </div>
                        <button
                          onClick={() => addItem(null)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 mt-6"
                        >
                          <Plus className="w-4 h-4" /> Agregar Línea Manual
                        </button>
                      </div>
                      <div className="overflow-hidden border-2 border-gray-200 rounded-xl">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase">
                                Descripción
                              </th>
                              <th className="px-4 py-3 text-xs font-bold text-left text-gray-600 uppercase w-64">
                                Comentario/Detalle
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
                                    type="text"
                                    value={item.comment}
                                    onChange={(e) =>
                                      updateItem(
                                        index,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Detalle adicional (opcional)"
                                    className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
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
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    min="1"
                                    step="1"
                                    className="w-full px-2 py-1 text-center border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={item.unitPrice}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "unitPrice",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                      min="0"
                                      step="1"
                                      className="w-full pl-6 pr-2 py-1 text-right border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                                    />
                                  </div>
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
                                  <button
                                    onClick={() => removeItem(index)}
                                    className="p-2 text-red-600 rounded-lg hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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
                            <span>Subtotal Items:</span>
                            <span className="font-semibold">
                              $
                              {calculateTotals().subtotal_items.toLocaleString(
                                "es-CL"
                              )}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-gray-700">
                            <span>Descuento Global ($):</span>
                            <input 
                                type="number"
                                value={data.global_discount}
                                onChange={(e) => setData('global_discount', parseFloat(e.target.value) || 0)}
                                className="w-32 px-2 py-1 text-right border border-gray-300 rounded focus:border-blue-500 focus:outline-none text-sm"
                                min="0"
                            />
                          </div>
                          
                          <div className="flex justify-between text-gray-700 pt-2 border-t border-gray-200">
                            <span>Monto Neto (Base):</span>
                            <span className="font-semibold">
                              $
                              {calculateTotals().subtotal_clp.toLocaleString(
                                "es-CL"
                              )}
                            </span>
                          </div>

                          {!DTES_TYPES.find((dt) => dt.code === data.dte_type)
                            ?.exento && (
                            <div className="flex justify-between text-gray-700">
                              <span>IVA (19%):</span>
                              <span className="font-semibold">
                                ${calculateTotals().iva.toLocaleString("es-CL")}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-3 text-xl font-bold text-gray-900 border-t-2 border-gray-200">
                            <span>Total a Pagar:</span>
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

                    <div className="flex items-center gap-2 mb-4 ml-2">
                       <input 
                          type="checkbox" 
                          id="simulate"
                          checked={data.simulate} 
                          onChange={(e) => setData('simulate', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="simulate" className="text-sm font-medium text-gray-700">Modo Simulación (No enviar al SII)</label>
                    </div>

                    {/* Botones de Acción */}
                    <div
                      /*  className="flex gap-3"   */ className={`flex gap-4 mb-6 p-4 border-l-4 rounded-xl ${
                        docStyles.bg || "bg-gray-50"
                      } ${docStyles.border || "border-gray-200"}`}
                    >
                      <button
                        onClick={handleCreateDocument}
                        disabled={data.items.length === 0 || !data.client.rut || processing}
                        className={`flex rounded-lg items-center justify-center flex-1 gap-2 py-3 font-bold text-gray-50  transition-colors border-2 ${
                            data.items.length === 0 || !data.client.rut || processing
                            ? "bg-gray-400 border-gray-400 cursor-not-allowed opacity-50"
                            : `${docStyles.bg_cover} hover:${docStyles.bg} hover:${docStyles.border} hover:${docStyles.text}`
                        }`}
                      >
                        <FileCheck className="w-5 h-5" /> Emitir{" "}
                        {selectedDte?.name}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("list");
                          setData({
                            dte_type: "",
                            issue_date: new Date().toISOString().split("T")[0],
                            expiration_date: "",
                            client: {
                              rut: "",
                              razonSocial: "",
                              giro: "",
                              direccion: "",
                              comuna: "",
                              ciudad: "Santiago",
                            },
                            items: [],
                            observations: "",
                            payment_method: "Efectivo",
                            reference_doc: "",
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
                        const key =
                          doc.client?.rut || doc.patient?.rut || "unknown";
                        if (!acc[key])
                          acc[key] = {
                            rut: key,
                            name:
                              doc.client?.razonSocial ||
                              doc.patient?.name ||
                              "Cliente",
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
                      {selectedDocument.metadata?.payment_method || selectedDocument.paymentMethod || 'Efectivo'}
                    </p>
                  </div>
                </div>

                {/* Detalles Específicos del Pago (Si aplica) */}
                {selectedDocument.metadata?.transaction_number && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Detalle de Transacción</h4>
                        <div className="flex gap-6">
                            <div>
                                <p className="text-xs text-blue-600">N° Operación/Comprobante</p>
                                <p className="text-sm font-mono font-medium text-blue-900">{selectedDocument.metadata.transaction_number}</p>
                            </div>
                            {selectedDocument.metadata.transaction_date && (
                                <div>
                                    <p className="text-xs text-blue-600">Fecha Transacción</p>
                                    <p className="text-sm font-medium text-blue-900">{new Date(selectedDocument.metadata.transaction_date).toLocaleDateString('es-CL')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
