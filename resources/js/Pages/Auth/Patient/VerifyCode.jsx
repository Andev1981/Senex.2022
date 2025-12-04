import { useState, useRef, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ShieldCheck, Mail, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import axios from "axios";

export default function VerifyCode({ rut, email, patient_name }) {
  const { errors: pageErrors } = usePage().props;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Sincronizar errores de Inertia
  useEffect(() => {
    if (pageErrors?.code) {
      setErrors({ code: pageErrors.code });
      setProcessing(false);
    }
  }, [pageErrors]);

  const clearErrors = () => {
    setErrors({});
  };

  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    clearErrors();

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join("");
    if (fullCode.length === 6) {
      setTimeout(() => handleSubmit(fullCode), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      setTimeout(() => handleSubmit(pastedData), 100);
    }
  };

  const handleSubmit = (fullCode = null) => {
    const codeToSubmit = fullCode || code.join("");

    if (codeToSubmit.length !== 6 || processing) return;

    setProcessing(true);
    clearErrors();

    router.post(
      route("patient.verify-code"),
      {
        rut: rut,
        code: codeToSubmit,
      },
      {
        onError: (errors) => {
          setErrors(errors);
          setProcessing(false);
        },
      }
    );
  };

  const handleResendCode = async () => {
    if (resending) return;

    setResending(true);
    setResendSuccess(false);
    clearErrors();

    try {
      const response = await axios.post(route("patient.resend-code"), { rut });

      if (response.data.success) {
        setResendSuccess(true);
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al reenviar el código.";
      setErrors({ code: message });
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    router.visit(route("patient.login"));
  };

  return (
    <>
      <Head title="Verificar Código" />

      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full shadow-lg bg-gradient-to-br from-indigo-600 to-purple-600">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Verificar Código
            </h1>
            <p className="text-gray-600">
              Hola, <strong>{patient_name}</strong>
            </p>
          </div>

          {/* Card Principal */}
          <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
            <div className="px-8 py-10">
              {/* Mensaje de email enviado */}
              <div className="p-4 mb-6 border-l-4 border-indigo-500 rounded-lg bg-indigo-50">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-indigo-900">
                      Código enviado a tu email
                    </p>
                    <p className="text-sm text-indigo-700">{email}</p>
                    <p className="mt-2 text-xs text-indigo-600">
                      El código expira en 15 minutos
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensaje de éxito al reenviar */}
              {resendSuccess && (
                <div className="p-4 mb-6 border-l-4 border-green-500 rounded-lg bg-green-50">
                  <p className="text-sm font-medium text-green-900">
                    ✓ Código reenviado exitosamente
                  </p>
                </div>
              )}

              {/* Inputs de código */}
              <div className="mb-6">
                <label className="block mb-4 text-sm font-medium text-center text-gray-700">
                  Ingresa el código de 6 dígitos
                </label>

                <div
                  className="flex justify-center gap-2 mb-4"
                  onPaste={handlePaste}
                >
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`
                        w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                        transition-all duration-200
                        ${
                          errors.code
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "border-gray-300 hover:border-gray-400"
                        }
                        ${
                          digit && !errors.code
                            ? "border-indigo-500 bg-indigo-50"
                            : ""
                        }
                      `}
                      disabled={processing}
                    />
                  ))}
                </div>

                {errors.code && (
                  <p className="flex items-center justify-center gap-1 text-sm text-center text-red-600">
                    <span>⚠️</span>
                    {errors.code}
                  </p>
                )}
              </div>

              {/* Loading indicator */}
              {processing && (
                <div className="flex items-center justify-center gap-2 mb-4 text-indigo-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">
                    Verificando código...
                  </span>
                </div>
              )}

              {/* Botón de reenviar */}
              <div className="mb-6 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending || processing}
                  className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      ¿No recibiste el código? Reenviar
                    </>
                  )}
                </button>
              </div>

              {/* Botón volver */}
              <button
                type="button"
                onClick={handleBack}
                disabled={processing}
                className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-center text-gray-600">
                ¿Problemas con el código?{" "}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Contacta al centro
                </a>
              </p>
            </div>
          </div>

          {/* Info de seguridad */}
          <div className="p-4 mt-6 bg-white rounded-lg shadow-md">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="mb-1 text-sm font-medium text-gray-900">
                  Conexión segura
                </p>
                <p className="text-xs text-gray-600">
                  Tu información está protegida con encriptación de extremo a
                  extremo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
