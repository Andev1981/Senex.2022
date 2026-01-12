import { useEffect, useRef } from 'react';
import axios from 'axios';

// Global reference to allow manual tracking from any component
let trackManualEvent: (type: string, metadata?: any) => void = () => { };

export function useAnalytics() {
    const buffer = useRef<any[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getVisitorId = () => {
        let id = localStorage.getItem('visitor_id');
        if (!id) {
            id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            localStorage.setItem('visitor_id', id);
        }
        return id;
    };

    const sendData = async (eventsToSend: any[] = []) => {
        const payload = {
            visitor_id: getVisitorId(),
            url: window.location.pathname,
            events: [...buffer.current, ...eventsToSend],
        };
        buffer.current = [];
        try {
            await axios.post('analytics/track', payload);
        } catch (error) {
            console.error('Analytics failed', error);
        }
    };

    // Define the manual tracking function
    trackManualEvent = (type: string, metadata: any = {}) => {
        const event = {
            type,
            metadata,
            x: null,
            y: null,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            element_id: 'manual_trigger',
        };
        buffer.current.push(event);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => sendData(), 500);
    };

    useEffect(() => {
        sendData([{ type: 'pageview' }]);

        const handleClick = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            const target = e.target as HTMLElement;
            const elementId = target.id || target.className || target.tagName;

            // Simple heuristic to identify CTA clicks
            let eventType = 'click';
            if (target.closest('a[href*="wa.me"]')) eventType = 'contact_whatsapp';
            if (target.closest('a[href*="google.com/maps/dir"]')) eventType = 'contact_directions';

            const event = {
                type: eventType,
                x: x.toFixed(2),
                y: y.toFixed(2),
                screen_width: window.innerWidth,
                screen_height: window.innerHeight,
                element_id: typeof elementId === 'string' ? elementId.substring(0, 50) : 'unknown',
            };

            buffer.current.push(event);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => sendData(), 1000);
        };

        window.addEventListener('click', handleClick);
        const intervalId = setInterval(() => sendData(), 30000);

        return () => {
            window.removeEventListener('click', handleClick);
            clearInterval(intervalId);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);
}

// Export the helper to use it in Welcome.tsx or other components
export const trackEvent = (type: string, metadata?: any) => trackManualEvent(type, metadata);