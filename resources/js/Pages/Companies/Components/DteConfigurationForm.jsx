import { useForm } from "@inertiajs/react";
import { ShieldCheck, RefreshCw } from "lucide-react";

export default function DteConfigurationForm({ company, dteConfig }) {
  const { data, setData, post, processing, errors } = useForm({
    company_rut: dteConfig?.company_rut || company.rut,
    environment: dteConfig?.environment || "certification",
    certificate_password: "", // Siempre pedir de nuevo por seguridad
    certificate_file: null, // Archivo
    logo: null, // Imagen polimórfica
    simulation_mode: dteConfig ? !!dteConfig.simulation_mode : true,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("companies.dte_config.store", company.id));
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* MODO SIMULACIÓN (CONTROL MAESTRO) */}
      <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
          data.simulation_mode 
          ? 'bg-amber-50 border-amber-100' 
          : 'bg-green-50 border-green-100'
      }`}>
          <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shadow-sm ${data.simulation_mode ? 'bg-white text-amber-600' : 'bg-white text-green-600'}`}>
                      {data.simulation_mode ? <RefreshCw className="w-5 h-5 animate-spin-slow" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${data.simulation_mode ? 'text-amber-700' : 'text-green-700'}`}>
                          Motor de Emisión
                      </p>
                      <p className={`text-sm font-black uppercase tracking-tight ${data.simulation_mode ? 'text-amber-900' : 'text-green-900'}`}>
                          {data.simulation_mode ? 'Modo Simulación' : 'Producción Real'}
                      </p>
                  </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={data.simulation_mode}
                      onChange={e => setData('simulation_mode', e.target.checked)}
                  />
                  <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[1.2rem] after:w-[1.2rem] after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
              </label>
          </div>
          <p className="mt-3 text-[10px] font-medium leading-relaxed opacity-60">
              {data.simulation_mode 
                  ? 'Las boletas no serán enviadas al SII. Úselo para pruebas.' 
                  : 'Emisión oficial activa. Se requiere certificado y folios CAF.'}
          </p>
      </div>

      {/* Rut Empresa */}
      <div className="space-y-1">
        <label className="enterprise-label ml-1">RUT Empresa (Emisor SII)</label>
        <input
          type="text"
          value={data.company_rut}
          onChange={(e) => setData("company_rut", e.target.value)}
          placeholder="76.123.123-K"
          className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white"
        />
        {errors.company_rut && <p className="text-xs text-red-500 font-bold mt-1">{errors.company_rut}</p>}
      </div>

      {/* Ambiente */}
      <div className="space-y-1">
        <label className="enterprise-label ml-1">Ambiente de Operación</label>
        <select
          value={data.environment}
          onChange={(e) => setData("environment", e.target.value)}
          className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white cursor-pointer"
        >
          <option value="certification">Certificación (Modo Pruebas)</option>
          <option value="production">Producción (Operación Real)</option>
        </select>
        {errors.environment && <p className="text-xs text-red-500 font-bold mt-1">{errors.environment}</p>}
      </div>

      {/* Certificado Digital */}
      <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-6">
        <h4 className="enterprise-label !text-brand-primary !mb-0 px-1">Seguridad & Firma</h4>
        
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Archivo del Certificado (.pfx)</label>
            <input
            type="file"
            accept=".pfx,.p12"
            onChange={(e) => setData("certificate_file", e.target.files[0])}
            className="block w-full text-[10px] font-black uppercase tracking-widest text-gray-400 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-gray-200 file:text-gray-600 hover:file:bg-gray-300 transition-all cursor-pointer"
            />
            {errors.certificate_file && <p className="text-xs text-red-500 font-bold mt-1">{errors.certificate_file}</p>}
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña del Certificado</label>
            <input
            type="password"
            placeholder="••••••••"
            value={data.certificate_password}
            onChange={(e) => setData("certificate_password", e.target.value)}
            className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-white"
            />
            {errors.certificate_password && <p className="text-xs text-red-500 font-bold mt-1">{errors.certificate_password}</p>}
        </div>
      </div>

      <button
        disabled={processing}
        className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-brand-primary rounded-[1.5rem] shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all transform disabled:opacity-50"
      >
        {processing ? "Guardando..." : "Actualizar Configuración DTE"}
      </button>
    </form>
  );
}
