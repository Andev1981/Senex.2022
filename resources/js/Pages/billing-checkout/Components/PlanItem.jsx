import React from 'react';
import { X } from 'lucide-react';

const PlanItem = ({ item, onRemove }) => {
  return (
    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-blue-900">{item.name}</p>
          <p className="text-xs text-gray-600">
            {item.insurance_name} | Sesiones: {item.session_types || 'No especificadas'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-end">
        <p className="font-bold text-gray-800">
          CLP {item.unit_price_clp?.toLocaleString('es-CL')}
        </p>
      </div>
    </div>
  );
};

export default PlanItem;
