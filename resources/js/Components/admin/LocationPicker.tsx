import { useEffect, useRef, useState } from 'react';

interface LocationPickerProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 }; // Santiago Centro

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    // 1. CARGA DEL SCRIPT (Igual que en MapViewer, idealmente extraer a un hook useGoogleMaps)
    useEffect(() => {
        if (isMapReady) return;

        const initMap = () => {
             if (window.google?.maps?.importLibrary) {
                loadMap();
                return;
            }
            // Verificar si ya existe
            if (document.querySelector('script[src*="maps.googleapis.com"]')) {
                 const interval = setInterval(() => {
                    if (window.google?.maps?.importLibrary) {
                        clearInterval(interval);
                        loadMap();
                    }
                }, 100);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&loading=async&libraries=maps,marker&v=weekly`;
            script.async = true;
            script.defer = true;
            script.onload = () => loadMap();
            document.head.appendChild(script);
        };

        initMap();
    }, []);

    const loadMap = async () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const { Map } = await window.google.maps.importLibrary("maps") as any;
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker") as any;

        const initialPos = (lat && lng && lat !== 0 && lng !== 0) ? { lat, lng } : DEFAULT_CENTER;

        mapInstanceRef.current = new Map(mapRef.current, {
            center: initialPos,
            zoom: 13,
            mapId: "ADMIN_PICKER_MAP", // MapID es requerido para AdvancedMarker
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
        });

        // Crear marcador arrastrable
        markerRef.current = new AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: initialPos,
            gmpDraggable: true,
            title: "Ubicación de la tienda"
        });

        // Evento: Al terminar de arrastrar
        markerRef.current.addListener('dragend', (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            onLocationChange(newLat, newLng);
        });

        // Evento: Al hacer clic en el mapa
        mapInstanceRef.current.addListener('click', (event: any) => {
            const newLat = event.latLng.lat();
            const newLng = event.latLng.lng();
            
            markerRef.current.position = { lat: newLat, lng: newLng };
            onLocationChange(newLat, newLng);
        });

        setIsMapReady(true);
    };

    // Actualizar posición si cambia desde fuera (ej: al abrir editar)
    useEffect(() => {
        if(isMapReady && markerRef.current && lat && lng) {
             // Solo mover si la distancia es significativa para evitar loops, 
             // o confiar en que el usuario no edita los inputs manuales mientras arrastra.
             const currentPos = markerRef.current.position;
             // Simple check
             if(Math.abs(currentPos.lat - lat) > 0.00001 || Math.abs(currentPos.lng - lng) > 0.00001){
                 markerRef.current.position = { lat, lng };
                 mapInstanceRef.current.panTo({ lat, lng });
             }
        }
    }, [lat, lng, isMapReady]);

    return (
        <div className="w-full h-full rounded-md overflow-hidden">
            <div ref={mapRef} className="w-full h-full" />
             {!isMapReady && (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                    Cargando Mapa...
                </div>
            )}
        </div>
    );
}
