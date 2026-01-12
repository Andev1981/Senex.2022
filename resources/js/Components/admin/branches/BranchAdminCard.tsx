import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Branch } from "@/data/branches";
import { COUNTRIES } from "@/data/countries";
import { asset } from "@/lib/utils";
import { Edit, MapPin, MoreVertical, Phone, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface BranchAdminCardProps {
    branch: Branch;
    onEdit: (branch: Branch) => void;
    onDelete: (branch: Branch) => void;
}

const FALLBACK_LOGO = "/img/logo-poema.webp";

// Icons
const InstagramIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
);

const FacebookIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
);

const TikTokIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.9 6.24-1.72 1.36-3.92 1.84-6.08 1.25-1.92-.52-3.53-2.1-4.15-4.03-.66-2.03-.18-4.2.98-5.85 1.48-2.04 4.11-3.03 6.48-2.34v4.2c-.94-.65-2.12-.66-3.06-.02-.75.64-1.03 1.74-.7 2.64.29.8 1.05 1.3 1.87 1.3 1.35 0 2.29-1.15 2.28-2.58v-15.04c-1.08 0-2.16 0-3.24.01-.08 0-.16-.01-.24-.01z" /></svg>
);

const XIcon = () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);

export function BranchAdminCard({ branch, onEdit, onDelete }: BranchAdminCardProps) {
    const country = COUNTRIES.find(c => c.code === branch.country);

    return (
        <Card className="overflow-hidden group hover:shadow-md transition-all border-border/50 flex flex-col h-full">
            <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 border flex items-center justify-center overflow-hidden shrink-0">
                        <img 
                            src={asset(branch.logo || FALLBACK_LOGO)} 
                            alt={branch.name} 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-sm truncate pr-2 leading-tight">{branch.name}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-0.5">
                            <span>{country?.flag}</span>
                            <span>{branch.city}</span>
                        </div>
                    </div>
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEdit(branch)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(branch)} className="text-red-600 cursor-pointer">
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            
            <CardContent className="p-4 pt-0 space-y-3 flex-1">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                    <span className="line-clamp-2 leading-snug">{branch.address || 'Sin dirección'}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-green-500" />
                    <span>{branch.phone || 'Sin teléfono'}</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/20 mt-auto bg-muted/10 h-12">
                <Badge 
                    variant={branch.type === 'physical' ? 'default' : 'secondary'}
                    className={`text-[10px] h-5 px-2 ${branch.type === 'physical' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' 
                        : 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100'
                    }`}
                >
                    {branch.type === 'physical' ? 'Tienda Física' : 'Online'}
                </Badge>
                
                <div className="flex items-center gap-2">
                    {branch.instagram && (
                        <a href={branch.instagram} target="_blank" className="w-6 h-6 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors">
                            <InstagramIcon />
                        </a>
                    )}
                    {branch.facebook && (
                        <a href={branch.facebook} target="_blank" className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                            <FacebookIcon />
                        </a>
                    )}
                    {branch.tiktok && (
                        <a href={branch.tiktok} target="_blank" className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-100 text-black hover:bg-neutral-200 transition-colors">
                            <TikTokIcon />
                        </a>
                    )}
                    {branch.x && (
                        <a href={branch.x} target="_blank" className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                            <XIcon />
                        </a>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}