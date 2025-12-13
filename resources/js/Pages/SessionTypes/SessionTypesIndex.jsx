import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import SideModal from "@/Components/SideModal";
import {
  Edit,
  Trash2,
  Plus,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  CreditCard,
  Search,
  Shell,
  Type,
  Code,
  QrCode,
  ArrowBigDown,
  ListCheck,
  Ungroup,
  X,
  Check,
  ListChecksIcon,
} from "lucide-react";
import SessionTypeModal from "./SessionTypeModal";
import { fmtCLP } from "../../utils/utils";

export default function SessionTypesIndex({ sessionTypes }) {
  const { delete: destroy } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    setSelectedType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sessionType) => {
    setSelectedType(sessionType);
    setIsModalOpen(true);
  };

  const handleDelete = (sessionType) => {
    if (
      confirm(
        `¿Estás seguro de eliminar el tipo de sesión "${sessionType.name}"?`
      )
    ) {
      destroy(route("sessions.types.destroy", sessionType.id));
    }
  };

  /* const handleToggleActive = (sessionType) => {
    patch(route("session-types.toggle-active", sessionType.id), {
      is_active: !sessionType.is_active,
    });
  }; */

  const filteredTypes = sessionTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = sessionTypes.filter((t) => t.active).length;
  const planEligibleCount = sessionTypes.filter((t) => t.plan_eligible).length;

  return (
    <AuthenticatedLayout>
      <Head title="Sesiones Pacientes" />
      <div className="p-4">
        {/* Header */}

        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Shell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tipo de Sesiones
              </h1>
              <p className="text-sm text-gray-600">
                Gestión de tipos de sesiones
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCreate()}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Tipo
            </button>
          </div>
        </div>

        <div className="my-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessionTypes.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Activos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Elegibles para Plan
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {planEligibleCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tipos de sesiones..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Código
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Precio Base
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Requiere Diagnóstico (CIE-10) para facturar
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Requiere orden médica para cobro a terceros.
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Descuento al Usar En Planes
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredTypes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      {searchTerm
                        ? "No se encontraron tipos de sesiones"
                        : "No hay tipos de sesiones registrados"}
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((sessionType) => (
                    <tr
                      key={sessionType.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {sessionType.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {fmtCLP(
                                sessionType.base_price_clp /
                                  sessionType.duration_minutes
                              )}{" "}
                              / min
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                          <Type className="w-4 h-4 text-green-600" />
                          {sessionType.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          <ListChecksIcon className="w-4 h-4 text-blue-600" />
                          {sessionType.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                          {/* <DollarSign className="w-4 h-4 text-green-600" /> */}
                          {fmtCLP(sessionType.base_price_clp)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          <Clock className="w-4 h-4 text-blue-600" />
                          {sessionType.duration_minutes} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          {sessionType.requires_diagnosis ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              SI Requiere (CIE-10)
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-red-600" />
                              NO Requiere (CIE-10)
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          {sessionType.requires_referral ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              SI Requiere Orden
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-red-600" />
                              NO Requiere Orden
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                          <ArrowBigDown className="w-4 h-4 text-red-600" />
                          {fmtCLP(sessionType.plan_discount_clp)}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        {sessionType.plan_eligible ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full w-fit">
                              <CreditCard className="w-3 h-3" />
                              Sí elegible
                            </span>
                            <span className="text-xs text-gray-500">
                              Valor
                              <div className="flex">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                {parseFloat(
                                  sessionType.plan_session_value
                                ).toLocaleString("es-CL")}{" "}
                                / sesión(es)
                              </div>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                            No elegible
                          </span>
                        )}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(sessionType)}
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            sessionType.active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {sessionType.active ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Activo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactivo
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(sessionType)}
                            className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sessionType)}
                            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <SideModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            selectedType ? "Editando Tipo de Sesión" : "Creando Tipo de Sesión"
          }
          width="3xl" // sm, md, lg, xl, 2xl, 3xl, full
        >
          <SessionTypeModal
            selectedType={selectedType}
            setIsModalOpen={setIsModalOpen}
          />
        </SideModal>
      </div>
    </AuthenticatedLayout>
  );
}
