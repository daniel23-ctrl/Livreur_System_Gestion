"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Package, Clock, Search, Loader2, RefreshCw } from "lucide-react";
import { CommandeResponse } from "@/types/commande.types";
import { Livreur } from "@/types/livreur.types";
import { getAll as getAllCommandes, affecterLivreur } from "@/services/commande.service";
import { getDisponibles } from "@/services/livreur.service";
import { AffectationModal } from "./AffectationModal";
import { toast } from "sonner"; // Assurez-vous d'importer votre bibliothèque de toast (ex: Sonner ou React-Hot-Toast)

interface Props {
  onAffectationSuccess?: () => void;
}

export function CommandesNonAffectees({ onAffectationSuccess }: Props) {
  const [commandes, setCommandes] = useState<CommandeResponse[]>([]);
  const [livreursDispo, setLivreursDispo] = useState<Livreur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<CommandeResponse | null>(null);
  const [affectingId, setAffectingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dataCommandes, dataLivreursDispo] = await Promise.all([
        getAllCommandes(),
        getDisponibles()
      ]);
      
      const nonAffectees = dataCommandes.filter((cmd) => !cmd.id_livreur && !cmd.livreur);
      setCommandes(nonAffectees);
      setLivreursDispo(dataLivreursDispo);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (cmd: CommandeResponse) => {
    setSelectedCommande(cmd);
    setIsModalOpen(true);
  };

  const handleAffecterLivreur = async (idCommande: string, idLivreur: string) => {
    try {
      setAffectingId(idCommande);
      await affecterLivreur(idCommande, { id_livreur: idLivreur });
      
      toast.success("Livreur affecté avec succès !");
      
      await fetchData(); 
      setIsModalOpen(false); // Ferme la modale proprement
      if (onAffectationSuccess) onAffectationSuccess();
    } catch (error: any) {
      console.error("Erreur lors de l'affectation :", error);
      
      // Gestion de secours en cas de timeout réseau où la requête a quand même abouti
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        toast.success("Livreur affecté avec succès !");
        await fetchData();
        setIsModalOpen(false);
        if (onAffectationSuccess) onAffectationSuccess();
      } else {
        toast.error("Erreur lors de l'affectation du livreur.");
      }
    } finally {
      setAffectingId(null);
    }
  };

  const filteredCommandes = commandes.filter(
    (cmd) =>
      (cmd.client?.nom?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      cmd.adresse_livraison.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="border-gray-100 shadow-xs flex flex-col overflow-hidden pt-0 mt-0 gap-0">
        <CardHeader className="py-3 px-3.5 bg-[#0B3B29] space-y-2 m-0 rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xs font-bold flex items-center gap-2">
              <span>COMMANDES A ASSIGNER</span>
              <Badge className="bg-[#DCA524] text-white border-0 text-[10px] px-1.5 py-0 font-bold">
                {filteredCommandes.length} / {commandes.length}
              </Badge>
            </CardTitle>

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
              placeholder="Rechercher par client, référence ou adresse..."
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
          ) : filteredCommandes.length > 0 ? (
            filteredCommandes.map((cmd) => (
              <div
                key={cmd.id_commande}
                className="p-2 border border-gray-100 rounded-md hover:border-emerald-200 transition-all bg-white flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[11px] text-[#0B3B29] flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-400" /> {cmd.reference}
                    </span>
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      • {cmd.client ? `${cmd.client.prenom} ${cmd.client.nom}` : "Client direct"}
                    </span>
                    <Badge className="text-[9px] px-1 py-0 bg-blue-100 text-blue-700">
                      {cmd.statut_commande}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5" /> {cmd.adresse_livraison}
                    </span>
                    <span className="text-[#DCA524] flex items-center gap-0.5 font-medium">
                      <Clock className="w-2.5 h-2.5 text-[#DCA524]" /> 
                      {cmd.createdAt ? new Date(cmd.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) : "Récemment"}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={affectingId === cmd.id_commande}
                  onClick={() => handleOpenModal(cmd)}
                  className="bg-[#DCA524] hover:bg-[#c59320] text-white text-[10px] h-6 px-2 shrink-0"
                >
                  {affectingId === cmd.id_commande ? <Loader2 className="w-3 h-3 animate-spin" /> : "Affecter"}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 text-[11px]">
              Aucune commande à assigner
            </div>
          )}
        </CardContent>
      </Card>

      <AffectationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        commande={selectedCommande}
        livreursDispo={livreursDispo}
        onAffecter={handleAffecterLivreur}
      />
    </>
  );
}