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
  Shield,
  CheckCircle,
  Zap,
} from "lucide-react";

export default function Login({ status, canResetPassword }) {
  // ... (Estados, useForm, y features se mantienen)

  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState("login"); // Asumo que usas 'login' o 'register'

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("login"), { onFinish: () => reset("password") });
  };

  return (
    <GuestLayout>
      <Head title="Inicio de Sesión" />

      {/* Contenedor ÚNICO (Mobile First: Ocupa toda la pantalla) */}
      <div className="relative flex items-center justify-center p-4 min-h-dvh">
        {/* Fondo (Imagen y Overlay) - Aplica a toda la pantalla */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'url("https://www.senex.cl/wp-content/uploads/2020/08/1024x689.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Overlay Degradado Sutil sobre el fondo */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-cyan-500/70"
          aria-hidden="true"
        />

        {/* Contenedor del Formulario Centrado */}
        <div className="relative z-10 w-full max-w-sm p-4 sm:p-0">
          {/* Header / Logo / Mensaje de Bienvenida (Visible en Mobile) */}
          <div className="mb-6 text-center text-white">
            <Link href="/" className="inline-block mb-3">
              {/* Ajustamos el color del logo para que contraste con el fondo oscuro/degradado */}
              <Stethoscope className="w-10 h-10 mx-auto text-white" />
            </Link>
            <h1 className="text-2xl font-extrabold">
              Acceso a Plataforma Kinésica
            </h1>
            {/* Mensaje de valor resumido para Mobile */}
            <p className="text-sm opacity-90">
              Centraliza tu gestión y enfócate en el paciente.
            </p>
          </div>

          {/* TARJETA DEL FORMULARIO (Fondo Blanco) */}
          <div className="p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título de la Tarjeta */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Bienvenido</h2>
                <p className="text-sm text-gray-600">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              {/* Correo */}
              <div>
                <InputLabel htmlFor="email" value="Correo Electrónico" />
                <div className="relative mt-1">
                  <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="w-full py-3 pl-10 pr-4 rounded-xl"
                    autoComplete="username"
                    onChange={(e) => setData("email", e.target.value)}
                  />
                </div>
                <InputError message={errors.email} className="mt-2" />
              </div>

              {/* Contraseña */}
              <div>
                <InputLabel htmlFor="password" value="Contraseña" />
                <div className="relative mt-1">
                  <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    className="w-full py-3 pl-10 pr-12 rounded-xl"
                    autoComplete="current-password"
                    onChange={(e) => setData("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-blue-500"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <InputError message={errors.password} className="mt-2" />
              </div>

              {/* Opciones / Enlace Olvidé Contraseña */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer">
                  <Checkbox
                    name="remember"
                    checked={data.remember}
                    onChange={(e) => setData("remember", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                </label>
                {/* {canResetPassword && (
                  <Link
                    href={route("password.request")}
                    className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                )} */}
              </div>

              {/* Botón de Submit */}
              <button
                type="submit"
                disabled={processing}
                className="flex items-center justify-center w-full gap-2 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </form>
          </div>

          {/* Trust Indicators (Ahora bajo el formulario, no flotando) */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-white sm:justify-between sm:gap-6">
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
        </div>
      </div>
    </GuestLayout>
  );
}
