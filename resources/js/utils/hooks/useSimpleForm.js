import { useState } from "react";

/**
 * Hook básico para manejo simple de formularios
 * Maneja estado básico y validación simple
 */
export const useSimpleForm = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Actualizar campo específico del formulario
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Validación básica
   */
  const validate = (requiredFields = []) => {
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "Este campo es requerido";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Resetear formulario
   */
  const reset = () => {
    setFormData(initialData);
    setErrors({});
  };

  /**
   * Establecer múltiples valores
   */
  const setValues = (values) => {
    setFormData((prev) => ({
      ...prev,
      ...values,
    }));
  };

  return {
    // Estados
    formData,
    errors,
    loading,

    // Métodos
    handleChange,
    validate,
    reset,
    setValues,
    setLoading,

    // Utilidades
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
  };
};
