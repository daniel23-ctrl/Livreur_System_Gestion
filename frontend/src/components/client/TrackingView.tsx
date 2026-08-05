import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function TrackingView() {
  return (
    <Card className="rounded-2xl sm:rounded-3xl shadow-sm border-gray-100 bg-white w-full">
      <CardHeader className="pb-3 pt-5 px-4 sm:px-6">
        <CardTitle className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Suivre une livraison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 sm:px-6 pb-5">
        <div className="space-y-1.5">
          <p className="text-xs sm:text-sm text-gray-600">
            Entrez le numéro de suivi ou le numéro de téléphone associé à votre commande.
          </p>
          <div className="flex gap-2 pt-2">
            <Input
              type="text"
              placeholder="Ex: CMD-2026-SE5D"
              className="h-11 rounded-xl bg-gray-50/70 border-gray-200 focus-visible:ring-[#C89D27] text-sm"
            />
            <Button className="h-11 px-4 bg-[#C89D27] hover:bg-[#b08920] text-emerald-950 rounded-xl font-semibold border-0">
              <Search size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}