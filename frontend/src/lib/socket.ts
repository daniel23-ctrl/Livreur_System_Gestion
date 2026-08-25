class WSService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(force = false) {
    if (!force && this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (force && this.ws) {
      this.ws.onclose = null; // évite la reconnexion automatique de l'ancienne connexion
      this.ws.close();
      this.ws = null;
    }

    const baseWsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const wsUrl = token ? `${baseWsUrl}?token=${encodeURIComponent(token)}` : baseWsUrl;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('Connecté au WebSocket FastAPI avec succès !');
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const eventName = parsed.event;
        const eventData = parsed.data;

        if (eventName === 'ping') {
          this.ws?.send('pong');
          return;
        }

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
      setTimeout(() => this.connect(), 3000);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
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