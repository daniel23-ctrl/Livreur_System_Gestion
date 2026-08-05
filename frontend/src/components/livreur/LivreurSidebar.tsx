'use client';
import Image from "next/image";
import React, { useState } from 'react';
import {
    Package,
    History,
    LogOut,
    Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { LivreurProfile } from '@/types/mission';

interface LivreurSidebarProps {
    activeTab: 'missions' | 'history';
    onTabChange: (tab: 'missions' | 'history') => void;
    missionsCount: number;
    historyCount: number;
    profile: LivreurProfile;
}

export function LivreurSidebar({
    activeTab,
    onTabChange,
    missionsCount,
    historyCount,
    profile,
}: LivreurSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Wrapper Tooltip réutilisable pour le mode réduit
    const NavItemWithTooltip = ({
        label,
        children,
        collapsed,
    }: {
        label: string;
        children: React.ReactNode;
        collapsed: boolean;
    }) => {
        if (!collapsed) return <>{children}</>;

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="w-full flex justify-center">{children}</div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#0b3b29] text-white border-emerald-800 text-xs z-50">
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    };

    // Contenu principal de la Sidebar
    const MenuContent = ({ isMobile = false }: { isMobile?: boolean }) => {
        const collapsed = isMobile ? false : isCollapsed;

        return (
            <div className="flex flex-col justify-between h-full text-white bg-[#0b3b29] w-full">
                <div className="p-3 space-y-5 overflow-y-auto">
                    
                    {/* HEADER DANS LE MENU */}
                    {!isMobile && collapsed ? (
                        <div className="flex justify-center pt-1 pb-2 border-b border-emerald-900/60">
                            <NavItemWithTooltip label="Ouvrir le menu" collapsed={collapsed}>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCollapsed(false)}
                                    className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white h-10 w-10 rounded-xl"
                                >
                                    <Menu size={20} />
                                </Button>
                            </NavItemWithTooltip>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between pb-2 border-b border-emerald-900/60">
                            <div className="flex items-center gap-3">
                                <div className="p-1 rounded-xl justify-center">
                                    <Image
                                        src="/KusiLogo.png"
                                        alt="Logo Kusi Livraison"
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <p className="text-[11px] text-emerald-200/70">
                                        Portail Livreur Lomé, Togo
                                    </p>
                                </div>
                            </div>

                            {!isMobile && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsCollapsed(true)}
                                    className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white h-9 w-9 rounded-xl shrink-0"
                                >
                                    <Menu size={18} />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* PROFIL & STATS */}
                    <Card
                        className={`transition-all duration-300 ${
                            collapsed
                                ? 'p-0 bg-transparent border-0 shadow-none flex justify-center w-full'
                                : 'bg-emerald-900/40 border-emerald-800/50 rounded-2xl p-3 border text-white space-y-3 shadow-none'
                        }`}
                    >
                        <NavItemWithTooltip label={`${profile.name} (${profile.status})`} collapsed={collapsed}>
                            <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                                <Avatar className="w-10 h-10 bg-[#d4a017] text-emerald-950 font-bold text-xs shrink-0">
                                    <AvatarFallback className="bg-[#d4a017] text-emerald-950">
                                        {profile.initials}
                                    </AvatarFallback>
                                </Avatar>

                                {!collapsed && (
                                    <div className="whitespace-nowrap overflow-hidden">
                                        <h2 className="text-xs font-bold text-white truncate">
                                            {profile.name}
                                        </h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
                                            <span className="text-[11px] text-amber-300 font-medium">
                                                {profile.status}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </NavItemWithTooltip>

                        {!collapsed && (
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-800/40">
                                <div className="bg-emerald-950/40 rounded-xl p-2 text-center">
                                    <span className="block text-sm font-bold text-white">
                                        {profile.coursesCount}
                                    </span>
                                    <span className="text-[10px] text-emerald-200/60 uppercase tracking-wider">
                                        Courses
                                    </span>
                                </div>
                                <div className="bg-emerald-950/40 rounded-xl p-2 text-center">
                                    <span className="block text-sm font-bold text-white">
                                        {profile.rating}
                                    </span>
                                    <span className="text-[10px] text-emerald-200/60 uppercase tracking-wider">
                                        Note
                                    </span>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* NAVIGATION (Affichage vertical propre) */}
                    <div className="space-y-2 pt-1">
                        {!collapsed && (
                            <p className="text-[10px] font-bold text-emerald-200/50 uppercase tracking-wider px-1">
                                Navigation
                            </p>
                        )}

                        <nav className="flex flex-col gap-2 w-full">
                            <NavItemWithTooltip
                                label={`Mes missions (${missionsCount})`}
                                collapsed={collapsed}
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        onTabChange('missions');
                                        if (isMobile) setIsMobileOpen(false);
                                    }}
                                    className={`h-10 rounded-xl text-xs transition-all ${
                                        collapsed 
                                            ? 'w-10 p-0 flex items-center justify-center' 
                                            : 'w-full px-3.5 flex items-center justify-between'
                                    } ${
                                        activeTab === 'missions'
                                            ? 'bg-[#d4a017] hover:bg-[#d4a017] text-emerald-950 font-bold'
                                            : 'text-emerald-100/70 hover:bg-emerald-900/30 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Package size={18} className="shrink-0" />
                                        {!collapsed && <span>Mes missions</span>}
                                    </div>
                                    {!collapsed && (
                                        <Badge
                                            className={`text-[10px] px-1.5 py-0.5 rounded-md border-0 shadow-none ${
                                                activeTab === 'missions'
                                                    ? 'bg-emerald-950/20 text-emerald-950 font-bold'
                                                    : 'bg-emerald-900 text-emerald-200'
                                            }`}
                                        >
                                            {missionsCount}
                                        </Badge>
                                    )}
                                </Button>
                            </NavItemWithTooltip>

                            <NavItemWithTooltip
                                label={`Historique (${historyCount})`}
                                collapsed={collapsed}
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        onTabChange('history');
                                        if (isMobile) setIsMobileOpen(false);
                                    }}
                                    className={`h-10 rounded-xl text-xs transition-all ${
                                        collapsed 
                                            ? 'w-10 p-0 flex items-center justify-center' 
                                            : 'w-full px-3.5 flex items-center justify-between'
                                    } ${
                                        activeTab === 'history'
                                            ? 'bg-[#d4a017] hover:bg-[#d4a017] text-emerald-950 font-bold'
                                            : 'text-emerald-100/70 hover:bg-emerald-900/30 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <History size={18} className="shrink-0" />
                                        {!collapsed && <span>Historique</span>}
                                    </div>
                                    {!collapsed && (
                                        <Badge
                                            className={`text-[10px] px-1.5 py-0.5 rounded-md border-0 shadow-none ${
                                                activeTab === 'history'
                                                    ? 'bg-emerald-950/20 text-emerald-950 font-bold'
                                                    : 'bg-emerald-900 text-emerald-200'
                                            }`}
                                        >
                                            {historyCount}
                                        </Badge>
                                    )}
                                </Button>
                            </NavItemWithTooltip>
                        </nav>
                    </div>
                </div>

                {/* DÉCONNEXION */}
                <div className="p-3 border-t border-emerald-900/50 flex justify-center">
                    <NavItemWithTooltip label="Déconnexion" collapsed={collapsed}>
                        <Button
                            type="button"
                            variant="ghost"
                            className={`text-xs font-medium text-emerald-200/70 hover:text-white hover:bg-emerald-900/30 ${
                                collapsed 
                                    ? 'h-10 w-10 p-0 flex items-center justify-center rounded-xl' 
                                    : 'w-full justify-start px-2 py-1.5 h-auto'
                            }`}
                        >
                            <LogOut size={18} className="shrink-0" />
                            {!collapsed && <span className="ml-2">Déconnexion</span>}
                        </Button>
                    </NavItemWithTooltip>
                </div>
            </div>
        );
    };

    return (
        <TooltipProvider delayDuration={100}>
            {/* BARRE MOBILE */}
            <div className="block md:hidden bg-[#0b3b29] text-white p-3 border-b border-emerald-900 w-full shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl justify-center">
                            <Image
                                src="/KusiLogo.png"
                                alt="Logo Kusi Livraison"
                                width={48}
                                height={48}
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger className="bg-emerald-900/60 text-emerald-100 hover:text-white h-9 w-9 rounded-xl flex items-center justify-center transition-colors">
                            <Menu size={20} />
                        </SheetTrigger>

                        <SheetContent side="left" className="p-0 bg-[#0b3b29] border-r-emerald-900 w-72 text-white border-0">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Menu Livreur</SheetTitle>
                            </SheetHeader>
                            <MenuContent isMobile={true} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* SIDEBAR DESKTOP */}
            <aside
                className={`hidden md:flex flex-col justify-between bg-[#0b3b29] shrink-0 h-full transition-all duration-300 ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                <MenuContent />
            </aside>
        </TooltipProvider>
    );
}