import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Branch } from "@/data/branches";
import { COUNTRIES } from "@/data/countries";
import { ColumnDef } from "@tanstack/react-table";
import { Clock, Edit, MapPin, Phone, Trash2 } from "lucide-react";

export const getColumns = (
    onEdit: (branch: Branch) => void,
    onDelete: (branch: Branch) => void
): ColumnDef<Branch>[] => [
    {
        accessorKey: "country",
        header: () => <div className="text-gray-900 font-bold uppercase text-xs text-center">País</div>,
        cell: ({ row }) => {
            const code = row.getValue("country") as string;
            const country = COUNTRIES.find(c => c.code === code);
            return (
                <div className="text-center" title={country?.name}>
                    <span className="text-xl cursor-default">{country?.flag || '🏳️'}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "name",
        header: () => <div className="text-gray-900 font-bold uppercase text-xs">Nombre / Redes</div>,
        cell: ({ row }) => {
            const branch = row.original;
            return (
                <div className="flex flex-col min-w-[150px]">
                    <span className="font-bold text-gray-900 text-sm">{branch.name}</span>
                    <div className="flex gap-2 mt-1">
                        {branch.instagram && <a href={branch.instagram} target="_blank" className="text-pink-600 hover:text-pink-800 text-xs">IG</a>}
                        {branch.facebook && <a href={branch.facebook} target="_blank" className="text-blue-600 hover:text-blue-800 text-xs">FB</a>}
                        {branch.tiktok && <a href={branch.tiktok} target="_blank" className="text-black hover:text-gray-700 text-xs">TK</a>}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "city",
        header: () => <div className="text-gray-900 font-bold uppercase text-xs">Ubicación</div>,
        cell: ({ row }) => {
            const branch = row.original;
            return (
                <div className="flex flex-col text-sm min-w-[140px]">
                    <span className="font-semibold text-gray-800">{branch.city}</span>
                    {branch.address && (
                        <div className="flex items-start gap-1 text-gray-500 text-xs mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                            <span className="truncate max-w-[180px]" title={branch.address}>{branch.address}</span>
                        </div>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "contact",
        header: () => <div className="text-gray-900 font-bold uppercase text-xs">Contacto</div>,
        cell: ({ row }) => {
            const branch = row.original;
            if (!branch.phone) return <span className="text-gray-300 text-xs">-</span>;
            
            return (
                <div className="flex items-center gap-1 text-gray-700 text-xs whitespace-nowrap">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{branch.phone}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "hours",
        header: () => <div className="text-gray-900 font-bold uppercase text-xs">Horario</div>,
        cell: ({ row }) => {
            const branch = row.original;
            if (!branch.hours) return <span className="text-gray-300 text-xs">-</span>;

            // Cortar si es muy largo para no romper la tabla
            return (
                <div className="flex items-start gap-1 text-gray-600 text-xs max-w-[150px]" title={branch.hours}>
                    <Clock className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
                    <span className="truncate">{branch.hours.split('|')[0]}...</span>
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: () => <div className="text-gray-900 font-bold uppercase text-xs text-center">Tipo</div>,
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            return (
                <div className="flex justify-center">
                    <Badge 
                        variant={type === 'physical' ? 'default' : 'secondary'}
                        className={`whitespace-nowrap ${type === 'physical' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200'}`}
                    >
                        {type === 'physical' ? 'Tienda' : 'Online'}
                    </Badge>
                </div>
            )
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right text-gray-900 font-bold uppercase text-xs">Acciones</div>,
        cell: ({ row }) => {
            const branch = row.original;
            return (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(branch)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(branch)} className="h-8 w-8 text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        },
    },
]
