"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Loader2, Package, Phone, Bike, Car, RefreshCw } from "lucide-react";
import { Livreur } from "@/types/livreur.types";
import { CommandeResponse } from "@/types/commande.types";
import { getDisponibles } from "@/services/livreur.service";
import { getAll as getAllCommandes } from "@/services/commande.service";

export function LivreursDisponibles() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dataLivreurs, dataCommandes] = await Promise.all([
        getDisponibles(),
        getAllCommandes()
      ]);
      setLivreurs(dataLivreurs);
      setCommandes(dataCommandes);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getChargeLivreur = (livreurId: string) => {
    return commandes.filter(
      (cmd) => 
        (cmd.id_livreur === livreurId || cmd.livreur?.id === livreurId) &&
        cmd.statut_commande !== "LIVREE" && 
        cmd.statut_commande !== "ANNULEE"
    ).length;
  };

  const filteredLivreurs = livreurs.filter(
    (l) =>
      (l.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (l.prenom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (l.immatriculation || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetails = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <Card className="border-gray-100 shadow-xs flex flex-col overflow-hidden pt-0 mt-0 gap-0">
        <CardHeader className="py-3 px-3.5 bg-[#0B3B29] space-y-2 m-0 rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xs font-bold flex items-center gap-2">
              <span>LIVREURS EN LIGNE</span>
              <Badge className="bg-[#DCA524] text-white border-0 text-[10px] px-1.5 py-0 font-bold">
                {filteredLivreurs.length} actifs
              </Badge>
            </CardTitle>

            {/* Bouton de réactualisation sécurisé */}
            <div
              role="button"
              onClick={!loading ? fetchData : undefined}
              className={`h-7 px-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-medium rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>Actualiser</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-300" />
            <Input
              placeholder="Rechercher par nom ou immatriculation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-7 text-[11px] bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus-visible:ring-[#DCA524]"
            />
          </div>
        </CardHeader>

        <CardContent className="p-2.5 max-h-[220px] overflow-y-auto space-y-2 custom-scrollbar bg-white">
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#0B3B29]" />
            </div>
          ) : filteredLivreurs.length > 0 ? (
            filteredLivreurs.map((livreur) => {
              const initials = `${livreur.prenom?.[0] || ""}${livreur.nom?.[0] || ""}`.toUpperCase();
              const livreurId = livreur.id;
              const charge = getChargeLivreur(livreurId);

              return (
                <div
                  key={livreurId}
                  className="flex items-center justify-between p-2.5 border border-gray-100 rounded-xl hover:border-emerald-200 transition-all bg-white shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar className="w-9 h-9 border border-white shadow-xs rounded-xl">
                        <AvatarFallback className="bg-[#0B3B29] text-white text-[10px] font-bold rounded-xl">
                          {initials || "LV"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          livreur.etat_activite === "DISPONIBLE" ? "bg-green-500" : "bg-[#DCA524]"
                        }`}
                      ></span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate">
                        {livreur.prenom} {livreur.nom}
                      </p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-gray-400" /> 
                        <span className="font-medium text-gray-600">
                          {(livreur.type_vehicule || "MOTO").toUpperCase()} • {livreur.immatriculation}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-amber-50/80 text-amber-800 border-amber-200 font-semibold shadow-2xs">
                      Charge: {charge}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(livreur)}
                      className="text-[11px] h-7 px-3 border-gray-200 text-[#0B3B29] hover:bg-emerald-50 hover:border-emerald-200 font-semibold shadow-2xs"
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-gray-400 text-[11px]">
              Aucun livreur disponible
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-2xl bg-white">
          {selectedLivreur && (() => {
            const chargeActuelle = getChargeLivreur(selectedLivreur.id);
            const typeVehicule = (selectedLivreur.type_vehicule || "MOTO").toUpperCase();

            return (
              <>
                <div className="bg-[#0B3B29] text-white p-5">
                  <div className="text-[10px] tracking-wider uppercase font-semibold text-[#DCA524] mb-1">
                    PROFIL LIVREUR
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-base border border-white/15">
                      {selectedLivreur.prenom?.[0]}{selectedLivreur.nom?.[0]}
                    </div>
                    <div>
                      <DialogTitle className="text-white text-base font-bold">
                        {selectedLivreur.prenom} {selectedLivreur.nom}
                      </DialogTitle>
                      <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#DCA524]" /> {selectedLivreur.telephone || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900">Charge de travail active</p>
                        <p className="text-[11px] text-amber-700">Commandes en cours non livrées</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-amber-800 bg-white px-3 py-1 rounded-lg border border-amber-200 shadow-xs">
                      {chargeActuelle}
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500">Statut d'activité :</span>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        {selectedLivreur.etat_activite || "DISPONIBLE"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/60">
                      <span className="text-gray-500">Type de véhicule :</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        {typeVehicule === "VOITURE" ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                        {typeVehicule}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Immatriculation :</span>
                      <span className="font-mono font-bold text-[#0B3B29]">{selectedLivreur.immatriculation || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => setIsDetailModalOpen(false)}
                      className="bg-[#0B3B29] hover:bg-[#0B3B29]/90 text-white text-xs h-8 px-4"
                    >
                      Fermer
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}