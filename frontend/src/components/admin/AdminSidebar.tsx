"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  GitBranch,
  Archive,
  Settings,
  Truck,
  Menu,
  LogOut,
  X,
  LucideIcon,
} from "lucide-react";

import { logout, getCurrentUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Commandes", icon: Package, badge: 2 },
  { href: "/admin/livreurs", label: "Livreurs", icon: Users },
  { href: "/admin/affectations", label: "Affectations", icon: GitBranch },
  { href: "/admin/archives", label: "Archives", icon: Archive },
];

const BOTTOM_ITEMS: NavItem[] = [
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
  }, []);

  const initiales = mounted && user
    ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase()
    : "";

  const userName = mounted && user
    ? `${user?.prenom ?? "Akosua"} ${user?.nom ?? "Kumi"}`
    : "";

  const isActive = (href: string) => pathname === href;

  // Wrapper Tooltip réutilisable
  const NavTooltip = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => {
    if (!collapsed) return <>{children}</>;

    return (
      <Tooltip>
        <TooltipTrigger >
          <div className="w-full flex justify-center">{children}</div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[#0b3b29] text-white border-emerald-800 text-xs font-medium shadow-md z-50"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Composant pour chaque lien de navigation
  const SidebarLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const linkContent = (
      <Link
        href={item.href}
        onClick={onCloseMobile} // Ferme automatiquement le menu au clic sur mobile
        className={`flex items-center gap-3 rounded-xl transition-all ${
          collapsed
            ? "w-10 h-10 justify-center p-0"
            : "px-3.5 py-2.5 justify-between w-full"
        } ${
          active
            ? "bg-[#d4a017] text-emerald-950 font-bold shadow-sm"
            : "text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="text-xs font-medium truncate">
              {item.label}
            </span>
          )}
        </div>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && !collapsed && (
          <Badge
            className={`text-[10px] px-1.5 py-0.5 rounded-md border-0 shadow-none shrink-0 ${
              active
                ? "bg-emerald-950/20 text-emerald-950 font-bold"
                : "bg-emerald-900 text-emerald-200"
            }`}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );

    return (
      <NavTooltip label={item.badge ? `${item.label} (${item.badge})` : item.label}>
        {linkContent}
      </NavTooltip>
    );
  };

  return (
    <TooltipProvider delay={100}>
      <aside
        className={`relative flex flex-col h-screen text-white bg-[#0b3b29] transition-all duration-300 shrink-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* En-tête / Logo + Boutons d'action */}
        <div
          className={`flex items-center py-4 ${
            collapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {collapsed ? (
            <NavTooltip label="Ouvrir le menu">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white h-10 w-10 rounded-xl"
              >
                <Menu size={20} />
              </Button>
            </NavTooltip>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d4a017] flex items-center justify-center shrink-0 shadow-sm">
                  <Truck className="w-5 h-5 text-emerald-950" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm leading-tight truncate">
                    KUSI
                  </p>
                  <p className="text-[11px] text-emerald-200/70 truncate">
                    Gestion Livraisons
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Bouton de fermeture directe sur Mobile */}
                {onCloseMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCloseMobile}
                    className="lg:hidden bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white h-9 w-9 rounded-xl"
                  >
                    <X size={18} />
                  </Button>
                )}

                {/* Bouton pour réduire en mode compact (Desktop) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(true)}
                  className="hidden lg:flex bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white h-9 w-9 rounded-xl shrink-0"
                >
                  <Menu size={18} />
                </Button>
              </div>
            </>
          )}
        </div>

        <Separator className="bg-emerald-900/60" />

        {/* Navigation principale */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <p className="text-[10px] font-bold text-emerald-200/50 uppercase tracking-wider px-1 mb-2">
              Navigation
            </p>
          )}

          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Bas de la Sidebar */}
        <div className="px-3 py-3 space-y-1.5">
          <Separator className="mb-3 bg-emerald-900/60" />

          {BOTTOM_ITEMS.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}

          {/* Section Profil Utilisateur */}
          <div
            className={`flex items-center rounded-xl transition-all ${
              collapsed
                ? "justify-center p-1 bg-transparent"
                : "gap-3 px-3 py-2.5 bg-emerald-900/40 border border-emerald-800/50"
            }`}
          >
            <NavTooltip label={`${userName} (Administratrice)`}>
              <Avatar className="w-9 h-9 shrink-0 cursor-pointer bg-[#d4a017] text-emerald-950 font-bold">
                <AvatarFallback className="bg-[#d4a017] text-emerald-950 text-xs font-bold">
                  {initiales}
                </AvatarFallback>
              </Avatar>
            </NavTooltip>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-emerald-200/70 truncate">
                    ADMIN
                  </p>
                </div>

                <NavTooltip label="Se déconnecter">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="h-7 w-7 p-0 rounded-lg text-emerald-200/70 hover:text-white hover:bg-emerald-900/30 shrink-0"
                  >
                    <LogOut size={16} />
                  </Button>
                </NavTooltip>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}