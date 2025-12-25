import SideModal from "@/Components/SideModal";
import AgreementRulesTable from "../Components/AgreementRulesTable";

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
      title="Listado de Reglas del Convenio"
      description="Aquí puedes ver y gestionar las reglas asociadas al convenio seleccionado."
      width="5xl"
    >
      <div>{agreement?.name}</div>
      <AgreementRulesTable
        rules={rules}
        setRuleToEdit={setRuleToEdit}
        handleOpenRuleForm={handleOpenRuleForm}
      />
    </SideModal>
  );
}
