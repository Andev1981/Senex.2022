import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast'; // O la librería que uses

export default function FormDraftKeeper({ formKey, data, setData }) {
    const { url } = usePage();
    // Usamos una combinación de la URL y una clave única para no mezclar borradores
    const storageKey = `draft_${url}_${formKey}`;

    // 1. Al montar el componente: Cargar borrador si existe
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsedData = JSON.parse(saved);
            // Solo restauramos si el usuario confirma (para evitar confusiones)
            toast((t) => (
                <span className="flex flex-col gap-2">
                    <b>Borrador encontrado</b>
                    ¿Deseas recuperar los datos no guardados?
                    <div className="flex gap-2">
                        <button onClick={() => { setData(parsedData); toast.dismiss(t.id); }} className="bg-blue-500 text-white px-2 py-1 rounded">Sí</button>
                        <button onClick={() => { localStorage.removeItem(storageKey); toast.dismiss(t.id); }} className="bg-gray-200 px-2 py-1 rounded">No</button>
                    </div>
                </span>
            ), { duration: 6000 });
        }
    }, []);

    // 2. Cada vez que cambien los datos: Guardar silenciosamente
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem(storageKey, JSON.stringify(data));
        }, 1000); // Debounce de 1 segundo para no saturar el storage

        return () => clearTimeout(timeout);
    }, [data]);

    return null; // No ocupa espacio en el DOM
}