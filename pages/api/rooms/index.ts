import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { roomStore } from '@/lib/store';
import { Room, GameMode } from '@/types';
import { createVoiceChannel } from '@/lib/discord';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const rooms = roomStore.getAllRooms();
    return res.status(200).json(rooms);
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, mode, maxPlayers = 4 } = req.body;

    if (!title || !mode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const { channelId, inviteUrl } = await createVoiceChannel(title);

      const room: Room = {
        id: Math.random().toString(36).substring(2, 11),
        title,
        mode: mode as GameMode,
        hostId: session.user.id!,
        hostName: session.user.name || 'Anonymous',
        maxPlayers,
        currentPlayers: 1,
        discordChannelId: channelId,
        discordInviteUrl: inviteUrl,
        createdAt: Date.now(),
        status: 'recruiting',
        participants: [
          {
            id: session.user.id!,
            name: session.user.name || 'Anonymous',
            avatar: session.user.image || undefined,
            joinedAt: Date.now(),
          },
        ],
      };

      roomStore.createRoom(room);

      return res.status(201).json(room);
    } catch (error) {
      console.error('Failed to create room:', error);
      return res.status(500).json({ error: 'Failed to create room' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
