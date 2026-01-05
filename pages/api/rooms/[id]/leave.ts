import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { roomStore } from '@/lib/store';
import { deleteVoiceChannel } from '@/lib/discord';

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

  const participants = room.participants.filter((p) => p.id !== session.user.id);
  const newPlayerCount = participants.length;

  if (newPlayerCount === 0) {
    // Delete the room and Discord channel if everyone left
    if (room.discordChannelId) {
      await deleteVoiceChannel(room.discordChannelId);
    }
    roomStore.deleteRoom(id as string);
    return res.status(200).json({ deleted: true });
  }

  const updatedRoom = roomStore.updateRoom(id as string, {
    currentPlayers: newPlayerCount,
    participants,
    hostId: participants[0].id, // New host is the first remaining participant
    hostName: participants[0].name,
  });

  return res.status(200).json(updatedRoom);
}
