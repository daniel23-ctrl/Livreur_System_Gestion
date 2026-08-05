import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UserInfoForm() {
  return (
    <Card className="rounded-2xl shadow-sm border-gray-100 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          VOS INFORMATIONS
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        {/* Force 2 colonnes côte à côte */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prenom" className="text-xs font-bold text-gray-800">
              Prénom
            </Label>
            <Input
              id="prenom"
              type="text"
              placeholder="Amavi"
              className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nom" className="text-xs font-bold text-gray-800">
              Nom
            </Label>
            <Input
              id="nom"
              type="text"
              placeholder="Kodjo"
              className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div className="space-y-1">
          <Label htmlFor="telephone" className="text-xs font-bold text-gray-800">
            Téléphone (8 chiffres)
          </Label>
          <Input
            id="telephone"
            type="tel"
            maxLength={8}
            placeholder="90123456"
            className="h-10 rounded-xl bg-gray-50/80 border-gray-200/80 text-xs text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}