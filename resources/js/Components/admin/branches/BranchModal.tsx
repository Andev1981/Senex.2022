import LocationPicker from "@/components/admin/LocationPicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Branch } from "@/data/branches";
import { COUNTRIES } from "@/data/countries";
import { asset } from "@/lib/utils";
import { useForm } from "@inertiajs/react";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";

interface BranchModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchToEdit: Branch | null;
}

const FALLBACK_LOGO = "/img/logo-poema.webp";

export default function BranchModal({ isOpen, onClose, branchToEdit }: BranchModalProps) {
    const isEditing = !!branchToEdit;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        _method: isEditing ? 'PUT' : 'POST', // Truco para que Laravel acepte archivos en edición
        name: '',
        country: 'CL',
        city: '',
        address: '',
        type: 'physical',
        lat: -33.4489,
        lng: -70.6693,
        phone: '',
        hours: '',
        instagram: '',
        facebook: '',
        x: '',
        tiktok: '',
        logo: null as File | null | string,
        description: '',
    });

    // Cargar datos al abrir modal
    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (branchToEdit) {
                setData({
                    _method: 'PUT',
                    name: branchToEdit.name,
                    country: branchToEdit.country || 'CL',
                    city: branchToEdit.city,
                    address: branchToEdit.address || '',
                    type: branchToEdit.type || 'physical',
                    lat: branchToEdit.lat || -33.4489,
                    lng: branchToEdit.lng || -70.6693,
                    phone: branchToEdit.phone || '',
                    hours: branchToEdit.hours || '',
                    instagram: branchToEdit.instagram || '',
                    facebook: branchToEdit.facebook || '',
                    x: branchToEdit.x || '',
                    tiktok: branchToEdit.tiktok || '',
                    logo: null, // No enviamos el string de la URL antigua, solo si hay nuevo archivo
                    description: branchToEdit.description || '',
                });
                setPreviewUrl(branchToEdit.logo ? asset(branchToEdit.logo) : FALLBACK_LOGO);
            } else {
                reset();
                setData({ ...data, _method: 'POST', country: 'CL', lat: -33.4489, lng: -70.6693 });
                setPreviewUrl(null);
            }
        }
    }, [isOpen, branchToEdit]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const onSuccess = () => {
            reset();
            onClose();
        };

        if (isEditing && branchToEdit) {
            // Usamos POST con _method: PUT para subir archivos
            post(route('branches.update', branchToEdit.id), { onSuccess });
        } else {
            post(route('branches.store'), { onSuccess });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden flex flex-col bg-background text-foreground border-border shadow-2xl sm:rounded-2xl">
                <DialogHeader className="p-8 pb-4 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight">
                                {isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">Completa la información detallada del punto de venta.</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        
                        {/* COLUMNA IZQUIERDA: DATOS (8 de 12) */}
                        <div className="xl:col-span-8 space-y-8">
                            
                            {/* Bloque 1: Identificación */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <span className="w-8 h-px bg-primary/30"></span> Identificación
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-bold">Nombre de la Sucursal *</Label>
                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="h-11 text-base focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Ej: Pet Shop Santiago Centro" />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="country" className="text-sm font-bold">País</Label>
                                            <Select value={data.country} onValueChange={(val) => setData('country', val)}>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {COUNTRIES.map(country => (
                                                        <SelectItem key={country.code} value={country.code}>
                                                            <span className="mr-2">{country.flag}</span> {country.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="text-sm font-bold">Tipo</Label>
                                            <Select value={data.type} onValueChange={(val) => setData('type', val)}>
                                                <SelectTrigger className="h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="physical">🏪 Tienda Física</SelectItem>
                                                    <SelectItem value="online">🌐 Tienda Online</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Bloque 2: Ubicación y Contacto */}
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <span className="w-8 h-px bg-primary/30"></span> Ubicación & Contacto
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-sm font-bold">Ciudad *</Label>
                                        <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} required className="h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-bold">Teléfono / WhatsApp</Label>
                                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="h-11" placeholder="+56 9..." />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="address" className="text-sm font-bold">Dirección Completa</Label>
                                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} className="h-11" placeholder="Calle, número, departamento..." />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="hours" className="text-sm font-bold">Horario de Atención</Label>
                                        <Input id="hours" value={data.hours} onChange={(e) => setData('hours', e.target.value)} className="h-11" placeholder="Ej: Lunes a Viernes 09:00 - 18:00" />
                                    </div>
                                </div>
                            </section>

                            {/* Bloque 3: Mapa (Solo físicas) - ALTURA REDUCIDA A 300px */}
                            {data.type === 'physical' && (
                                <section className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">📍 Mapa de Ubicación</h3>
                                        <Badge variant="outline" className="text-[10px]">Lat: {Number(data.lat).toFixed(4)} | Lng: {Number(data.lng).toFixed(4)}</Badge>
                                    </div>
                                    <div className="rounded-2xl border-2 border-border overflow-hidden shadow-inner bg-muted/30 h-[300px]">
                                        <LocationPicker
                                            lat={Number(data.lat)}
                                            lng={Number(data.lng)}
                                            onLocationChange={(lat, lng) => {
                                                setData(d => ({ ...d, lat, lng }));
                                            }}
                                        />
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: LOGO Y REDES (4 de 12) */}
                        <div className="xl:col-span-4 space-y-8 bg-muted/20 p-6 rounded-2xl border border-border">
                            
                            {/* Logo Upload */}
                            <section className="space-y-4">
                                <Label className="text-base font-bold block text-center">Imagen de Marca</Label>
                                <div className="flex flex-col items-center gap-4">
                                    <div 
                                        className="w-48 h-48 rounded-3xl border-4 border-dashed border-border bg-background flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary transition-all shadow-sm"
                                        onClick={() => document.getElementById('logo')?.click()}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                                                <span className="text-xs text-muted-foreground font-medium">Subir Logo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-background text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Cambiar Imagen</span>
                                        </div>
                                    </div>
                                    <Input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    <p className="text-center text-[11px] text-muted-foreground leading-relaxed px-4">
                                        Sube el logo oficial. Se recomienda fondo transparente y formato circular o cuadrado.
                                    </p>
                                </div>
                            </section>

                            {/* Redes Sociales */}
                            <section className="space-y-4 pt-6 border-t border-border">
                                <Label className="text-sm font-bold flex items-center gap-2">
                                    <span>🔗</span> Presencia Digital
                                </Label>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="instagram" className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Instagram</Label>
                                        <Input id="instagram" value={data.instagram} onChange={(e) => setData('instagram', e.target.value)} placeholder="https://instagram.com/..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="facebook" className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">Facebook</Label>
                                        <Input id="facebook" value={data.facebook} onChange={(e) => setData('facebook', e.target.value)} placeholder="https://facebook.com/..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="tiktok" className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">TikTok</Label>
                                        <Input id="tiktok" value={data.tiktok} onChange={(e) => setData('tiktok', e.target.value)} placeholder="https://tiktok.com/@..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="x" className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">X (Twitter)</Label>
                                        <Input id="x" value={data.x} onChange={(e) => setData('x', e.target.value)} placeholder="https://x.com/..." />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <DialogFooter className="mt-10 pt-6 border-t border-border flex items-center justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-8 font-semibold text-muted-foreground hover:text-foreground">Cancelar</Button>
                        <Button type="submit" disabled={processing} className="h-12 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg transition-all">
                            {isEditing ? 'Actualizar Sucursal' : 'Crear Sucursal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
