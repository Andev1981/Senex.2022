import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import { fmtCLP } from "@/utils/utils";
import { CreditCard, Package, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ProductCheckout({ products = [] }) {
    const [data, setData] = useState({
        product_id: "",
        quantity: 1,
    });

    const selectedProduct = products.find(p => p.id == data.product_id);
    const total = selectedProduct ? selectedProduct.price * data.quantity : 0;

    // Obtener el token CSRF para el formulario manual
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
            <Head title="Certificación Webpay Plus - Checkout" />

            {/* Header minimalista */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
                            <CreditCard size={18} />
                        </div>
                        <span className="font-black tracking-tight text-lg uppercase italic text-indigo-900">Senex<span className="text-indigo-500">Pay</span></span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                        <ShieldCheck size={14} className="text-green-600" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Portal Seguro Transbank</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12">
                <form action="/certificacion/webpay/product" method="POST">
                    {/* CSRF Token Manual */}
                    <input type="hidden" name="_token" value={csrfToken} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* Columna Izquierda: Formulario */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 leading-none mb-3">Finalizar Compra</h1>
                                <p className="text-slate-500 text-sm">Portal de certificación para validación de flujos Webpay Plus.</p>
                            </div>

                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                <div className="p-8 space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 text-indigo-600">
                                            <Package size={20} />
                                            <h3 className="font-black uppercase tracking-widest text-[11px]">Selección de Producto</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {products.map(p => (
                                                <label 
                                                    key={p.id}
                                                    className={`relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                                                        data.product_id == p.id 
                                                        ? 'border-indigo-600 bg-indigo-50/30 shadow-md' 
                                                        : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <input 
                                                            type="radio"
                                                            name="product_id"
                                                            value={p.id}
                                                            required
                                                            checked={data.product_id == p.id}
                                                            onChange={e => setData({...data, product_id: e.target.value})}
                                                            className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-slate-900">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">SKU: {p.sku || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 font-mono">{fmtCLP(p.price)}</p>
                                                    </div>
                                                    {data.product_id == p.id && (
                                                        <div className="absolute -top-2 -right-2 text-indigo-600">
                                                            <CheckCircle2 size={24} fill="white" />
                                                        </div>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Cantidad de Items</label>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setData({...data, quantity: Math.max(1, data.quantity - 1)})}
                                                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl font-bold hover:bg-slate-50 active:scale-95"
                                            >
                                                -
                                            </button>
                                            <input 
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                value={data.quantity}
                                                onChange={e => setData({...data, quantity: parseInt(e.target.value) || 1})}
                                                className="w-20 h-12 rounded-xl border border-slate-200 text-center font-black text-lg focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setData({...data, quantity: data.quantity + 1})}
                                                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-xl font-bold hover:bg-slate-50 active:scale-95"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Resumen de Pago */}
                        <div className="lg:col-span-5">
                            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/20 sticky top-24">
                                <h2 className="text-xl font-black uppercase tracking-tight mb-8">Resumen del Pedido</h2>
                                
                                <div className="space-y-6 pb-8 border-b border-white/10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold opacity-60">Subtotal</p>
                                            <p className="text-xs opacity-40 italic">Incluye tasas e impuestos de prueba</p>
                                        </div>
                                        <p className="font-mono font-bold text-lg">{fmtCLP(total)}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-green-400">
                                        <p className="text-sm font-bold">Descuento Promocional</p>
                                        <p className="font-mono font-bold text-lg">-$0</p>
                                    </div>
                                </div>

                                <div className="pt-8 space-y-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold opacity-70">Total a Pagar</span>
                                        <span className="text-4xl font-black font-mono tracking-tighter text-indigo-400">{fmtCLP(total)}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!data.product_id}
                                        className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <CreditCard size={18} />
                                        Pagar ahora
                                    </button>
                                    
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-5 bg-white/20 rounded"></div>
                                            <div className="w-8 h-5 bg-white/20 rounded"></div>
                                            <div className="w-8 h-5 bg-white/20 rounded"></div>
                                        </div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-center">Encriptación SSL de 256 bits</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
