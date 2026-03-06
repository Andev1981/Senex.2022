export default function ConnectionBanner({ status }) {
    if (status === 'online') return null;

    const config = {
        offline: {
            bg: 'bg-amber-500',
            icon: '📶',
            text: 'Sin conexión a internet. Los cambios se guardarán localmente.',
        },
        expired: {
            bg: 'bg-red-600',
            icon: '🔑',
            text: 'Tu sesión ha caducado. Por favor, no cierres esta pestaña y abre el sistema en otra para re-autenticarte.',
        }
    };

    const { bg, icon, text } = config[status];

    return (
        <div className={`${bg} text-white px-4 py-2 flex items-center justify-center space-x-2 transition-all duration-500`}>
            <span>{icon}</span>
            <span className="font-medium">{text}</span>
        </div>
    );
}