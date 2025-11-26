import swal from "sweetalert";
import POS from "transbank-pos-sdk-web";

export default function SetNormalMode({ onNormalModeResponse }) {
  const handleNormalMode = async () => {
    try {
      const response = await POS.setNormalMode();
      swal("POS en modo normal", "", "success");
      onNormalModeResponse(response);
    } catch (error) {
      swal("Error al configurar modo normal", "", "error");
      console.error(error);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Modo Normal</h3>
      <button
        onClick={handleNormalMode}
        className="w-full bg-blue-500 text-white py-2 rounded hover:opacity-75"
      >
        Activar modo normal
      </button>
    </div>
  );
}
