import { useState, useEffect } from "react";

/**
 * Hook para detectar si una media query coincide
 * @param {string} query - Media query a evaluar (ej: "(min-width: 1024px)")
 * @returns {boolean}
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        
        const listener = () => setMatches(media.matches);
        
        // Inicializar
        listener();
        
        // Escuchar cambios
        media.addEventListener("change", listener);
        
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}
