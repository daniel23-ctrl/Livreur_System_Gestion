// lib/socket.ts

class WSService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    // Si déjà connecté ou en cours de connexion, on ne fait rien
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Pointe bien vers l'URL de ton FastAPI avec la route /ws
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connecté au WebSocket FastAPI avec succès !');
    };

    this.ws.onmessage = (event) => {
      try {
        console.log('Message brut reçu du WebSocket :', event.data);
        
        // On parse le JSON reçu du serveur FastAPI pour extraire l'événement et les données
        const parsed = JSON.parse(event.data);
        const eventName = parsed.event; // Ex: 'commandeCreated'
        const eventData = parsed.data;  // Ex: { id: '...', reference: '...' }

        // Si on a bien un nom d'événement valide et des écouteurs inscrits
        if (eventName && this.listeners.has(eventName)) {
          this.listeners.get(eventName)?.forEach((callback) => callback(eventData));
        }
      } catch (e) {
        console.error('Erreur lors du parsing du message WebSocket :', e);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Erreur WebSocket :', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket déconnecté. Nouvelle tentative dans 3 secondes...');
      this.ws = null;
      setTimeout(() => this.connect(), 3000); // Reconnexion automatique
    };
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.listeners.has(event)) return;
    const filtered = this.listeners.get(event)?.filter((cb) => cb !== callback);
    this.listeners.set(event, filtered || []);
  }
}

export const wsService = new WSService();