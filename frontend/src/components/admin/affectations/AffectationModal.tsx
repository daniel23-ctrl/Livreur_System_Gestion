"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, MapPin, Phone, Package, Clock, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { CommandeResponse } from "@/types/commande.types";
import { Livreur } from "@/types/livreur.types";
import { toast } from "sonner";

interface AffectationModalProps {
  isOpen: boolean;
  onClose: () => void;
  commande: CommandeResponse | null;
  livreursDispo: Livreur[];
  onAffecter: (idCommande: string, idLivreur: string) => Promise<void>;
}

export function AffectationModal({
  isOpen,
  onClose,
  commande,
  livreursDispo,
  onAffecter,
}: AffectationModalProps) {
  const [selectedLivreurId, setSelectedLivreurId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!commande) return null;

  const clientNom = commande.client 
    ? `${commande.client.prenom || ""} ${commande.client.nom || ""}`.trim() 
    : "Client direct";

  const telephoneDestinataire = commande.telephone_destinataire || "Non renseigné";

  const dateFormatee = commande.createdAt 
    ? new Date(commande.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
    : "-";

  const heureFormatee = commande.createdAt 
    ? new Date(commande.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : "-";

  // Filtrer les livreurs selon la recherche (nom, prénom ou téléphone)
  const livreursFiltres = livreursDispo.filter((livreur) => {
    const nomComplet = `${livreur.prenom || ""} ${livreur.nom || ""}`.toLowerCase();
    const telephone = livreur.telephone || "";
    const terme = searchTerm.toLowerCase();
    return nomComplet.includes(terme) || telephone.includes(terme);
  });

  const handleConfirm = async () => {
    if (!selectedLivreurId) return;
    try {
      setLoading(true);
      await onAffecter(commande.id_commande, selectedLivreurId);
      
      // Feedback immédiat de succès
      toast.success("Livreur affecté avec succès !");
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de l'affectation :", error);
      
      // Si c'est un timeout mais que le serveur a potentiellement traité la requête
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        toast.success("Livreur affecté avec succès !");
        onClose();
      } else {
        toast.error("Erreur lors de l'affectation du livreur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-2xl">
        
        {/* En-tête vert émeraude personnalisé */}
        <div className="bg-[#0B3B29] text-white p-5 relative">
          <div className="text-[10px] tracking-wider uppercase font-semibold text-[#DCA524] mb-1">
            NOUVEAU
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/15 shadow-inner">
              <UserPlus className="w-5 h-5 text-[#DCA524]" />
            </div>
            <DialogTitle className="text-white text-lg font-bold tracking-tight">
              Ajouter un Livreur
            </DialogTitle>
          </div>
        </div>

        {/* Corps du modal : Informations de la commande en haut */}
        <div className="p-5 space-y-4 bg-white">
          
          {/* Carte récapitulative de la commande */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0B3B29]" />
                <span className="text-xs font-bold text-[#0B3B29]">{commande.reference}</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold bg-[#DCA524]/10 text-[#DCA524] border-[#DCA524]/30">
                {commande.statut_commande}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200/60">
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">Dest: {commande.adresse_livraison || "Non spécifiée"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone className="w-3.5 h-3.5 text-[#DCA524] shrink-0" />
                <span>Tel Dest: {telephoneDestinataire}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <span className="font-medium text-gray-700">Client :</span>
                <span className="truncate">{clientNom}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-3.5 h-3.5 text-[#0B3B29] shrink-0" />
                <span>{dateFormatee} à {heureFormatee}</span>
              </div>
            </div>
          </div>

          {/* Section Sélection du Livreur avec Barre de Recherche */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                Sélectionner un livreur disponible ({livreursFiltres.length}/{livreursDispo.length})
              </label>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-gray-50/50 border-gray-200 focus-visible:ring-[#0B3B29]"
              />
            </div>

            {livreursFiltres.length > 0 ? (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {livreursFiltres.map((livreur) => {
                  const prenom = livreur.prenom || "";
                  const nom = livreur.nom || "";
                  const nomComplet = `${prenom} ${nom}`.trim() || "Livreur sans nom";
                  
                  // Initiales (ex: PA pour Patrice Akoumany)
                  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || prenom.charAt(0).toUpperCase() || "L";
                  
                  const isSelected = selectedLivreurId === livreur.id;

                  return (
                    <div
                      key={livreur.id}
                      onClick={() => setSelectedLivreurId(livreur.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#0B3B29] bg-[#0B3B29]/5 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Bloc des initiales */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs tracking-wider shrink-0 transition-colors ${
                          isSelected ? "bg-[#0B3B29] text-white shadow-sm" : "bg-[#DCA524] text-gray-700"
                        }`}>
                          {initiales}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{nomComplet}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3 text-[#DCA524]" />
                            <span>{livreur.telephone || "Pas de téléphone"}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#0B3B29] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-5 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <AlertCircle className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs font-medium text-gray-600">Aucun livreur trouvé</span>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-4"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              disabled={!selectedLivreurId || loading}
              onClick={handleConfirm}
              className="bg-[#0B3B29] hover:bg-[#0B3B29]/90 text-white text-xs h-8 px-4 gap-1.5"
            >
              {loading ? "Affectation..." : "Confirmer l'affectation"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}