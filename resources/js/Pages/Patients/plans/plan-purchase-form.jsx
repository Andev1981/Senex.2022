import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/InputError';
import PrimaryButton from '@/components/PrimaryButton';
import SearchSelect from '@/components/SearchSelect';
import EnterpriseSelect from '@/components/EnterpriseSelect';
import { Transition } from '@headlessui/react';
import axios from 'axios';
import { Loader2, Layers } from 'lucide-react';

const PlanPurchaseForm = ({ patient, onClose }) => {
  const { props } = usePage();
  const currentBranchId = props.current_branch_id || props.auth.user.active_branch_id;
  
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [errorPlans, setErrorPlans] = useState(null);

  const { data, setData, post, processing, errors, recentlySuccessful, reset } = useForm({
    patient_id: patient.id,
    plan_id: '',
    payment_details: {
      branch_id: currentBranchId, // 👈 Aseguramos que se inicie con el ID correcto
      payment_method: 'cash', 
      payment_date: new Date().toISOString().slice(0, 10),
      transaction_reference: '',
    },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Solicitamos explícitamente planes INTERNOS (Packs comerciales)
        // Evitamos traer convenios marco de Isapres que no son "vendibles" como pack
        const response = await axios.get(route('plans.index', { 
          is_internal: true, 
          type: 'internal' // Refuerzo para el backend
        }));
        setAvailablePlans(response.data.plans);
      } catch (error) {
        console.error("Error al cargar planes:", error);
        setErrorPlans("No se pudieron cargar los planes disponibles.");
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const submit = (e) => {
    e.preventDefault();
    post(route('patient-plans.store'), {
      preserveScroll: true,
      onSuccess: () => {
        // Podríamos mostrar un mensaje de éxito antes de cerrar
        setTimeout(() => {
          onClose(); // Cerrar modal al éxito
          reset();
        }, 1500);
      },
      onError: (err) => {
        console.error("Error al comprar plan:", err);
      }
    });
  };

  const selectedPlan = Array.isArray(availablePlans)
    ? availablePlans.find(plan => plan.id === parseInt(data.plan_id, 10))
    : undefined;

  return (
    <form onSubmit={submit} className="space-y-8">
      {errorPlans && <div className="text-red-600 text-sm mb-4">{errorPlans}</div>}

      {/* SECCIÓN 1: Selección de Plan */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 text-xs font-black text-white bg-gray-800 rounded-full">1</span>
          Seleccionar Pack o Programa
        </h3>
        <p className="text-xs text-gray-500 mb-4 ml-8">
          Seleccione un paquete de prestaciones para vender al paciente (Ej: Pack 10 Sesiones). 
          <br/>
          <span className="italic">Nota: Para atenciones individuales por Bono/Isapre, use el módulo de Caja.</span>
        </p>
        <div className="relative">
          {loadingPlans ? (
            <div className="flex items-center gap-2 p-4 bg-white border border-gray-200 rounded-2xl">
              <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
              <span className="text-sm font-medium text-gray-500">Cargando catálogo de planes...</span>
            </div>
          ) : (
            <SearchSelect
              label="Buscar Plan"
              options={availablePlans.map(plan => ({
                value: plan.id,
                label: plan.name,
                price: plan.price,
                insurance: plan.insurance_name,
                sessions: plan.total_sessions,
                types: plan.session_types,
                original: plan
              }))}
              value={data.plan_id}
              onChange={(val) => setData('plan_id', val)}
              placeholder="Escribe para buscar plan..."
              renderOption={(option) => (
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                        PLAN
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {option.insurance}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-xs truncate">{option.label}</p>
                    <p className="text-[9px] text-gray-500 truncate mt-0.5">
                      Incluye: {option.types || 'Varias sesiones'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono font-black text-sm text-brand-primary">
                      CLP {option.price?.toLocaleString('es-CL')}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {option.sessions ? `${option.sessions} Sesiones` : 'Ilimitado'}
                    </span>
                  </div>
                </div>
              )}
            />
          )}
        </div>
        <InputError message={errors.plan_id} className="mt-2" />
      </div>

      {/* SECCIÓN 2: Detalles del Plan Seleccionado */}
      <Transition
        show={!!selectedPlan}
        as="div"
        enter="transition ease-in-out duration-300"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="p-6 border border-blue-100 rounded-[1.5rem] bg-blue-50/30 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Resumen del Plan</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Procedencia</span>
                <p className="font-bold text-gray-800">{selectedPlan?.insurance_name || 'Clínica'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Valor Total</span>
                <p className="font-black text-brand-primary text-lg">
                  CLP {selectedPlan?.price ? Number(selectedPlan.price).toLocaleString('es-CL') : '0'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Sesiones</span>
                <p className="font-bold text-gray-800">{selectedPlan?.total_sessions || 'Ilimitadas'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Vigencia</span>
                <p className="font-bold text-gray-800">{selectedPlan?.valid_months} meses</p>
              </div>
              <div className="col-span-full space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Cobertura</span>
                <p className="font-medium text-gray-700 text-sm bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                  {selectedPlan?.session_types || 'No especificado'}
                </p>
              </div>
              {selectedPlan?.description && (
                <div className="col-span-full text-xs text-gray-500 italic bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                  "{selectedPlan.description}"
                </div>
              )}
          </div>
        </div>
      </Transition>

      {/* SECCIÓN 3: Detalles del Pago */}
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 text-xs font-black text-white bg-gray-800 rounded-full">2</span>
          Detalles del Pago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <EnterpriseSelect
              label="Método de Pago"
              value={data.payment_details.payment_method}
              onChange={(val) => setData('payment_details', { ...data.payment_details, payment_method: val })}
              options={[
                { value: 'cash', label: 'Efectivo / Presencial' },
                { value: 'card', label: 'Tarjeta (POS / Maquinita)' },
                { value: 'transfer', label: 'Transferencia Bancaria' },
                { value: 'webpay', label: 'Webpay (Pago Online)' },
                { value: 'payment_link', label: 'Generar Link de Pago (WhatsApp/Mail)' },
                { value: 'postpaid', label: 'Cobro Posterior (Generar Deuda)' },
              ]}
            />
            <InputError message={errors['payment_details.payment_method']} className="mt-2" />
          </div>

          <div>
            <label className="enterprise-label ml-1">Fecha de Pago</label>
            <input
              type="date"
              value={data.payment_details.payment_date}
              onChange={(e) => setData('payment_details', { ...data.payment_details, payment_date: e.target.value })}
              className="w-full px-5 py-4 text-sm font-bold border-gray-100 rounded-2xl bg-white focus:ring-brand-primary"
            />
            <InputError message={errors['payment_details.payment_date']} className="mt-2" />
          </div>

          <div>
            <label className="enterprise-label ml-1">Referencia (Opcional)</label>
            <input
              type="text"
              value={data.payment_details.transaction_reference}
              onChange={(e) => setData('payment_details', { ...data.payment_details, transaction_reference: e.target.value })}
              className="w-full px-5 py-4 text-sm font-bold border-gray-100 rounded-2xl bg-white focus:ring-brand-primary"
              placeholder="Ej: N° Operación 123456"
            />
            <InputError message={errors['payment_details.transaction_reference']} className="mt-2" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: Confirmación */}
      <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray bg-white border-2 border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
        >
          Cancelar
        </button>
        <PrimaryButton 
          disabled={processing || !data.plan_id}
          className="!px-10 !py-4 shadow-xl shadow-brand-primary/20"
        >
          {processing 
            ? 'Procesando...' 
            : data.payment_details.payment_method === 'payment_link' 
              ? 'Generar Link & Enviar' 
              : 'Confirmar Compra'}
        </PrimaryButton>

        <Transition
          show={recentlySuccessful}
          as="div"
          enter="transition ease-in-out duration-300"
          enterFrom="opacity-0"
          leave="transition ease-in-out duration-300"
          leaveTo="opacity-0"
        >
          <p className="text-xs font-bold text-green-600 animate-pulse">¡Plan adquirido correctamente!</p>
        </Transition>
      </div>
    </form>
  );
};

export default PlanPurchaseForm;
