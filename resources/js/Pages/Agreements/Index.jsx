import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import Modal from "@/components/Modal";
import { Plus, Handshake } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import AgreementRuleFormModal from "./Modals/AgreementRuleFormModal";
import AgreementRulesListModal from "./Modals/AgreementRulesListModal";
import AgreementFormModal from "./Modals/AgreementFormModal";
import AgreementsTable from "./components/AgreementsTable";

// Definimos nombres claros para tus modales
const MODALS = {
  NONE: null,
  AGREEMENT_FORM: "AGREEMENT_FORM", // Crear/Editar Cabecera
  RULES_LIST: "RULES_LIST", // Ver listado de reglas
  RULE_FORM: "RULE_FORM", // Editar una regla específica
  INSURANCE_FORM: "INSURANCE_FORM", // Crear/Editar Aseguradora
};

export default function Index({ agreements, insurances, sessionTypes, plans, user }) {
  // 1. Tu estado único
  // 🚀 UN SOLO ESTADO PARA GOBERNARLOS A TODOS
  const [modalState, setModalState] = useState({
    type: MODALS.NONE,
    data: null,
  });

  // 2. Tus helpers
  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = (success = false) => { // Aceptar parámetro opcional 'success'
    setModalState((prev) => ({ ...prev, type: MODALS.NONE }));
    if (success) {
      router.reload({ only: ['agreements'] }); // Recargar solo la prop 'agreements'
    }
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
      rules: agreement.rules,
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
      <Head title="Gestión de Convenios y Tarifarios" />
      <div className="min-h-screen p-6 bg-gray-50/50 space-y-8">
        {/* Header */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 shadow-xl shadow-brand-primary/20 bg-brand-primary rounded-2xl transform rotate-3">
                <Handshake className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Central de Convenios</h1>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">
                  Tarifarios & Reglas de Cobertura • Senex Enterprise
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenAgreementForm()}
                className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20 hover:brightness-110 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Vincular Nuevo Convenio
              </button>
            </div>
          </div>
        </div>
        
        <AgreementsTable
          agreements={agreements}
          handleOpenAgreementForm={handleOpenAgreementForm}
          handleOpenListRules={handleOpenListRules}
          handleOpenRuleForm={handleOpenRuleForm}
          handleOpenModalDelete={handleOpenModalDelete}
          user={user}
        />
        {/* Modal de Edición/Creación de Encabezado de Convenio */}
        <AgreementFormModal
          show={modalState.type === MODALS.INSURANCE_FORM}
          onClose={closeModal}
          agreement={modalState.data?.agreementToEdit}
          insurances={insurances}
        />
        {/* Modal de Listado de Reglas */}
        <AgreementRulesListModal
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
        <AgreementRuleFormModal
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
