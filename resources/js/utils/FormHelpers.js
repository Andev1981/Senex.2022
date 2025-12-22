// resources/js/Utils/FormHelpers.js

/**
 * Mapea los errores de validación de Axios al useForm de Inertia
 * @param {Object} error - El objeto de error capturado por catch
 * @param {Function} setError - La función setError de useForm
 */
export const handleServerErrors = (error, setError) => {
  if (error.response && error.response.status === 422) {
    const serverErrors = error.response.data.errors;

    Object.keys(serverErrors).forEach((field) => {
      // Seteamos el error en el campo correspondiente
      setError(field, serverErrors[field][0]);
    });

    // Opcional: Foco automático al primer campo con error
    const firstErrorField = Object.keys(serverErrors)[0];
    const element = document.getElementsByName(firstErrorField)[0];
    if (element) element.focus();

    return true;
  }
  return false;
};
