"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useClientNotifications } from "@/contexts/ClientNotificationsContext";

type Periode = "global" | "aujourdhui";

function estAujourdhui(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatHeure(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function libelleDeclencheur(declencheur: string): string {
  return declencheur === "ASSIGNEE" ? "Livreur assigné" : "Colis en route";
}

export default function NotificationsPopoverClient() {
  const { notifications, notificationsNonLues, marquerNotificationsCommeLues } = useClientNotifications();
  const [open, setOpen] = useState(false);
  const [periode, setPeriode] = useState<Periode>("global");

  const notificationsFiltrees = useMemo(() => {
    if (periode === "aujourdhui") {
      return notifications.filter((n) => estAujourdhui(n.createdAt));
    }
    return notifications;
  }, [notifications, periode]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) marquerNotificationsCommeLues();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            className="relative h-8 w-8 rounded-full bg-transparent text-xs font-bold text-emerald-200/70 hover:text-white hover:bg-white/10"
          />
        }
      >
        <Bell size={16} />
        {notificationsNonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#d4a017] border-2 border-[#0b3b29] text-[9px] font-bold text-white flex items-center justify-center">
            {notificationsNonLues > 9 ? "9+" : notificationsNonLues}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-xl border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-sm text-emerald-950">Notifications</h3>
          <div className="flex items-center bg-gray-100 rounded-full p-0.5 text-xs">
            <button
              onClick={() => setPeriode("global")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                periode === "global" ? "bg-white shadow-sm text-emerald-950" : "text-gray-500"
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setPeriode("aujourdhui")}
              className={`px-3 py-1 rounded-full font-medium transition-colors ${
                periode === "aujourdhui" ? "bg-white shadow-sm text-emerald-950" : "text-gray-500"
              }`}
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notificationsFiltrees.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              Aucune notification {periode === "aujourdhui" ? "aujourd'hui" : ""}
            </div>
          ) : (
            notificationsFiltrees.map((n) => (
              <div
                key={n.id_notification}
                className="flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  {n.statut_envoi === "ENVOYE" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-950">
                    {libelleDeclencheur(n.declencheur)}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {formatHeure(n.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}