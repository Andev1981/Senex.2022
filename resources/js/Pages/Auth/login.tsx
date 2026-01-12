import ApplicationLogo from "@/components/ApplicationLogo";
import Checkbox from "@/components/Checkbox";
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, FormEventHandler } from "react";
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
import InputError from '@/components/common/input-error';
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  // ... (Estados, useForm, y features se mantienen)

  /* const { appVersion } = usePage().props; */

  const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
    email: "",
    password: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("login"), { onFinish: () => reset("password") });
  };

  return (
    <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
      <Head title="Inicio de Sesión" />

      {/* Contenedor ÚNICO (Mobile First: Ocupa toda la pantalla) */}
      <div className="relative flex items-center justify-center p-6 min-h-dvh bg-gray-50/50">
        {/* Fondo (Imagen y Overlay) */}
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
          className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-primary/80 mix-blend-multiply" aria-hidden="true"
        />

        {/* Contenedor del Formulario Centrado */}
        <div className="relative z-10 w-full max-w-md p-4 sm:p-0">
          {/* Header / Logo / Mensaje de Bienvenida */}
          <div className="mb-5 text-center text-white">
            <div className="inline-flex items-center justify-center p-2 mb-6 transition-transform duration-500 transform shadow-2xl w-60 bg-gray-600/50 rounded-3xl hover:rotate-0">
              <Stethoscope className="w-10 h-10 text-brand-primary" />
              <ApplicationLogo />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
              Plataforma de Gestión Kinésica
            </p>
          </div>

          {/* TARJETA DEL FORMULARIO (Fondo Blanco) */}
          <div className="p-10 bg-white border border-white shadow-2xl rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-brand-primary/5 blur-2xl"></div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              {/* Título de la Tarjeta */}
              <div className="text-center sm:text-left">
                <h2 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900 uppercase">
                  Bienvenido
                </h2>
                <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-60">
                  Ingresa tus credenciales oficiales
                </p>
              </div>

              {/* Correo */}
              <div className="space-y-1">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
                  <Input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    tabIndex={1}
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@example.com"
                    className="w-full py-4 pl-12 pr-4 text-sm font-bold border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white"

                  />
                </div>
                <InputError message={errors.email} className="mt-2" />
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <div className="flex items-center justify-between pr-1">
                  <Label htmlFor="password">Contraseña</Label>
                  {/* {canResetPassword && (
                        <Link href={route("password.request")} className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:underline">¿Olvido Clave?</Link>
                    )} */}
                </div>
                <div className="relative group">
                  <Lock className="absolute w-4 h-4 transition-colors transform -translate-y-1/2 text-brand-gray left-4 top-1/2 group-focus-within:text-brand-primary" />
                  <Input
                    id="password"
                    type="password"
                    required
                    tabIndex={2}
                    autoComplete="current-password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="Password"
                    className="w-full py-4 pl-12 pr-12 text-sm font-bold border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute transition-colors transform -translate-y-1/2 text-brand-gray right-4 top-1/2 hover:text-brand-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <InputError message={errors.password} className="mt-2" />
              </div>

              {/* Opciones / Recordarme */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <Checkbox
                    name="remember"
                    checked={data.remember}
                    onChange={() => setData("remember", !data.remember)}
                    className="w-5 h-5 border-gray-200 rounded-lg text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="ml-3 text-[10px] font-black text-brand-gray uppercase tracking-widest group-hover:text-brand-primary transition-colors">
                    Recordarme
                  </span>
                </label>
              </div>

              {/* Botón de Submit */}
              <button
                type="submit"
                disabled={processing}
                className="flex items-center justify-center w-full gap-3 py-5 font-black text-white uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl bg-brand-primary hover:brightness-110 rounded-[1.5rem] shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <>
                    Acceder al Sistema
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-10 text-[9px] text-white font-black uppercase tracking-[0.2em] opacity-80">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Cifrado SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Privacidad</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {/* <span>Sysmed v{appVersion}</span> */}
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
