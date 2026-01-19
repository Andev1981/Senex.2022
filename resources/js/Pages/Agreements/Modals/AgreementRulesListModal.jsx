import SideModal from "@/components/SideModal";
import AgreementRulesTable from "../components/AgreementRulesTable";
import { ListChecks, Handshake, ChevronRight } from "lucide-react";
import SecondaryButton from "@/components/SecondaryButton";

export default function AgreementRulesListModal({
  show,
  onClose,
  rules,
  handleOpenRuleForm,
  agreement,
  setRuleToEdit,
}) {
  return (
    <SideModal
      open={show}
      onClose={() => onClose()}
      width="5xl"
      title="Tarifario & Coberturas"
      subtitle={`Convenio: ${agreement?.name}`}
      icon={ListChecks}
      footer={
        <SecondaryButton onClick={onClose} className="!px-10 !py-4">
          Cerrar Auditoría
        </SecondaryButton>
      }
    >
      <div className="space-y-6 duration-500 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 gap-3 p-4 border bg-brand-secondary/5 rounded-2xl border-brand-secondary/10">
            <div className="p-1.5 bg-white rounded-lg text-brand-primary shadow-sm">
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
              Administre los porcentajes de copago y aportes institucionales por
              cada tipo de prestación.
            </p>
          </div>

          <div className="flex items-center gap-4 px-6 py-3 ml-6 border border-gray-100 bg-gray-50 rounded-2xl shrink-0">
            <div className="text-right">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Registros
              </p>
              <p className="text-sm font-black leading-none tracking-tight text-gray-900 uppercase">
                {rules?.length || 0} Reglas
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <Handshake className="w-5 h-5 transform text-brand-primary opacity-40 -rotate-12" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl overflow-hidden">
          <AgreementRulesTable
            rules={rules}
            setRuleToEdit={setRuleToEdit}
            handleOpenRuleForm={handleOpenRuleForm}
          />
        </div>
      </div>
    </SideModal>
  );
}
