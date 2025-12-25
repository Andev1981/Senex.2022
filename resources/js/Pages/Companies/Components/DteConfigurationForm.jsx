import { useForm } from "@inertiajs/react";

export default function DteConfigurationForm({ company, dteConfig }) {
  const { data, setData, post, processing, errors } = useForm({
    rut_empresa: dteConfig?.rut_empresa || company.rut,
    ambiente: dteConfig?.ambiente || "homologacion",
    certificado_password: "", // Siempre pedir de nuevo por seguridad o dejar vacío si no se cambia
    certificado_file: null, // Archivo
    logo: null, // Imagen polimórfica
  });

  const submit = (e) => {
    e.preventDefault();
    // Inertia detecta archivos automáticamente y fuerza multipart/form-data
    post(route("companies.dte_config.store", company.id));
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-4 bg-white rounded shadow">
      <h3>Configuración Facturación Electrónica</h3>

      {/* Rut Empresa */}
      <input
        type="text"
        value={data.rut_empresa}
        onChange={(e) => setData("rut_empresa", e.target.value)}
        placeholder="RUT Empresa (ej: 76123123-K)"
      />

      {/* Ambiente */}
      <select
        value={data.ambiente}
        onChange={(e) => setData("ambiente", e.target.value)}
      >
        <option value="homologacion">Certificación / Pruebas</option>
        <option value="produccion">Producción</option>
      </select>

      {/* Certificado Digital */}
      <div className="border p-2 rounded">
        <label>Certificado Digital (.pfx / .p12)</label>
        <input
          type="file"
          accept=".pfx,.p12"
          onChange={(e) => setData("certificado_file", e.target.files[0])}
        />
        <input
          type="password"
          placeholder="Contraseña del Certificado"
          value={data.certificado_password}
          onChange={(e) => setData("certificado_password", e.target.value)}
        />
      </div>

      {/* Logo de la Empresa */}
      <div className="border p-2 rounded">
        <label>Logo Clínica</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setData("logo", e.target.files[0])}
        />
      </div>

      <button
        disabled={processing}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Guardar Configuración
      </button>
    </form>
  );
}
