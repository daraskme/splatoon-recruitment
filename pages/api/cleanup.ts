import type { NextApiRequest, NextApiResponse } from 'next';
import { roomStore } from '@/lib/store';
import { checkVoiceChannelEmpty, deleteVoiceChannel } from '@/lib/discord';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rooms = roomStore.getAllRooms();
    let deletedCount = 0;

    for (const room of rooms) {
      if (room.discordChannelId) {
        const isEmpty = await checkVoiceChannelEmpty(room.discordChannelId);

        if (isEmpty && room.currentPlayers === 0) {
          await deleteVoiceChannel(room.discordChannelId);
          roomStore.deleteRoom(room.id);
          deletedCount++;
        }
      }
    }

    return res.status(200).json({ deletedCount });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return res.status(500).json({ error: 'Cleanup failed' });
  }
}
