import { useEffect, useState } from 'react';

const ParallaxBackground = () => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        // Función optimizada para el efecto parallax
        const handleScroll = () => {
            // requestAnimationFrame asegura que la animación sea fluida (60fps)
            window.requestAnimationFrame(() => {
                // Multiplicamos por 0.5 para que el fondo se mueva a la mitad de velocidad
                setOffset(window.scrollY * 0.5);
            });
        };

        window.addEventListener('scroll', handleScroll);

        // Limpieza del evento al desmontar
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden">
            {/* Contenedor de la imagen.
        - Se hace un poco más alto (h-[120%]) para evitar bordes blancos al hacer scroll.
        - translate-y maneja el movimiento.
      */}
            <div
                className="absolute top-0 left-0 h-[120%] w-full bg-cover bg-center bg-no-repeat transition-transform duration-75 ease-out will-change-transform"
                style={{
                    transform: `translateY(${offset}px)`,
                    backgroundImage: "url('https://poemaparamascotas.com/wp-content/uploads/2024/07/mids1-po-scaled.webp')",
                }}
            ></div>

            {/* Overlay (Capa oscura).
        Es CRUCIAL para que el texto blanco de tu app se lea bien sobre la imagen.
        Usamos un degradado para que se vea más profesional.
      */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/40 to-gray-900/60"></div>
        </div>
    );
};

export default ParallaxBackground;
