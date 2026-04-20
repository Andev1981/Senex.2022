import { useForm, usePage } from "@inertiajs/react";
import { ShieldCheck, RefreshCw, AlertCircle, Eye, EyeOff, X, CheckCircle2, Calendar, User, Database } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function DteConfigurationForm({ company, dteConfig, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const { data, setData, post, processing, errors } = useForm({
    company_rut: dteConfig?.company_rut || company.rut,
    acteco: dteConfig?.acteco || "",
    environment: dteConfig?.environment || "certification",
    certificate_password: "", // Siempre pedir de nuevo por seguridad
    certificate_file: null, // Archivo
    logo: null, // Imagen polimórfica
    simulation_mode: dteConfig ? !!dteConfig.simulation_mode : true,
  });

  // Al cambiar Modo Simulación, ajustamos automáticamente el ambiente
  const handleSimulationToggle = (e) => {
    const isSimulating = e.target.checked;
    setData(prev => ({
        ...prev,
        simulation_mode: isSimulating,
        // Si activamos simulación, forzamos ambiente a certificación
        environment: isSimulating ? 'certification' : prev.environment
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    post(route("companies.dte_config.store", company.id), {
      onSuccess: () => {
        Swal.fire({
          title: '¡Configuración Actualizada!',
          text: 'Los parámetros del motor de emisión se han sincronizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#000',
          confirmButtonText: 'Entendido'
        });
        
        setData('certificate_password', '');
        setData('certificate_file', null);
        
        if (onSuccess) onSuccess();
      }
    });
  };

  const formatRUT = (rut) => {
    if (!rut) return "No detectado";
    const clean = rut.replace(/[^0-9Kk]/g, '');
    return clean.replace(/^(\d{1,2})(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-6 overflow-x-hidden max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* ERROR GENERAL */}
      {errors.error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-xs font-bold text-red-800 uppercase tracking-tight">{errors.error}</p>
        </div>
      )}

      {/* MODO SIMULACIÓN */}
      <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
          data.simulation_mode 
          ? 'bg-amber-50 border-amber-100 shadow-amber-100/50 shadow-lg' 
          : 'bg-green-50 border-green-100 shadow-green-100/50 shadow-lg'
      }`}>
          <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-sm ${data.simulation_mode ? 'bg-white text-amber-600' : 'bg-white text-green-600'}`}>
                      {data.simulation_mode ? <RefreshCw className="w-6 h-6 animate-spin-slow" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <div>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${data.simulation_mode ? 'text-amber-700' : 'text-green-700'}`}>
                          Motor de Emisión
                      </p>
                      <p className={`text-base font-black uppercase tracking-tight ${data.simulation_mode ? 'Modo Entrenamiento' : 'Operación Oficial'}`}>
                          {data.simulation_mode ? 'Modo Entrenamiento' : 'Operación Oficial'}
                      </p>
                  </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer scale-110">
                  <input type="checkbox" className="sr-only peer" checked={data.simulation_mode} onChange={handleSimulationToggle} />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[1.5rem] after:w-[1.5rem] after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
              </label>
          </div>
      </div>

      {/* PARÁMETROS LEGALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="enterprise-label ml-1">RUT Emisor Fiscal</label>
          <input
            type="text"
            value={data.company_rut}
            onChange={(e) => setData("company_rut", e.target.value)}
            placeholder="76.123.123-K"
            className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white"
          />
          {errors.company_rut && <p className="text-[10px] text-red-500 font-black uppercase mt-1 ml-1">{errors.company_rut}</p>}
        </div>

        <div className="space-y-1">
          <label className="enterprise-label ml-1">Código Acteco (SII)</label>
          <input
            type="number"
            value={data.acteco}
            onChange={(e) => setData("acteco", e.target.value)}
            placeholder="Ej: 722000"
            className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white"
          />
          {errors.acteco && <p className="text-[10px] text-red-500 font-black uppercase mt-1 ml-1">{errors.acteco}</p>}
        </div>

        <div className="space-y-1">
          <label className="enterprise-label ml-1">Ambiente de Destino</label>
          <div className="relative">
            <select
                value={data.environment}
                onChange={(e) => setData("environment", e.target.value)}
                disabled={data.simulation_mode}
                className={`w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 focus:ring-brand-primary transition-all cursor-pointer ${
                    data.simulation_mode ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed' : 'bg-gray-50/50 focus:bg-white'
                }`}
            >
                <option value="certification">Certificación (SII Pruebas)</option>
                <option value="production">Producción (SII Real)</option>
            </select>
            {data.simulation_mode && (
                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">Forzado</span>
            )}
          </div>
        </div>
      </div>

      {/* FIRMA ELECTRÓNICA */}
      <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">Firma Electrónica Simple</h4>
            {dteConfig?.certificate_path && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certificado Cargado
                </span>
            )}
        </div>

        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-brand-primary border border-gray-50"><User className="w-5 h-5" /></div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Firmante Autorizado</p>
                    <p className="text-sm font-black text-gray-900 font-mono tracking-tight">{formatRUT(dteConfig?.signer_rut)}</p>
                </div>
            </div>
        </div>

        <div className="space-y-1 pt-4 border-t border-gray-50">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                {dteConfig?.certificate_path ? 'Actualizar Archivo (.pfx)' : 'Subir Archivo (.pfx)'}
                {dteConfig?.certificate_path && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[8px] font-bold">OPCIONAL</span>}
            </label>
            <input type="file" accept=".pfx,.p12" onChange={(e) => setData("certificate_file", e.target.files[0])} className="block w-full text-[10px] font-black uppercase tracking-widest text-gray-400 file:mr-6 file:py-3.5 file:px-6 file:rounded-xl file:border-0 file:bg-gray-900 file:text-white hover:file:bg-black transition-all cursor-pointer" />
        </div>

        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                Contraseña de la Firma
                {dteConfig?.certificate_path && <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[8px] font-bold">OPCIONAL</span>}
            </label>
            <div className="relative group">
                <input type={showPassword ? "text" : "password"} placeholder={dteConfig?.certificate_path ? "Dejar en blanco para mantener actual" : "••••••••"} value={data.certificate_password} onChange={(e) => setData("certificate_password", e.target.value)} className="w-full rounded-2xl border-gray-100 py-4 px-5 pr-12 font-bold text-gray-700 focus:ring-brand-primary transition-all bg-gray-50/50 focus:bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-brand-primary transition-colors focus:outline-none">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
        </div>
      </div>

      <button disabled={processing} className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-brand-primary rounded-2xl shadow-xl shadow-brand-primary/20 hover:brightness-110 active:scale-95 transition-all transform disabled:opacity-50 cursor-pointer">
        {processing ? "Guardando..." : "Actualizar Configuración Maestro"}
      </button>
    </form>
  );
}
