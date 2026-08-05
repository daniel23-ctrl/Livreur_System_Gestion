import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function DeliveryDetailsForm() {
  return (
    <Card className="rounded-2xl shadow-sm border-gray-100 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          DÉTAILS DE LA LIVRAISON
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        {/* Point A */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />
            <Label htmlFor="point_a" className="text-xs font-bold text-gray-800 cursor-pointer">
              Point A <span className="font-normal text-gray-600">— Ramassage</span>
            </Label>
          </div>
          <Input
            id="point_a"
            type="text"
            placeholder="Rue des Commerçants, Lomé"
            className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400 focus-visible:ring-[#C89D27]"
          />
        </div>

        {/* Point B */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C89D27] inline-block shrink-0" />
            <Label htmlFor="point_b" className="text-xs font-bold text-gray-800 cursor-pointer">
              Point B <span className="font-normal text-gray-600">— Destination</span>
            </Label>
          </div>
          <Input
            id="point_b"
            type="text"
            placeholder="Quartier Bè, Lomé"
            className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400 focus-visible:ring-[#C89D27]"
          />
        </div>

        {/* Description du colis */}
        <div className="space-y-1">
          <Label htmlFor="description" className="text-xs font-bold text-gray-800">
            Description du colis
          </Label>
          <Textarea
            id="description"
            placeholder="Documents, médicaments, vêtements..."
            className="min-h-[75px] rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400 resize-none p-3 focus-visible:ring-[#C89D27]"
          />
        </div>

        {/* Téléphone destinataire */}
        <div className="space-y-1">
          <Label htmlFor="tel_destinataire" className="text-xs font-bold text-gray-800">
            Téléphone destinataire (8 chiffres)
          </Label>
          <Input
            id="tel_destinataire"
            type="tel"
            maxLength={8}
            placeholder="91000000"
            className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400 focus-visible:ring-[#C89D27]"
          />
        </div>
      </CardContent>
    </Card>
  );
}