import { useState, useRef, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import { ShieldCheck, Mail, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

export default function VerifyCode({ rut, email, patient_name }) {
  const { data, setData, post, processing, errors } = useForm({
    rut: rut,
    code: "",
  });

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus primer input
    inputRefs.current[0]?.focus();
  }, []);

  /**
   * Manejar cambio en input de código
   */
  const handleCodeChange = (index, value) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Actualizar form data
    const fullCode = newCode.join("");
    setData("code", fullCode);

    // Auto-focus siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se completen los 6 dígitos
    if (fullCode.length === 6) {
      setTimeout(() => handleSubmit(fullCode), 100);
    }
  };

  /**
   * Manejar tecla presionada
   */
  const handleKeyDown = (index, e) => {
    // Backspace: borrar y volver al anterior
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Flecha izquierda
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Flecha derecha
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Pegar código completo
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      setData("code", pastedData);

      // Focus último input
      inputRefs.current[5]?.focus();

      // Auto-submit
      setTimeout(() => handleSubmit(pastedData), 100);
    }
  };

  /**
   * Submit del código
   */
  const handleSubmit = (fullCode = null) => {
    const codeToSubmit = fullCode || data.code;

    if (codeToSubmit.length !== 6) return;

    post(route("patient.verify-code"), {
      data: {
        rut: data.rut,
        code: codeToSubmit,
      },
    });
  };

  /**
   * Reenviar código
   */
  const handleResendCode = async () => {
    setResending(true);
    setResendSuccess(false);

    try {
      await axios.post(route("patient.resend-code"), { rut: data.rut });
      setResendSuccess(true);

      // Limpiar código actual
      setCode(["", "", "", "", "", ""]);
      setData("code", "");
      inputRefs.current[0]?.focus();

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (error) {
      console.error("Error al reenviar código:", error);
    } finally {
      setResending(false);
    }
  };

  /**
   * Volver al login
   */
  const handleBack = () => {
    router.visit(route("patient.login"));
  };

  return (
    <>
      <Head title="Verificar Código" />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg mb-4">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Verificar Código
            </h1>
            <p className="text-gray-600">
              Hola, <strong>{patient_name}</strong>
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-10">
              {/* Mensaje de email enviado */}
              <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900 mb-1">
                      Código enviado a tu email
                    </p>
                    <p className="text-sm text-indigo-700">{email}</p>
                    <p className="text-xs text-indigo-600 mt-2">
                      El código expira en 15 minutos
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensaje de éxito al reenviar */}
              {resendSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 animate-fade-in">
                  <p className="text-sm font-medium text-green-900">
                    ✓ Código reenviado exitosamente
                  </p>
                </div>
              )}

              {/* Inputs de código */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
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
                        ${digit ? "border-indigo-500 bg-indigo-50" : ""}
                      `}
                      disabled={processing}
                    />
                  ))}
                </div>

                {errors.code && (
                  <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
                    <span className="font-medium">⚠️</span>
                    {errors.code}
                  </p>
                )}
              </div>

              {/* Loading indicator */}
              {processing && (
                <div className="flex items-center justify-center gap-2 text-indigo-600 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">
                    Verificando código...
                  </span>
                </div>
              )}

              {/* Botón de reenviar */}
              <div className="text-center mb-6">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending || processing}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="w-full py-3 px-6 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                ¿Problemas con el código?{" "}
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Contacta al centro
                </a>
              </p>
            </div>
          </div>

          {/* Info de seguridad */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
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
