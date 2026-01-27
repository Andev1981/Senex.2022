import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Loader2 } from 'lucide-react';

const PlansCard = ({ onAddPlan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setPlans([]);
      return;
    }

    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(route('plans.index'), {
          params: { search: searchTerm, is_internal: true }
        });
        setPlans(response.data.plans);
      } catch (err) {
        setError('No se pudieron buscar los planes.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchPlans();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleAddPlan = (plan) => {
    onAddPlan({
        is_plan: true,
        plan_id: plan.id,
        session_type_id: null, // No es una sesión
        quantity: 1,
        unit_price_clp: plan.price,
        name: `Plan: ${plan.name}`,
        insurance_name: plan.insurance_name, // <-- Añadir este detalle
        session_types: plan.session_types,   // <-- Añadir este detalle
        // El precio del plan es directo para el paciente en el POS
        unit_patient_clp: plan.price, 
        unit_insurance_primary_clp: 0,
        unit_insurance_secondary_clp: 0,
    });
    setSearchTerm('');
    setPlans([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
      <h3 className="font-bold text-gray-800">Vender Plan de Tratamiento</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar plan por nombre..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />}
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {plans.map(plan => (
          <div key={plan.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-sm text-gray-800">{plan.name}</p>
              <p className="text-xs text-gray-500">
                <span className="font-bold">{plan.insurance_name}</span> | CLP {plan.price?.toLocaleString('es-CL')}
              </p>
              <p className="text-xs text-blue-600 mt-1 truncate" title={plan.session_types}>
                Sesiones: {plan.session_types || 'No especificadas'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddPlan(plan)}
              className="p-2 text-green-600 bg-green-100 hover:bg-green-200 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansCard;
