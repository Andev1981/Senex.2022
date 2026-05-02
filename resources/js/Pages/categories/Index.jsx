import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { 
  Plus, 
  Layers, 
  Trash2, 
  Pencil, 
  ChevronRight, 
  ChevronDown,
  Tag,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";
import Swal from "sweetalert2";
import PrimaryButton from "@/components/PrimaryButton";
import TextInput from "@/components/TextInput";
import InputError from "@/components/InputError";
import SideModal from "@/components/SideModal";
import Switch from "@/components/Switch";

export default function Index({ categories }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCats, setExpandedCats] = useState({});

  const toggleExpand = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: "",
    parent_id: "",
    description: "",
    is_active: true
  });

  const openModal = (cat = null, parentId = null) => {
    clearErrors();
    if (cat) {
      setSelectedCategory(cat);
      setData({
        name: cat.name,
        parent_id: cat.parent_id || "",
        description: cat.description || "",
        is_active: !!cat.is_active
      });
    } else {
      setSelectedCategory(null);
      setData({
        name: "",
        parent_id: parentId || "",
        description: "",
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const submit = (e) => {
    e.preventDefault();
    const url = selectedCategory ? route("categories.update", selectedCategory.id) : route("categories.store");
    const method = selectedCategory ? put : post;

    method(url, {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
        Swal.fire({ title: "¡Éxito!", text: "Categoría guardada", icon: "success", timer: 1500 });
      }
    });
  };

  const handleDelete = (cat) => {
    Swal.fire({
      title: "¿Eliminar Categoría?",
      text: `Se borrará "${cat.name}" y sus subcategorías. No debe tener productos asociados.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route("categories.destroy", cat.id));
      }
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title="Maestro de Categorías" />

      <div className="min-h-screen p-6 md:p-10 bg-gray-50/50 space-y-8">
        
        {/* HEADER */}
        <div className="p-8 bg-white border border-gray-100 shadow-sm rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="flex items-center justify-center w-16 h-16 bg-brand-primary text-white rounded-2xl shadow-xl transform rotate-3">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none mb-2">Estructura de Catálogo</h1>
              <p className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em]">Jerarquías • Categorías & Subcategorías</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-3 px-8 py-4 font-black uppercase tracking-widest text-[10px] text-white transition-all bg-brand-primary rounded-2xl shadow-lg hover:brightness-110 active:scale-95 z-10"
          >
            <Plus className="w-4 h-4" /> Nueva Categoría Padre
          </button>
        </div>

        {/* LISTADO JERÁRQUICO */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Árbol de Categorías Actual</h2>
            <span className="text-[9px] font-bold bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">{categories.length} Raíces Configuradas</span>
          </div>

          <div className="divide-y divide-gray-50">
            {categories.map(cat => (
              <div key={cat.id} className="group">
                <div className={`flex items-center justify-between p-6 transition-all hover:bg-brand-secondary/5 ${expandedCats[cat.id] ? 'bg-brand-secondary/5' : ''}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                        onClick={() => toggleExpand(cat.id)}
                        className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                        {expandedCats[cat.id] ? <ChevronDown className="w-4 h-4 text-brand-primary" /> : <ChevronRight className="w-4 h-4 text-gray-300" />}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-primary">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{cat.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 truncate max-w-md">{cat.description || 'Sin descripción'}</p>
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => openModal(null, cat.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100 hover:bg-green-100 transition-all"
                    >
                        <Plus className="w-3 h-3" /> Subcategoría
                    </button>
                    <button onClick={() => openModal(cat)} className="p-2 text-brand-primary hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-brand-secondary/20"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(cat)} className="p-2 text-red-300 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* HIJOS (SUBCATEGORÍAS) */}
                {expandedCats[cat.id] && cat.children?.length > 0 && (
                    <div className="bg-gray-50/50 divide-y divide-gray-50 border-t border-gray-50 ml-16 mr-6 mb-4 rounded-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                        {cat.children.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-white transition-all group/sub">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-brand-primary/30 rounded-full"></div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{sub.name}</p>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(sub)} className="p-1.5 text-gray-400 hover:text-brand-primary"><Pencil className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDelete(sub)} className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {expandedCats[cat.id] && cat.children?.length === 0 && (
                    <div className="ml-20 py-4 opacity-30 text-[10px] font-bold uppercase tracking-widest italic">No hay subcategorías registradas</div>
                )}
              </div>
            ))}
            {categories.length === 0 && (
                <div className="p-24 text-center">
                    <Layers className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="enterprise-label opacity-40">No has creado categorías todavía</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      <SideModal open={isModalOpen} onClose={() => setIsModalOpen(false)} width="lg">
        <div className="bg-white h-full flex flex-col">
            <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary text-white rounded-lg"><Layers className="w-5 h-5" /></div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-900">
                        {selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={submit} className="flex flex-col h-full overflow-hidden">
                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        <label className="enterprise-label ml-1">Nombre de la Categoría</label>
                        <TextInput 
                            value={data.name} 
                            onChange={e => setData("name", e.target.value)} 
                            required 
                            className="w-full font-bold uppercase"
                            placeholder="Ej: Licencias de Software"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <label className="enterprise-label ml-1">Categoría Padre (Dejar vacío para Raíz)</label>
                        <select
                            value={data.parent_id}
                            onChange={e => setData("parent_id", e.target.value)}
                            className="w-full rounded-2xl border-gray-100 py-4 px-5 font-bold text-gray-700 bg-gray-50 focus:bg-white focus:ring-brand-primary"
                        >
                            <option value="">-- Sin Padre (Categoría Raíz) --</option>
                            {categories.filter(c => c.id !== selectedCategory?.id).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.parent_id} />
                    </div>

                    <div className="space-y-1">
                        <label className="enterprise-label ml-1">Descripción Breve</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData("description", e.target.value)}
                            className="w-full rounded-2xl border-gray-100 py-4 px-5 font-medium text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-brand-primary"
                            rows="3"
                            placeholder="¿Qué incluye esta categoría?"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Categoría Activa</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Permitir su uso en el catálogo</p>
                        </div>
                        <Switch 
                            checked={data.is_active} 
                            onChange={checked => setData("is_active", checked)} 
                        />
                    </div>
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end gap-4 shrink-0">
                    <PrimaryButton type="submit" disabled={processing} className="!px-12 !py-4 shadow-xl shadow-brand-primary/20">
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
      </SideModal>
    </AuthenticatedLayout>
  );
}
