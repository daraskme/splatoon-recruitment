export type GameMode = 'open' | 'salmon-run' | 'event' | 'fest';

export interface Room {
  id: string;
  title: string;
  mode: GameMode;
  hostId: string;
  hostName: string;
  maxPlayers: number;
  currentPlayers: number;
  discordChannelId?: string;
  discordInviteUrl?: string;
  createdAt: number;
  status: 'recruiting' | 'started' | 'finished';
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: number;
}
