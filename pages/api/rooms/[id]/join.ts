import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { roomStore } from '@/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  const room = roomStore.getRoom(id as string);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.currentPlayers >= room.maxPlayers) {
    return res.status(400).json({ error: 'Room is full' });
  }

  const alreadyJoined = room.participants.some((p) => p.id === session.user.id);

  if (alreadyJoined) {
    return res.status(400).json({ error: 'Already joined' });
  }

  const updatedRoom = roomStore.updateRoom(id as string, {
    currentPlayers: room.currentPlayers + 1,
    participants: [
      ...room.participants,
      {
        id: session.user.id!,
        name: session.user.name || 'Anonymous',
        avatar: session.user.image || undefined,
        joinedAt: Date.now(),
      },
    ],
  });

  return res.status(200).json(updatedRoom);
}
