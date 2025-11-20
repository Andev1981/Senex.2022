import { useState, useCallback } from "react";
import { Inertia } from "@inertiajs/inertia";

/**
 * Hook básico para llamadas API
 * Maneja requests simples sin funcionalidades avanzadas
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Realizar petición POST
   */
  const post = useCallback(async (url, data = {}, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      await Inertia.post(url, data, {
        ...options,
        onError: (errors) => {
          setError(errors);
          if (options.onError) options.onError(errors);
        },
      });
    } catch (err) {
      setError(err.message || "Error en la petición");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realizar petición PUT
   */
  const put = useCallback(async (url, data = {}, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      await Inertia.put(url, data, {
        ...options,
        onError: (errors) => {
          setError(errors);
          if (options.onError) options.onError(errors);
        },
      });
    } catch (err) {
      setError(err.message || "Error en la petición");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realizar petición DELETE
   */
  const deleteItem = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      await Inertia.delete(url, {
        ...options,
        onError: (errors) => {
          setError(errors);
          if (options.onError) options.onError(errors);
        },
      });
    } catch (err) {
      setError(err.message || "Error en la petición");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realizar petición GET (visit)
   */
  const get = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      await Inertia.get(url, options);
    } catch (err) {
      setError(err.message || "Error en la petición");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // Estados
    loading,
    error,

    // Métodos
    post,
    put,
    delete: deleteItem,
    get,
    clearError,
  };
};
