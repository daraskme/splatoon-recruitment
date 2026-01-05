import type { NextApiRequest, NextApiResponse } from 'next';
import { roomStore } from '@/lib/store';
import { checkVoiceChannelEmpty, deleteVoiceChannel } from '@/lib/discord';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel Cron Jobからのリクエストのみ許可
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const rooms = roomStore.getAllRooms();
    let deletedCount = 0;
    const now = Date.now();
    const EMPTY_ROOM_TIMEOUT = 5 * 60 * 1000; // 5分

    for (const room of rooms) {
      // Discord VCが空かチェック
      let shouldDelete = false;

      if (room.discordChannelId) {
        const isEmpty = await checkVoiceChannelEmpty(room.discordChannelId);

        if (isEmpty && room.currentPlayers === 0) {
          // 5分以上経過している場合のみ削除
          const emptyDuration = now - room.createdAt;
          if (emptyDuration > EMPTY_ROOM_TIMEOUT) {
            shouldDelete = true;
          }
        }
      } else if (room.currentPlayers === 0) {
        // Discord VCがない場合は即座に削除
        shouldDelete = true;
      }

      if (shouldDelete && room.discordChannelId) {
        await deleteVoiceChannel(room.discordChannelId);
        roomStore.deleteRoom(room.id);
        deletedCount++;
        console.log(`Deleted empty room: ${room.id} (${room.title})`);
      }
    }

    // ストアの自動クリーンアップも実行
    roomStore.cleanupEmptyRooms();

    return res.status(200).json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron cleanup failed:', error);
    return res.status(500).json({ error: 'Cleanup failed' });
  }
}
