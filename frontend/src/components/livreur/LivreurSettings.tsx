'use client';

import React, { useState, useEffect } from 'react';
import { useLivreur } from '@/contexts/LivreurContext';
import { updateMonProfil } from '@/services/livreur.service';
import { PasswordModal } from './PasswordModal'; // <--- Import de la modale
import { User, Phone, Car, CheckCircle, Loader2, Pencil, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LivreurSettings() {
  const { profile, refreshDonnees } = useLivreur();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    type_vehicule: 'MOTO' as 'MOTO' | 'VOITURE',
    immatriculation: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        nom: (profile as any).nom || '',
        prenom: (profile as any).prenom || '',
        telephone: (profile as any).telephone || '',
        type_vehicule: ((profile as any).type_vehicule === 'VOITURE' ? 'VOITURE' : 'MOTO'),
        immatriculation: (profile as any).immatriculation || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateMonProfil(formData);
      await refreshDonnees();
      setSuccessMessage('Profil mis à jour avec succès !');
      setIsEditing(false); 
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="text-[#0b3b29]" size={22} /> Paramètres du profil
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Consultez et modifiez vos informations personnelles et les détails de votre véhicule.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-xl border-gray-200 text-[#0b3b29]"
          >
            <Lock size={14} /> Mot de passe
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsEditing(!isEditing);
              setError(null);
              setSuccessMessage(null);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-xl border-gray-200"
          >
            {isEditing ? (
              <>
                <X size={14} /> Annuler
              </>
            ) : (
              <>
                <Pencil size={14} className="text-[#0b3b29]" /> Modifier
              </>
            )}
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              disabled={!isEditing}
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3b29] ${
                !isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'
              }`}
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              disabled={!isEditing}
              value={formData.prenom}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3b29] ${
                !isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'
              }`}
              placeholder="Votre prénom"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 z-10">
                <Phone size={16} />
              </span>
              <input
                type="text"
                name="telephone"
                disabled={!isEditing}
                value={formData.telephone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3b29] ${
                  !isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'
                }`}
                placeholder="Votre numéro"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Type de véhicule</label>
            <Select
              disabled={!isEditing}
              value={formData.type_vehicule}
              onValueChange={(value: string | null) => {
                if (value === 'MOTO' || value === 'VOITURE') {
                  setFormData((prev) => ({ ...prev, type_vehicule: value }));
                }
              }}
            >
              <SelectTrigger
                className={`w-full pl-3 pr-4 py-2.5 h-auto text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0b3b29] ${
                  !isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500 opacity-100' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-gray-400" />
                  <SelectValue placeholder="Sélectionner un véhicule" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MOTO">Moto</SelectItem>
                <SelectItem value="VOITURE">Voiture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Immatriculation</label>
            <input
              type="text"
              name="immatriculation"
              disabled={!isEditing}
              value={formData.immatriculation}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0b3b29] ${
                !isEditing ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'
              }`}
              placeholder="Numéro d'immatriculation"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 mt-6">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Informations verrouillées (Contactez l'administrateur)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="text"
                disabled
                value={(profile as any)?.email || ''}
                className="w-full px-4 py-2 text-xs bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
              <input
                type="text"
                disabled
                value={(profile as any)?.role || 'LIVREUR'}
                className="w-full px-4 py-2 text-xs bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4 animate-in fade-in duration-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0b3b29] text-white rounded-xl text-xs font-bold hover:bg-[#0b3b29]/90 transition-all shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        )}
      </form>

      {/* Intégration de la modale déportée */}
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}