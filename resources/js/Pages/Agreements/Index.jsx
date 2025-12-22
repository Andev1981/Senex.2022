import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { Plus, Handshake } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import AgreementItemFormModal from "./Modals/AgreementItemFormModal";
import AgreementItemListModal from "./Modals/AgreementItemListModal";
import AgreementFormModal from "./Modals/AgreementFormModal";
import AgreementsTable from "./Components/AgreementsTable";

// Definimos nombres claros para tus modales
const MODALS = {
  NONE: null,
  AGREEMENT_FORM: "AGREEMENT_FORM", // Crear/Editar Cabecera
  RULES_LIST: "RULES_LIST", // Ver listado de reglas
  RULE_FORM: "RULE_FORM", // Editar una regla específica
  INSURANCE_FORM: "INSURANCE_FORM", // Crear/Editar Aseguradora
};

export default function Index({ agreements, insurances, sessionTypes, plans }) {
  // 1. Tu estado único
  // 🚀 UN SOLO ESTADO PARA GOBERNARLOS A TODOS
  const [modalState, setModalState] = useState({
    type: MODALS.NONE,
    data: null,
  });

  // 2. Tus helpers
  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => {
    setModalState((prev) => ({ ...prev, type: MODALS.NONE }));
  };

  // CASO 1: Formulario de Convenio (Solo necesita el convenio o null)
  const handleOpenAgreementForm = (agreement = null) => {
    openModal(MODALS.INSURANCE_FORM, {
      agreementToEdit: agreement,
    });
  };

  // CASO 2: Listado de Reglas (Necesita el convenio padre)
  const handleOpenListRules = (agreement) => {
    // En tu código pasabas 'item', aquí lo guardamos como 'agreement'
    openModal(MODALS.RULES_LIST, {
      rules: agreement.items,
      agreement: agreement,
    });
  };

  // CASO 3: Formulario de Regla (El caso complejo)
  const handleOpenRuleForm = (agreement, rule = null) => {
    // 📦 AQUÍ ESTÁ EL TRUCO: Pasamos un objeto con ambas cosas
    openModal(MODALS.RULE_FORM, {
      parentAgreement: agreement,
      ruleToEdit: rule,
    });
  };

  // CASO 4: Modal de Eliminación (Solo necesita el convenio)
  const handleOpenModalDelete = (agreement) => {
    // Lógica para abrir el modal de eliminación
  };

  return (
    <AuthenticatedLayout>
      <div className="p-4">
        <Head title="Gestión de Convenios y Tarifarios" />
        <div className="flex items-center justify-between p-6 bg-white rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Convenios y Tarifarios
              </h1>
              <p className="text-sm text-gray-600">
                Gestión de convenios y tarifarios
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenAgreementForm()}
              className="flex items-center gap-2 px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Convenio
            </button>
          </div>
        </div>
        <AgreementsTable
          agreements={agreements}
          handleOpenAgreementForm={handleOpenAgreementForm}
          handleOpenListRules={handleOpenListRules}
          handleOpenRuleForm={handleOpenRuleForm}
          handleOpenModalDelete={handleOpenModalDelete}
        />
        {/* Modal de Edición/Creación de Encabezado de Convenio */}
        <AgreementFormModal
          show={modalState.type === MODALS.INSURANCE_FORM}
          onClose={closeModal}
          agreement={modalState.data?.agreementToEdit}
          insurances={insurances}
        />
        {/* Modal de Listado de Reglas */}
        <AgreementItemListModal
          show={modalState.type === MODALS.RULES_LIST}
          onClose={closeModal}
          rules={modalState.data?.rules}
          agreement={modalState.data?.agreement}
          ruleToEdit={modalState.data?.ruleToEdit}
          setRuleToEdit={(rule) =>
            handleOpenRuleForm(modalState.data?.agreement, rule)
          }
        />
        {/* Modal de Edición/Creación de Regla */}
        <AgreementItemFormModal
          show={modalState.type === MODALS.RULE_FORM}
          onClose={closeModal}
          agreement={modalState.data?.parentAgreement}
          rule={modalState.data?.ruleToEdit}
          plans={plans}
          sessionTypes={sessionTypes}
        />
      </div>
    </AuthenticatedLayout>
  );
}
