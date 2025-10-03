import ApplicationLogo from "@/Components/ApplicationLogo";
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  CheckCircle,
  Shield,
  Zap,
  Users,
  Calendar,
  Activity,
  Chrome,
  Facebook,
  Smartphone,
} from "lucide-react";

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState("login");

  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gestiona todas tus citas en un solo lugar",
    },
    {
      icon: Users,
      title: "Gestión de Pacientes",
      description: "Historial completo y seguimiento personalizado",
    },
    {
      icon: Activity,
      title: "Seguimiento en Tiempo Real",
      description: "Monitorea el progreso de cada tratamiento",
    },
    {
      icon: Shield,
      title: "Datos Seguros",
      description: "Cumplimiento total con normativas de salud",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route("login"), { onFinish: () => reset("password") });
  };

  /* const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Inicio de sesión exitoso");
    }, 2000);
  }; */

  return (
    <GuestLayout>
      <Head title="Inicio de Sesión" />

      <div
        className="relative flex items-center justify-center p-4 min-h-dvh"
        style={{
          backgroundImage:
            'url("https://www.senex.cl/wp-content/uploads/2020/08/1024x689.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
        {/* contenido */}
        <div className="relative z-10 flex w-full max-w-5xl">
          {/* Columna única (podrías agregar una imagen/beneficios a la derecha si quieres) */}
          <div className="flex items-center justify-center flex-1">
            <div className="w-full max-w-md">
              {/* Header / Logo */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center">
                  <Link href="/">
                    {/* Reemplaza por tu componente de logo */}
                    <ApplicationLogo className="text-gray-100 fill-current w-36" />
                  </Link>
                </div>
                <p className="font-bold text-white">
                  Gestión Profesional de Kinesiología
                </p>
              </div>

              <div className="p-8 bg-white border border-gray-200 shadow-2xl rounded-2xl">
                <form onSubmit={handleSubmit}>
                  {/* Login Card */}
                  {loginMode === "login" && (
                    <div>
                      <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                          Bienvenido
                        </h2>
                        <p className="text-gray-600">
                          Ingresa tus credenciales para continuar
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Correo Electrónico
                          </label>
                          <div className="relative">
                            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <TextInput
                              id="email"
                              type="email"
                              name="email"
                              value={data.email}
                              className="w-full py-3 pl-10 pr-4 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                              autoComplete="username"
                              isFocused={true}
                              onChange={(e) => setData("email", e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Contraseña
                          </label>
                          <div className="relative">
                            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <TextInput
                              id="password"
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={data.password}
                              className="w-full py-3 pl-10 pr-12 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                              autoComplete="current-password"
                              onChange={(e) =>
                                setData("password", e.target.value)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Recordarme
                            </span>
                          </label>
                          <button
                            onClick={() => setLoginMode("forgot")}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            ¿Olvidaste tu contraseña?
                          </button>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={processing}
                          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                              Iniciando sesión...
                            </>
                          ) : (
                            <>
                              Iniciar Sesión
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 text-gray-500 bg-white"></span>
                        </div>
                      </div>

                      {/* <div className="grid grid-cols-3 gap-3">
                        <button className="flex items-center justify-center py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <Chrome className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="flex items-center justify-center py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <Facebook className="w-5 h-5 text-blue-600" />
                        </button>
                        <button className="flex items-center justify-center py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <Smartphone className="w-5 h-5 text-gray-600" />
                        </button>
                      </div> */}

                      {/* <div className="mt-6 text-center">
                        <p className="text-gray-600">
                          ¿No tienes una cuenta?{" "}
                          <button
                            onClick={() => setLoginMode("register")}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Regístrate gratis
                          </button>
                        </p>
                      </div> */}
                    </div>
                  )}

                  {loginMode === "register" && (
                    <div>
                      <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                          Crear Cuenta
                        </h2>
                        <p className="text-gray-600">
                          Completa tus datos para empezar
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                              Nombre
                            </label>
                            <input
                              type="text"
                              placeholder="Juan"
                              className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                              Apellido
                            </label>
                            <input
                              type="text"
                              placeholder="Pérez"
                              className="w-full px-4 py-3 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Correo Electrónico
                          </label>
                          <div className="relative">
                            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              className="w-full py-3 pl-10 pr-4 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Contraseña
                          </label>
                          <div className="relative">
                            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full py-3 pl-10 pr-12 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="p-3 border-2 border-blue-200 bg-blue-50 rounded-xl">
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-xs text-gray-700">
                              Acepto los{" "}
                              <span className="font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                                Términos y Condiciones
                              </span>{" "}
                              y la{" "}
                              <span className="font-medium text-blue-600 cursor-pointer hover:text-blue-700">
                                Política de Privacidad
                              </span>
                            </span>
                          </label>
                        </div>

                        <button
                          onClick={handleSubmit}
                          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-blue-500/30"
                        >
                          Crear Cuenta
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-6 text-center">
                        <p className="text-gray-600">
                          ¿Ya tienes cuenta?{" "}
                          <button
                            onClick={() => setLoginMode("login")}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Inicia sesión
                          </button>
                        </p>
                      </div>
                    </div>
                  )}

                  {loginMode === "forgot" && (
                    <div>
                      <div className="mb-6">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                          Recuperar Contraseña
                        </h2>
                        <p className="text-gray-600">
                          Ingresa tu correo y te enviaremos instrucciones para
                          restablecer tu contraseña
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-2 text-sm font-semibold text-gray-700">
                            Correo Electrónico
                          </label>
                          <div className="relative">
                            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              className="w-full py-3 pl-10 pr-4 transition-colors border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleSubmit}
                          className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl shadow-blue-500/30"
                        >
                          Enviar Instrucciones
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setLoginMode("login")}
                          className="font-semibold text-blue-600 hover:text-blue-700"
                        >
                          ← Volver al inicio de sesión
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-50">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Conexión Segura</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>SSL Certificado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>Acceso Rápido</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
