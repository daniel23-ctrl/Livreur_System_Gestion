"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Loader2, Clock, MapPin, Phone, Search, RefreshCw, Filter, ChevronLeft, ChevronRight, Package, Calendar, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CommandeResponse, CommandeDetails } from "@/types/commande.types";
import { getAll as getAllCommandes } from "@/services/commande.service";
import { CommandeDetailsDialog } from "@/components/admin/commandes/CommandeDetailDialog";
import { toast } from "sonner"; // Assurez-vous d'importer votre librairie de toast (ex: sonner ou useToast)

export function SuiviAffectationsTable() {
  const [affectations, setAffectations] = useState<CommandeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TOUS");
  
  // Switch de période (Aujourd'hui / Global)
  const [periode, setPeriode] = useState<"AUJOURDHUI" | "GLOBAL">("GLOBAL");

  // États pour la pagination dynamique
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // États pour la gestion du modal de détails
  const [selectedCommande, setSelectedCommande] = useState<CommandeDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchAffectations = async () => {
    try {
      setLoading(true);
      const data = await getAllCommandes();
      const coursesActives = data.filter((cmd) => cmd.id_livreur || cmd.livreur);
      
      // Inversion de la liste pour afficher les plus récentes en premier
      setAffectations(coursesActives.reverse());
    } catch (error) {
      console.error("Erreur lors du chargement du suivi des courses :", error);
      toast.error("Erreur lors du chargement du suivi des courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffectations();
  }, []);

  // Réinitialiser la page courante lors d'une recherche, changement de filtre, de période ou de nombre d'éléments
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, periode, itemsPerPage]);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "ASSIGNEE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "EN_COURS_DE_COLLECTE":
      case "EN_COURS_DE_LIVRAISON":
      case "EN_COURS":
      case "En route": 
        return "bg-[#DCA524]/10 text-[#DCA524] border-[#DCA524]/30";
      case "LIVREE":
      case "RECUPEREE":
      case "Récupérée": 
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ANNULEE":
        return "bg-red-50 text-red-700 border-red-200";
      default: 
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Filtrage combiné (Recherche textuelle + Filtre de statut + Période)
  const filteredAffectations = affectations.filter((row) => {
    const clientNom = row.client ? `${row.client.prenom || ""} ${row.client.nom || ""}`.toLowerCase() : "";
    const livreurNom = row.livreur ? `${row.livreur.prenom || ""} ${row.livreur.nom || ""}`.toLowerCase() : "";
    const ref = row.reference?.toLowerCase() || "";
    const adresse = row.adresse_livraison?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = ref.includes(search) || clientNom.includes(search) || livreurNom.includes(search) || adresse.includes(search);
    const matchesStatus = statusFilter === "TOUS" || row.statut_commande === statusFilter;

    // Filtre de période (Aujourd'hui vs Global)
    let matchesPeriode = true;
    if (periode === "AUJOURDHUI" && row.createdAt) {
      const todayStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      const cmdDate = row.createdAt.split('T')[0];
      matchesPeriode = cmdDate === todayStr;
    }

    return matchesSearch && matchesStatus && matchesPeriode;
  });

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredAffectations.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredAffectations.slice(startIndex, startIndex + itemsPerPage);

  // Gestionnaire enveloppant le succès d'une affectation (pour le Toast + Refresh)
  const handleCommandeUpdatedSuccess = async () => {
    toast.success("Livreur affecté avec succès !");
    await fetchAffectations();
  };

  return (
    <>
      <Card className="border-gray-100 shadow-xs pt-0 mt-3 overflow-hidden rounded-xl">
        {/* En-tête vert émeraude professionnel et interactif */}
        <CardHeader className="py-4 px-4 bg-[#0B3B29] space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <CardTitle className="text-white text-xs font-bold tracking-wide flex items-center gap-2">
                <span className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  SUIVI DES COURSES ACTIVES
                </span>
              </CardTitle>
              <Badge className="bg-[#DCA524] text-white border-0 text-[10px] px-2 py-0.5 font-bold shadow-xs">
                {filteredAffectations.length} / {affectations.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Switch Période : Aujourd'hui / Global (Harmonisé en Vert) */}
              <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20">
                <button
                  type="button"
                  onClick={() => setPeriode("AUJOURDHUI")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    periode === "AUJOURDHUI"
                      ? "bg-white text-[#0B3B29] shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  Aujourd'hui
                </button>

                <button
                  type="button"
                  onClick={() => setPeriode("GLOBAL")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    periode === "GLOBAL"
                      ? "bg-white text-[#0B3B29] shadow-xs"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Global
                </button>
              </div>

              {/* Bouton de rafraîchissement rapide */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAffectations}
                disabled={loading}
                className="h-8 bg-white/10 hover:bg-white/20 text-white border-white/20 text-[11px] gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </Button>
            </div>
          </div>

          {/* Barre de recherche et filtres rapides */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <Input
                placeholder="Rechercher par référence, client, livreur ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-[11px] bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus-visible:ring-[#DCA524]"
              />
            </div>

            {/* Filtres par statut rapides */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <Filter className="w-3.5 h-3.5 text-[#DCA524] shrink-0 ml-1 hidden sm:block" />
              
              <Button
                type="button"
                variant={statusFilter === "TOUS" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("TOUS")}
                className={`text-[10px] h-7 px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === "TOUS"
                    ? "bg-[#DCA524] hover:bg-[#c39120] text-white font-semibold border-0"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/20"
                }`}
              >
                Tous
              </Button>

              <Button
                type="button"
                variant={statusFilter === "ASSIGNEE" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ASSIGNEE")}
                className={`text-[10px] h-7 px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === "ASSIGNEE"
                    ? "bg-[#DCA524] hover:bg-[#c39120] text-white font-semibold border-0"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/20"
                }`}
              >
                Assignées
              </Button>

              <Button
                type="button"
                variant={statusFilter === "EN_COURS_DE_COLLECTE" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("EN_COURS_DE_COLLECTE")}
                className={`text-[10px] h-7 px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === "EN_COURS_DE_COLLECTE"
                    ? "bg-[#DCA524] hover:bg-[#c39120] text-white font-semibold border-0"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/20"
                }`}
              >
                En collecte
              </Button>

              <Button
                type="button"
                variant={statusFilter === "EN_COURS_DE_LIVRAISON" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("EN_COURS_DE_LIVRAISON")}
                className={`text-[10px] h-7 px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === "EN_COURS_DE_LIVRAISON"
                    ? "bg-[#DCA524] hover:bg-[#c39120] text-white font-semibold border-0"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/20"
                }`}
              >
                En livraison
              </Button>

              <Button
                type="button"
                variant={statusFilter === "LIVREE" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("LIVREE")}
                className={`text-[10px] h-7 px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === "LIVREE"
                    ? "bg-[#DCA524] hover:bg-[#c39120] text-white font-semibold border-0"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/20"
                }`}
              >
                Livrées
              </Button>

              <Button
                type="button"
                variant={statusFilter === "ANNULEE" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ANNULEE")}
                className={`text-[10px] h-7 px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === "ANNULEE"
                    ? "bg-[#DCA524] hover:bg-[#c39120] text-white font-semibold border-0"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/20"
                }`}
              >
                Annulées
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 bg-white">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#0B3B29]" />
            </div>
          ) : currentItems.length > 0 ? (
            <>
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="text-[11px] font-bold text-gray-600">N° Référence / Destination</TableHead>
                    <TableHead className="text-[11px] font-bold text-gray-600">Client / Demandeur</TableHead>
                    <TableHead className="text-[11px] font-bold text-gray-600">Livreur Assigné</TableHead>
                    <TableHead className="text-[11px] font-bold text-gray-600">Date / Heure</TableHead>
                    <TableHead className="text-[11px] font-bold text-gray-600">Statut Actuel</TableHead>
                    <TableHead className="text-[11px] font-bold text-gray-600 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((row) => {
                    const clientNom = row.client 
                      ? `${row.client.prenom || ""} ${row.client.nom || ""}`.trim() 
                      : "Client direct";
                    
                    const clientTel = row.client?.telephone || row.telephone_demandeur || "Non renseigné";
                    const telephoneDestinataire = row.telephone_destinataire || "Non renseigné";

                    const livreurNom = row.livreur 
                      ? `${row.livreur.prenom || ""} ${row.livreur.nom || ""}`.trim() 
                      : "Livreur assigné";

                    const livreurTel = row.livreur?.telephone || "Non renseigné";

                    const dateFormatee = row.createdAt 
                      ? new Date(row.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                      : "-";

                    const heureFormatee = row.createdAt 
                      ? new Date(row.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }) 
                      : "-";

                    return (
                      <TableRow 
                        key={row.id_commande} 
                        onClick={() => {
                          setSelectedCommande(row as unknown as CommandeDetails);
                          setIsDetailsOpen(true);
                        }}
                        className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                      >
                        <TableCell className="py-3">
                          <div className="font-semibold text-[11px] text-[#0B3B29]">
                            {row.reference}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> 
                            <span className="truncate">{row.adresse_livraison || "Destination non spécifiée"}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-[#DCA524] shrink-0" /> 
                            <span>{telephoneDestinataire}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="text-[11px] text-gray-700 font-medium">
                            {clientNom}
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-[#DCA524] shrink-0" /> 
                            <span>{clientTel}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="text-[11px] text-gray-800 font-semibold">
                            {livreurNom}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5 text-[#DCA524] shrink-0" /> 
                            <span>{livreurTel}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <div className="text-[11px] text-gray-700 font-medium">
                            {dateFormatee}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-[#DCA524] shrink-0" />
                            <span>{heureFormatee}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-[11px]">
                          <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 ${getStatusColor(row.statut_commande)}`}>
                            {row.statut_commande}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => alert(`Téléphone livreur : ${livreurTel}`)}>
                                Contacter Livreur
                              </DropdownMenuItem>
                              <DropdownMenuItem>Réassigner</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">Annuler l'affectation</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Barre de pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/30 gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-[11px] text-gray-500">
                    Affichage de <span className="font-medium text-gray-700">{filteredAffectations.length > 0 ? startIndex + 1 : 0}</span> à <span className="font-medium text-gray-700">{Math.min(startIndex + itemsPerPage, filteredAffectations.length)}</span> sur <span className="font-medium text-gray-700">{filteredAffectations.length}</span> résultats
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 hidden md:inline">Lignes :</span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(val) => setItemsPerPage(Number(val))}
                    >
                      <SelectTrigger className="h-7 w-[70px] text-[11px]">
                        <SelectValue placeholder={String(itemsPerPage)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5" className="text-xs">5</SelectItem>
                        <SelectItem value="10" className="text-xs">10</SelectItem>
                        <SelectItem value="20" className="text-xs">20</SelectItem>
                        <SelectItem value="50" className="text-xs">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-7 text-[11px] px-2.5 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Précédent
                  </Button>
                  
                  <div className="text-[11px] font-medium px-2 text-gray-600">
                    Page {currentPage} / {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-7 text-[11px] px-2.5 gap-1"
                  >
                    Suivant
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
              <Search className="w-8 h-8 text-gray-300" />
              <span>Aucune course active ne correspond à votre recherche</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Intégration du modal de détails avec gestion du rafraîchissement et du toast de succès */}
      <CommandeDetailsDialog
        commande={selectedCommande}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onCommandeUpdated={handleCommandeUpdatedSuccess}
      />
    </>
  );
}