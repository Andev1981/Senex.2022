import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import Swal from "sweetalert2";
import { RefreshCw, Terminal, GitBranch } from 'lucide-react';
import axios from 'axios';

export default function DevToolbar() {
    // 1. Verificar si el entorno es 'local'
    const { props, component } = usePage();
    const { env, dev_users, auth, pendingJobsCount, currentRouteName, projectPath, gitInfo } = props;
    const [userId, setUserId] = useState(auth?.user?.id ? String(auth.user.id) : '');
    const [debugCss, setDebugCss] = useState(false);

    useEffect(() => {
        if (auth?.user?.id) {
            setUserId(String(auth.user.id));
        }
    }, [auth?.user?.id]);

    useEffect(() => {
        // Limpiar parámetros legacy de la URL si existen
        const params = new URLSearchParams(window.location.search);
        if (params.has('dev_success')) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }

        // Verificar mensaje de éxito en sessionStorage (limpio y sin rastro en URL)
        if (sessionStorage.getItem('dev_maintenance_success')) {
            // Borrar inmediatamente para que no salga al dar F5 de nuevo
            sessionStorage.removeItem('dev_maintenance_success');

            Swal.fire({
                icon: 'success',
                title: 'Mantenimiento Completado',
                html: `
                    <div class="text-left text-sm space-y-1">
                        <p>✅ Caché del sistema eliminada</p>
                        <p>✅ Rutas y configuración limpias</p>
                        <p>✅ Vistas recompiladas</p>
                        <p>✅ Storage Link verificado</p>
                    </div>
                `,
                confirmButtonText: 'Excelente',
                confirmButtonColor: '#1e3a8a',
                timer: 5000,
                timerProgressBar: true
            });
        }
    }, []);

    if (env !== 'local') return null;

    const runCommand = (route, label) => {
        router.post('/dev/' + route, {}, {
            onSuccess: () => toast.success(label + ' ejecutado'),
            onError: () => toast.error('Error al ejecutar ' + label),
        });
    };

    const handleLoginAs = (e) => {
        e.preventDefault();
        if(!userId) return;
        router.post('/dev/login-as/' + userId, {}, {
             onSuccess: () => toast.success('Login exitoso como ID: ' + userId),
             onError: () => toast.error('Error al hacer login')
        });
    }

    const handleResetDb = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Esto borrará toda la base de datos y la sembrará de nuevo!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, reiniciar DB',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Mostrar loader o toast de carga podría ser útil, pero por ahora simple
                const toastId = toast.loading('Reiniciando base de datos...');
                router.post('/dev/migrate-fresh', {}, {
                    onSuccess: () => {
                        toast.dismiss(toastId);
                        Swal.fire('Reiniciado', 'La base de datos ha sido reiniciada.', 'success');
                    },
                    onError: () => {
                        toast.dismiss(toastId);
                        Swal.fire('Error', 'Hubo un problema al reiniciar la DB.', 'error');
                    }
                });
            }
        });
    }

    const handleRefreshApp = async () => {
        const commands = [
            { route: 'optimize', label: 'Limpiando Sistema Completo...' },
            { route: 'storage-link', label: 'Verificando Storage Link...' },
        ];

        Swal.fire({
            title: 'Limpiando Sistema',
            html: 'Iniciando...',
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false
        });

        for (const cmd of commands) {
            if (Swal.getHtmlContainer()) {
                Swal.getHtmlContainer().textContent = cmd.label;
            }
            
            try {
                await axios.post('/dev/' + cmd.route);
            } catch (error) {
                console.error(`Error en ${cmd.label}`, error);
                toast.error(`Error en ${cmd.label}`);
            }
            
            // Pequeño delay visual
            await new Promise(r => setTimeout(r, 300));
        }

        // Marcar éxito en sesión y recargar limpio
        sessionStorage.setItem('dev_maintenance_success', 'true');
        window.location.href = window.location.pathname;
    };

    const handleShowProps = () => {
        console.group('🔍 Inertia Page Props');
        console.log(props);
        console.groupEnd();
        
        Swal.fire({
            title: 'Page Props',
            html: `<pre class="text-left text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-[70vh] font-mono shadow-inner">${JSON.stringify(props, null, 2)}</pre>`,
            width: '800px',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#1e3a8a',
            background: '#1f2937',
            color: '#fff'
        });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-8 bg-gray-900 text-white text-xs z-[100] flex items-center shadow-md overflow-x-auto border-b border-gray-700">
            {/* Title */}
            <div className="px-3 py-2 font-bold text-yellow-400 bg-gray-950 uppercase tracking-wider shrink-0 border-r border-gray-700 select-none">
                Dev
            </div>

            {/* --- GROUP 1: SYSTEM (Refresh, Git) --- */}
            <div className="flex items-center px-2 gap-2 border-r border-gray-700 shrink-0 h-full hover:bg-gray-800/30 transition-colors">
                {/* Refresh */}
                <button 
                    onClick={handleRefreshApp}
                    className="bg-blue-900/40 hover:bg-blue-800 text-blue-100 text-[10px] px-2 py-0.5 rounded border border-blue-700/50 flex items-center gap-1 transition-all"
                    title="Limpiar caché y optimizar"
                >
                    ⚡ Refresh
                </button>

                {/* Git Info */}
                {gitInfo && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono select-none opacity-75" title="Git Info">
                        <GitBranch size={10} />
                        <span>{gitInfo.replace('git:', '').trim()}</span>
                    </div>
                )}
            </div>

            {/* --- GROUP 2: DATA (Seed, Reset, Jobs) --- */}
            <div className="flex items-center px-2 gap-3 border-r border-gray-700 shrink-0 h-full hover:bg-gray-800/30 transition-colors">
                {/* Jobs */}
                <div className="flex items-center gap-1">
                    {pendingJobsCount > 0 ? (
                        <>
                            <span className="bg-red-900/80 text-red-100 text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse cursor-default" title="Jobs Pendientes">
                                🔥 {pendingJobsCount}
                            </span>
                            <button onClick={() => runCommand('run-jobs', 'Procesar')} className="bg-red-800 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-[10px] transition-colors" title="Procesar Jobs">▶</button>
                        </>
                    ) : (
                        <span className="text-green-500/40 text-[10px] border border-green-500/20 px-1.5 py-0.5 rounded cursor-default select-none">Jobs OK</span>
                    )}
                    <button onClick={() => runCommand('dispatch-test-job', 'Test Job')} className="hover:bg-gray-700 text-gray-500 hover:text-white p-1 rounded transition-colors" title="Encolar Test Job"><RefreshCw size={10} /></button>
                </div>

                {/* Seeding */}
                <div className="flex gap-1">
                    <button onClick={() => runCommand('seed/attendance/completed', 'Seed Completed')} className="hover:bg-green-900/50 text-green-300/70 hover:text-green-200 px-1.5 py-0.5 rounded text-[10px] border border-green-900/30 transition-colors" title="Crear Cita Completada">✅ Cita</button>
                    <button onClick={() => runCommand('seed/attendance/scheduled', 'Seed Scheduled')} className="hover:bg-yellow-900/50 text-yellow-300/70 hover:text-yellow-200 px-1.5 py-0.5 rounded text-[10px] border border-yellow-900/30 transition-colors" title="Crear Cita Pendiente">⏳ Cita</button>
                </div>

                {/* Reset DB */}
                <button onClick={handleResetDb} className="bg-red-950/30 hover:bg-red-900 text-red-300/60 hover:text-red-100 px-1.5 py-0.5 rounded border border-red-900/30 text-[10px] transition-colors" title="Reset Database">☢ DB</button>
            </div>

            {/* --- GROUP 3: USER --- */}
            <div className="flex items-center px-2 gap-2 border-r border-gray-700 shrink-0 h-full hover:bg-gray-800/30 transition-colors">
                <form onSubmit={handleLoginAs} className="flex gap-1 items-center">
                    <select 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-32 py-0.5 bg-gray-800 text-gray-300 text-[10px] border border-gray-600 rounded px-1 focus:outline-none focus:border-yellow-400 cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                        <option value="" className="bg-gray-800">👤 Cambiar</option>
                        {dev_users && dev_users.map(u => (
                            <option key={u.id} value={String(u.id)} className="bg-gray-800 text-white">
                                {u.name.substring(0, 15)} ({u.roles[0]?.substring(0,3) || '-'})
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="text-gray-500 hover:text-yellow-300 transition-colors" title="Login">👤</button>
                </form>
            </div>

            {/* --- GROUP 4: DEBUG TOOLS --- */}
            <div className="flex items-center px-2 gap-3 shrink-0 h-full hover:bg-gray-800/30 transition-colors">
                <a href="/telescope" target="_blank" className="hover:text-purple-300 text-purple-400/70 flex items-center gap-1 transition-colors" title="Telescope">🔭</a>
                
                {/* Tailwind Monitor */}
                <div className="flex items-center justify-center w-6 h-4 bg-gray-800 rounded text-[9px] font-bold text-gray-500 border border-gray-700 cursor-help select-none" title="Breakpoint Actual">
                    <span className="block sm:hidden">XS</span>
                    <span className="hidden sm:block md:hidden">SM</span>
                    <span className="hidden md:block lg:hidden">MD</span>
                    <span className="hidden lg:block xl:hidden">LG</span>
                    <span className="hidden xl:block 2xl:hidden">XL</span>
                    <span className="hidden 2xl:block">2X</span>
                </div>

                <button onClick={handleShowProps} className="hover:text-cyan-300 text-gray-500 hover:bg-gray-700/50 p-1 rounded transition-colors" title="Ver Props"><Terminal size={12} /></button>
                
                <button 
                    onClick={() => setDebugCss(!debugCss)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${debugCss ? 'bg-yellow-500 text-black font-bold' : 'text-gray-500 hover:text-yellow-300 hover:bg-gray-700/50'}`}
                    title="Debug CSS (Outlines)"
                >
                    🎨
                </button>
            </div>

            {/* --- GROUP 5: CONTEXT (Right Aligned) --- */}
            <div className="ml-auto flex items-center gap-2 px-3 text-[10px] text-gray-500 font-mono border-l border-gray-700 shrink-0 bg-gray-950/30 h-full select-none">
                {projectPath ? (
                    <a 
                        href={`vscode://file/${projectPath}/resources/js/Pages/${component}.jsx`}
                        title="Abrir en VS Code"
                        className="text-gray-400 hover:text-white hover:underline cursor-pointer transition-colors"
                    >
                        {component}
                    </a>
                ) : (
                    <span className="text-gray-600 cursor-not-allowed" title="Path no disponible">{component}</span>
                )}
                <span className="opacity-30">|</span>
                <span className="text-gray-600" title="Ruta Laravel">{currentRouteName || 'n/a'}</span>
            </div>
            
            {/* Style Injection */}
            {debugCss && <style>{`* { outline: 1px solid red !important; }`}</style>}
        </div>
    );
}