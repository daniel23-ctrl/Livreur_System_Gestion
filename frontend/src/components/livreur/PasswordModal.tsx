'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateMonMotDePasse } from '@/services/livreur.service';
import { Lock, X, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [passwordData, setPasswordData] = useState({
    ancien_mot_de_passe: '',
    nouveau_mot_de_passe: '',
  });

  // États pour afficher/masquer les mots de passe
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!isOpen || !mounted) return null;

  const handlePasswordChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await updateMonMotDePasse(passwordData);
      setPasswordSuccess('Mot de passe mis à jour avec succès !');
      setPasswordData({ ancien_mot_de_passe: '', nouveau_mot_de_passe: '' });
      setTimeout(() => {
        onClose();
        setPasswordSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 animate-in fade-in">
      {/* Modale élargie avec max-w-lg et p-8 */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 space-y-6 border border-gray-100">
        
        {/* En-tête avec couleur jaune doré */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h4 className="text-base font-bold text-amber-600 flex items-center gap-2.5">
            <Lock size={20} className="text-amber-500" /> Modifier mon mot de passe
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle size={16} /> {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Ancien mot de passe</label>
            <div className="relative">
              <input
                type={showAncien ? 'text' : 'password'}
                name="ancien_mot_de_passe"
                required
                value={passwordData.ancien_mot_de_passe}
                onChange={handlePasswordChangeInput}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowAncien(!showAncien)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showAncien ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNouveau ? 'text' : 'password'}
                name="nouveau_mot_de_passe"
                required
                value={passwordData.nouveau_mot_de_passe}
                onChange={handlePasswordChangeInput}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNouveau(!showNouveau)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNouveau ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-2xl px-4 py-2"
            >
              Annuler
            </Button>
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0b3b29] text-white rounded-2xl text-xs font-bold hover:bg-[#0b3b29]/90 transition-all shadow-sm disabled:opacity-50"
            >
              {passwordLoading && <Loader2 size={14} className="animate-spin" />}
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}