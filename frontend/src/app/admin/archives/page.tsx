"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Archive, Search, RotateCcw, UserX, UserCheck, Phone, Mail, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInactifs, restaurerLivreur, getActifs, archiverLivreur } from "@/services/livreur.service";
import { Livreur } from "@/types/livreur.types";
import { toast } from "sonner";

export default function LivreursArchives() {
  const [activeTab, setActiveTab] = useState<"actifs" | "archives">("actifs");
  const [livreursActifs, setLivreursActifs] = useState<Livreur[]>([]);
  const [livreursArchives, setLivreursArchives] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [actifsRes, inactifsRes] = await Promise.all([
        getActifs(),
        getInactifs()
      ]);
      setLivreursActifs(actifsRes);
      setLivreursArchives(inactifsRes);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleArchiver = (livreur: Livreur) => {
    toast(`Voulez-vous réellement archiver ${livreur.prenom} ${livreur.nom} ?`, {
      action: {
        label: "Oui",
        onClick: async () => {
          try {
            await archiverLivreur(livreur.id);
            setLivreursActifs((prev) => prev.filter((l) => l.id !== livreur.id));
            setLivreursArchives((prev) => [...prev, livreur]);
            toast.success("Livreur archivé avec succès !");
          } catch (error) {
            toast.error("Échec de l'archivage.");
          }
        },
      },
      cancel: { label: "Annuler", onClick: () => {} },
    });
  };

  const handleDesarchiver = (livreur: Livreur) => {
    toast(`Voulez-vous réellement désarchiver ${livreur.prenom} ${livreur.nom} ?`, {
      action: {
        label: "Oui",
        onClick: async () => {
          try {
            await restaurerLivreur(livreur.id);
            setLivreursArchives((prev) => prev.filter((l) => l.id !== livreur.id));
            setLivreursActifs((prev) => [...prev, livreur]);
            toast.success("Livreur désarchivé avec succès !");
          } catch (error) {
            toast.error("Échec du désarchivage.");
          }
        },
      },
      cancel: { label: "Annuler", onClick: () => {} },
    });
  };

  const currentList = activeTab === "actifs" ? livreursActifs : livreursArchives;
  const filteredLivreurs = currentList.filter((livreur) =>
    `${livreur.nom} ${livreur.prenom} ${livreur.email} ${livreur.telephone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* En-tête principal */}
      <div className="bg-[#0B3B29] text-white px-6 py-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-wide uppercase flex items-center gap-2">
            Gestion des Archives & Actifs
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "actifs" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("actifs")}
            className={
              activeTab === "actifs"
                ? "bg-[#DCA524] text-white hover:bg-[#c4921f] font-semibold shadow-sm"
                : "bg-transparent text-white border-white/30 hover:bg-white/10"
            }
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            Actifs ({livreursActifs.length})
          </Button>
          <Button
            variant={activeTab === "archives" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("archives")}
            className={
              activeTab === "archives"
                ? "bg-[#DCA524] text-white hover:bg-[#c4921f] font-semibold shadow-sm"
                : "bg-transparent text-white border-white/30 hover:bg-white/10"
            }
          >
            <Archive className="w-4 h-4 mr-1.5" />
            Archives ({livreursArchives.length})
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            className="bg-transparent text-white border-white/30 hover:bg-white/10 ml-2"
          >
            <RotateCcw className="w-4 h-4 text-[#DCA524]" />
          </Button>
        </div>
      </div>

      {/* Barre de recherche et description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="text-sm text-slate-600 font-medium">
          {activeTab === "actifs"
            ? "Liste des livreurs actifs en service."
            : "Consultez et restaurez les livreurs inactifs."}
        </p>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white shadow-xs rounded-xl border-slate-200 focus-visible:ring-[#0B3B29]"
          />
        </div>
      </div>

      {/* Table avec en-tête personnalisé en #0B3B29 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#0B3B29] border-b border-[#093223]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-white py-4">Nom Complet</TableHead>
              <TableHead className="font-bold text-white">Téléphone</TableHead>
              <TableHead className="font-bold text-white">Email</TableHead>
              <TableHead className="font-bold text-white">Véhicule</TableHead>
              <TableHead className="text-right font-bold text-white pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                  Chargement des données...
                </TableCell>
              </TableRow>
            ) : filteredLivreurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                  Aucun livreur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredLivreurs.map((livreur) => (
                <TableRow key={livreur.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-50">
                  <TableCell className="font-semibold text-slate-900 py-4">
                    <div className="flex items-center gap-2.5">
                      {/* Pastille verte et initiales en blanc */}
                      <div className="w-8 h-8 rounded-full bg-[#0B3B29] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {livreur.prenom?.[0]}{livreur.nom?.[0]}
                      </div>
                      <span className="capitalize">{livreur.prenom} {livreur.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {livreur.telephone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {livreur.email || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>{livreur.type_vehicule}</span>
                      <span className="text-slate-400 font-normal">({livreur.immatriculation})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {activeTab === "actifs" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchiver(livreur)}
                        className="gap-1.5 text-amber-700 border-amber-200 bg-amber-50/40 hover:bg-amber-100 hover:text-amber-900 font-medium shadow-2xs rounded-lg transition-all"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Archiver
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDesarchiver(livreur)}
                        className="gap-1.5 text-emerald-700 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100 hover:text-emerald-900 font-medium shadow-2xs rounded-lg transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Désarchiver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}