import { useState, useEffect } from 'react';
import axios from 'axios';

export function useSessionKeeper(minutes = 5) {
    const [status, setStatus] = useState('online'); // 'online', 'offline', 'expired'

    useEffect(() => {
        const ping = async () => {
            try {
                await axios.get('/session-keep-alive');
                setStatus('online');
            } catch (error) {
                if (error.response?.status === 419 || error.response?.status === 401) {
                    setStatus('expired');
                } else {
                    setStatus('offline'); // Error de red
                }
            }
        };

        const timer = setInterval(ping, minutes * 60 * 1000);
        
        // Eventos nativos del navegador para mayor precisión
        const handleOnline = () => setStatus('online');
        const handleOffline = () => setStatus('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(timer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [minutes]);

    return status;
}