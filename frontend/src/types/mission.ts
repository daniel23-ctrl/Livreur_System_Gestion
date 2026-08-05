export type MissionStatus = 'en_livraison' | 'assignee' | 'livree';

export interface Mission {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  description: string;
  price: string;
  status: MissionStatus;
  statusLabel: string;
  highlightBorder?: boolean;
}

export interface LivreurProfile {
  initials: string;
  name: string;
  status: string;
  coursesCount: number;
  rating: number;
}