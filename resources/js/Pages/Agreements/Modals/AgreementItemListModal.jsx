import SideModal from "@/Components/SideModal";
import AgreementItemsTable from "../Components/AgreementItemsTable";

export default function AgreementItemListModal({
  show,
  onClose,
  rules,
  handleOpenRuleForm,
  setRuleToEdit,
}) {
  return (
    <SideModal
      open={show}
      onClose={() => onClose()}
      title="Listado de Reglas del Convenio"
      description="Aquí puedes ver y gestionar las reglas asociadas al convenio seleccionado."
      width="4xl"
    >
      <AgreementItemsTable
        rules={rules}
        setRuleToEdit={setRuleToEdit}
        handleOpenRuleForm={handleOpenRuleForm}
      />
    </SideModal>
  );
}
