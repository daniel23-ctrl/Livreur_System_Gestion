'client'; // Indique que c'est un Composant Client (obligatoire pour React Query dans Next.js App Router)

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
  // On initialise le QueryClient à l'intérieur du composant avec un useState
  // pour s'assurer qu'il est créé une seule fois par session utilisateur
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes de cache
            refetchOnWindowFocus: false, // Pas de rechargement intempestif au focus
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}