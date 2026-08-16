pnpm add socket.io-client

Creer lib/socket.ts

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Force le protocole websocket
  autoConnect: true,
});

Connecter le components/providers.ts avec le socket

'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { socket } from '@/lib/socket'; // Importe ton instance de socket

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    // Vérification simple de connexion
    socket.on('connect', () => {
      console.log('Connecté au serveur WebSocket !');
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

