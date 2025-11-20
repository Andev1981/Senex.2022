import React, { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  DollarSign,
  Package,
  Stethoscope,
  Syringe,
  Pill,
  FileText,
  Check,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function ClinicPOS() {
  const [services] = useState([
    {
      id: 1,
      name: "Consulta General",
      price: 25000,
      category: "Consultas",
      icon: Stethoscope,
    },
    {
      id: 2,
      name: "Consulta Especialista",
      price: 45000,
      category: "Consultas",
      icon: Stethoscope,
    },
    {
      id: 3,
      name: "Control Preventivo",
      price: 18000,
      category: "Consultas",
      icon: FileText,
    },
    {
      id: 4,
      name: "Vacuna Influenza",
      price: 15000,
      category: "Vacunas",
      icon: Syringe,
    },
    {
      id: 5,
      name: "Vacuna COVID-19",
      price: 12000,
      category: "Vacunas",
      icon: Syringe,
    },
    {
      id: 6,
      name: "Examen de Sangre",
      price: 22000,
      category: "Exámenes",
      icon: FileText,
    },
    {
      id: 7,
      name: "Electrocardiograma",
      price: 30000,
      category: "Exámenes",
      icon: FileText,
    },
    {
      id: 8,
      name: "Medicamento Genérico",
      price: 8000,
      category: "Medicamentos",
      icon: Pill,
    },
    {
      id: 9,
      name: "Antibiótico",
      price: 16000,
      category: "Medicamentos",
      icon: Pill,
    },
    {
      id: 10,
      name: "Material Curación",
      price: 5000,
      category: "Insumos",
      icon: Package,
    },
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [patientName, setPatientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [showReceipt, setShowReceipt] = useState(false);

  const categories = [
    "Todos",
    "Consultas",
    "Exámenes",
    "Vacunas",
    "Medicamentos",
    "Insumos",
  ];

  const addToCart = (service) => {
    const existing = cart.find((item) => item.id === service.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...service, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = () => {
    if (cart.length === 0 || !patientName) return;
    setShowReceipt(true);
  };

  const resetSale = () => {
    setCart([]);
    setPatientName("");
    setPaymentMethod("efectivo");
    setShowReceipt(false);
  };

  if (showReceipt) {
    return (
      <AuthenticatedLayout>
        <Head title="Isapres" />
        <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="max-w-2xl p-8 mx-auto bg-white shadow-2xl rounded-2xl">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                ¡Venta Completada!
              </h2>
              <p className="text-gray-600">Recibo de Pago</p>
            </div>

            <div className="py-6 mb-6 border-t-2 border-b-2 border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Paciente:</span>
                <span className="font-semibold">{patientName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-semibold">
                  {new Date().toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método de Pago:</span>
                <span className="font-semibold capitalize">
                  {paymentMethod}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 font-bold text-gray-900">
                Detalle de Servicios
              </h3>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between mb-3 text-sm"
                >
                  <div className="flex-1">
                    <span className="text-gray-800">{item.name}</span>
                    <span className="ml-2 text-gray-500">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold">
                    ${(item.price * item.quantity).toLocaleString("es-CL")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 mb-8 border-t-2 border-gray-200">
              <div className="flex justify-between text-2xl font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">
                  ${getTotal().toLocaleString("es-CL")}
                </span>
              </div>
            </div>

            <button
              onClick={resetSale}
              className="w-full py-4 font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Head title="Isapres" />
      <div className="min-h-screen p-4 bg-gray-100">
        <div className="mx-auto">
          {/* Header */}
          <div className="p-6 mb-6 text-white shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-10 h-10" />
                <div>
                  <h1 className="text-2xl font-bold">POS - SenexSport</h1>
                  <p className="text-sm text-blue-100">Punto de Venta</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Usuario: Admin</p>
                <p className="text-sm text-blue-100">
                  {new Date().toLocaleDateString("es-CL")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Panel de Servicios */}
            <div className="space-y-4 lg:col-span-2">
              {/* Búsqueda y Filtros */}
              <div className="p-4 bg-white shadow rounded-xl">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Buscar servicios o productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pb-2 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Servicios */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {filteredServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      onClick={() => addToCart(service)}
                      className="p-4 text-left transition-all bg-white shadow rounded-xl hover:shadow-lg hover:scale-105"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-6 h-6 text-blue-600" />
                        <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded">
                          {service.category}
                        </span>
                      </div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-lg font-bold text-blue-600">
                        ${service.price.toLocaleString("es-CL")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel de Carrito */}
            <div className="lg:col-span-1">
              <div className="sticky p-6 bg-white shadow-lg rounded-xl top-4">
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Carrito de Venta
                  </h2>
                </div>

                {/* Datos del Paciente */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <User className="inline w-4 h-4 mr-1" />
                    Nombre del Paciente
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Ingrese nombre del paciente"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Items del Carrito */}
                <div className="mb-6 space-y-3 overflow-y-auto max-h-64">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-2 opacity-50" />
                      <p>Carrito vacío</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex items-center justify-center bg-white rounded-lg w-7 h-7 hover:bg-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 font-semibold text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex items-center justify-center bg-white rounded-lg w-7 h-7 hover:bg-gray-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-blue-600">
                            $
                            {(item.price * item.quantity).toLocaleString(
                              "es-CL"
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Método de Pago */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    <CreditCard className="inline w-4 h-4 mr-1" />
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta de Débito/Crédito</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="isapre">Isapre</option>
                  </select>
                </div>

                {/* Total */}
                <div className="p-4 mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      ${getTotal().toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="space-y-3">
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || !patientName}
                    className="flex items-center justify-center w-full gap-2 py-3 font-bold text-white transition-all bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl"
                  >
                    <DollarSign className="w-5 h-5" />
                    Procesar Pago
                  </button>
                  <button
                    onClick={resetSale}
                    className="w-full py-3 font-bold text-gray-700 transition-colors bg-gray-200 hover:bg-gray-300 rounded-xl"
                  >
                    Cancelar Venta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
