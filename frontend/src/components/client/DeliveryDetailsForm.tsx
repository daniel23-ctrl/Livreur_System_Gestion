'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2, Search, Navigation } from 'lucide-react';

interface DeliveryDetailsFormProps {
  formData: {
    point_a: string;
    lat_a: string;
    lng_a: string;
    point_b: string;
    lat_b: string;
    lng_b: string;
    nom_destinataire: string;
    telephone_destinataire: string;
    telephone_demandeur: string; 
    montant_a_percevoir: string;
    description: string;
    instructions: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function DeliveryDetailsForm({ formData, setFormData }: DeliveryDetailsFormProps) {
  const [loadingGps, setLoadingGps] = useState<'A' | 'B' | null>(null);
  const [gpsStatus, setGpsStatus] = useState<{ A: boolean; B: boolean }>({ A: false, B: false });

  // États unifiés pour la recherche et l'autocomplétion
  const [activePoint, setActivePoint] = useState<'A' | 'B' | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Expression régulière pour valider le format togolais (8 chiffres commençant par 2, 7 ou 9)
  const isTogolesePhoneValid = (phone: string) => {
    const tgRegex = /^(?:[279]\d{7})$/;
    return tgRegex.test(phone);
  };

  // Recherche unifiée de lieux avec l'API Nominatim
  useEffect(() => {
    if (query.length < 3 || !activePoint) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=tg&limit=5`, {
          headers: { 'Accept-Language': 'fr' }
        });
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Erreur de recherche:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, activePoint]);

  // Sélectionner une suggestion pour le Point A ou B
  const handleSelectLocation = (item: any) => {
    const displayName = item.display_name;
    const lat = item.lat;
    const lon = item.lon;

    if (activePoint === 'A') {
      setFormData((prev: any) => ({ ...prev, point_a: displayName, lat_a: lat, lng_a: lon }));
      setGpsStatus((prev) => ({ ...prev, A: true }));
    } else if (activePoint === 'B') {
      setFormData((prev: any) => ({ ...prev, point_b: displayName, lat_b: lat, lng_b: lon }));
      setGpsStatus((prev) => ({ ...prev, B: true }));
    }

    setShowSuggestions(false);
    setQuery('');
  };

  // Récupérer la position GPS actuelle du navigateur (Géolocalisation)
  const handleGetLocation = (point: 'A' | 'B') => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLoadingGps(point);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'fr' } }
          );
          const data = await response.json();
          const readableAddress = data?.display_name || `Position GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

          if (point === 'A') {
            setFormData((prev: any) => ({ ...prev, point_a: readableAddress, lat_a: lat.toString(), lng_a: lng.toString() }));
          } else {
            setFormData((prev: any) => ({ ...prev, point_b: readableAddress, lat_b: lat.toString(), lng_b: lng.toString() }));
          }
        } catch (error) {
          const fallbackAddress = `GPS (${lat}, ${lng})`;
          if (point === 'A') {
            setFormData((prev: any) => ({ ...prev, point_a: fallbackAddress, lat_a: lat.toString(), lng_a: lng.toString() }));
          } else {
            setFormData((prev: any) => ({ ...prev, point_b: fallbackAddress, lat_b: lat.toString(), lng_b: lng.toString() }));
          }
        }

        setGpsStatus((prev) => ({ ...prev, [point]: true }));
        setLoadingGps(null);
      },
      () => {
        alert("Impossible de récupérer votre position.");
        setLoadingGps(null);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'telephone_destinataire' || name === 'telephone_demandeur') {
      const sanitized = value.replace(/\D/g, '').slice(0, 8);
      setFormData((prev: any) => ({ ...prev, [name]: sanitized }));
      return;
    }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="rounded-2xl shadow-sm border-gray-100 bg-white/95 backdrop-blur-sm relative">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          DÉTAILS DE LA LIVRAISON
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        {/* Point A : Ramassage */}
        <div className="space-y-1 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />
              <Label className="text-xs font-bold text-gray-800">
                Point A <span className="font-normal text-gray-600">Ramassage</span>
              </Label>
            </div>
            <button
              type="button"
              onClick={() => handleGetLocation('A')}
              disabled={gpsStatus.B}
              className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                gpsStatus.B 
                  ? 'opacity-40 cursor-not-allowed text-gray-400' 
                  : gpsStatus.A 
                    ? 'text-emerald-600' 
                    : 'text-[#0b3b29] hover:text-[#C89D27]'
              }`}
            >
              {loadingGps === 'A' ? <Loader2 className="animate-spin" size={12} /> : <MapPin size={12} />}
              {gpsStatus.A ? 'GPS & Coordonnées OK' : 'Ma position actuelle'}
            </button>
          </div>

          <div className="relative">
            <Input
              name="point_a"
              type="text"
              value={formData.point_a}
              onChange={(e) => {
                setActivePoint('A');
                setQuery(e.target.value);
                handleChange(e);
              }}
              placeholder="Ex: Tapez un lieu de ramassage..."
              className="h-10 rounded-xl bg-gray-50/85 border-gray-200/80 text-xs text-gray-700 pl-8"
              required
            />
            <Search className="absolute left-2.5 top-3 text-gray-400" size={14} />
          </div>

          {formData.lat_a && formData.lng_a && (
            <p className="text-[10px] text-emerald-600 font-medium px-1">
               Lat: {Number(formData.lat_a).toFixed(4)}, Lng: {Number(formData.lng_a).toFixed(4)}
            </p>
          )}

          {showSuggestions && activePoint === 'A' && suggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-100 shadow-lg rounded-xl mt-1 max-h-48 overflow-y-auto text-xs">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectLocation(item)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 text-gray-700 truncate"
                >
                 {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Point B : Destination */}
        <div className="space-y-1 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C89D27] inline-block shrink-0" />
              <Label className="text-xs font-bold text-gray-800">
                Point B <span className="font-normal text-gray-600">Destination</span>
              </Label>
            </div>
            <button
              type="button"
              onClick={() => handleGetLocation('B')}
              disabled={gpsStatus.A}
              className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                gpsStatus.A 
                  ? 'opacity-40 cursor-not-allowed text-gray-400' 
                  : gpsStatus.B 
                    ? 'text-emerald-600' 
                    : 'text-[#0b3b29] hover:text-[#C89D27]'
              }`}
            >
              {loadingGps === 'B' ? <Loader2 className="animate-spin" size={12} /> : <MapPin size={12} />}
              {gpsStatus.B ? 'GPS & Coordonnées OK' : 'Ma position actuelle'}
            </button>
          </div>

          <div className="relative">
            <Input
              name="point_b"
              type="text"
              value={formData.point_b}
              onChange={(e) => {
                setActivePoint('B');
                setQuery(e.target.value);
                handleChange(e);
              }}
              placeholder="Ex: Tapez une destination de livraison..."
              className="h-10 rounded-xl bg-gray-50/85 border-gray-200/80 text-xs text-gray-700 pl-8"
              required
            />
            <Search className="absolute left-2.5 top-3 text-gray-400" size={14} />
          </div>

          {formData.lat_b && formData.lng_b && (
            <p className="text-[10px] text-emerald-600 font-medium px-1 flex items-center justify-between">
              <span>✓ Lat: {Number(formData.lat_b).toFixed(4)}, Lng: {Number(formData.lng_b).toFixed(4)}</span>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${formData.lat_b},${formData.lng_b}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0b3b29] underline hover:text-[#C89D27] flex items-center gap-0.5"
              >
                <Navigation size={10} /> Tester itinéraire
              </a>
            </p>
          )}

          {showSuggestions && activePoint === 'B' && suggestions.length > 0 && (
            <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-100 shadow-lg rounded-xl mt-1 max-h-48 overflow-y-auto text-xs">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectLocation(item)}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 text-gray-700 truncate"
                >
                  📍 {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Votre téléphone & Téléphone destinataire */}
        <div className="grid grid-cols-2 gap-3">
          {/* Votre téléphone (Demandeur) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800">Votre téléphone</Label>
              <span className="text-[10px] text-gray-600">8 chiffres</span>
            </div>
            <Input
              name="telephone_demandeur"
              type="tel"
              maxLength={8}
              value={formData.telephone_demandeur}
              onChange={handleChange}
              placeholder="90000000"
              className={`h-10 rounded-xl bg-gray-50/80 text-xs ${
                formData.telephone_demandeur.length > 0 && !isTogolesePhoneValid(formData.telephone_demandeur)
                  ? 'border-red-300 focus-visible:ring-red-400'
                  : 'border-gray-200/80'
              }`}
              required
            />
            {formData.telephone_demandeur.length > 0 && !isTogolesePhoneValid(formData.telephone_demandeur) && (
              <p className="text-[10px] text-red-500 font-medium px-1">Format invalide</p>
            )}
          </div>

          {/* Téléphone destinataire */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-800">Tél. destinataire</Label>
              <span className="text-[10px] text-gray-600">8 chiffres</span>
            </div>
            <Input
              name="telephone_destinataire"
              type="tel"
              maxLength={8}
              value={formData.telephone_destinataire}
              onChange={handleChange}
              placeholder="90000000"
              className={`h-10 rounded-xl bg-gray-50/80 text-xs ${
                formData.telephone_destinataire.length > 0 && !isTogolesePhoneValid(formData.telephone_destinataire)
                  ? 'border-red-300 focus-visible:ring-red-400'
                  : 'border-gray-200/80'
              }`}
              required
            />
            {formData.telephone_destinataire.length > 0 && !isTogolesePhoneValid(formData.telephone_destinataire) && (
              <p className="text-[10px] text-red-500 font-medium px-1">Format invalide</p>
            )}
          </div>
        </div>

        {/* Nom du destinataire */}
        <div className="space-y-1">
          <Label className="text-xs font-bold text-gray-800">Nom du destinataire</Label>
          <Input
            name="nom_destinataire"
            value={formData.nom_destinataire}
            onChange={handleChange}
            placeholder="Nom et prénom"
            className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs"
            required
          />
        </div>

        {/* Montant (FCFA) */}
        <div className="space-y-1">
          <Label className="text-xs font-bold text-gray-800">Montant (FCFA)</Label>
          <Input
            name="montant_a_percevoir"
            type="number"
            value={formData.montant_a_percevoir}
            onChange={handleChange}
            placeholder="0"
            className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs"
            required
          />
        </div>

        {/* Description du colis */}
        <div className="space-y-1">
          <Label className="text-xs font-bold text-gray-800">Description du colis</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Documents, colis..."
            className="min-h-[60px] rounded-xl bg-gray-50/80 border-gray-200/80 text-xs resize-none p-3"
            required
          />
        </div>

        {/* Instructions pour le livreur */}
        <div className="space-y-1">
          <Label className="text-xs font-bold text-gray-800">
            Instructions pour le livreur <span className="font-normal text-gray-600">(Optionnel)</span>
          </Label>
          <Textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Ex: Appeler en arrivant, ne pas sonner..."
            className="min-h-[60px] rounded-xl bg-gray-50/80 border-gray-200/80 text-xs resize-none p-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}