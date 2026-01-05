'use client';

import { Room } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface RoomCardProps {
  room: Room;
  currentUserId?: string;
  onJoin: (roomId: string) => void;
  onLeave: (roomId: string) => void;
  onClose: (roomId: string) => void;
  isLoggedIn: boolean;
}

const modeColors = {
  'open': 'bg-splatoon-green',
  'salmon-run': 'bg-splatoon-orange',
  'event': 'bg-splatoon-purple',
  'fest': 'bg-splatoon-blue',
};

const modeLabels = {
  'open': 'オープン',
  'salmon-run': 'サーモンラン',
  'event': 'イベント',
  'fest': 'フェス',
};

export function RoomCard({ room, currentUserId, onJoin, onLeave, onClose, isLoggedIn }: RoomCardProps) {
  const isParticipant = currentUserId && room.participants.some(p => p.id === currentUserId);
  const isHost = currentUserId && room.hostId === currentUserId;
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-white truncate flex-1">{room.title}</h3>
        <span className={`${modeColors[room.mode]} text-white text-xs px-2 py-1 rounded ml-2`}>
          {modeLabels[room.mode]}
        </span>
      </div>

      <div className="text-sm text-gray-400 mb-3">
        <p>ホスト: {room.hostName}</p>
        <p>
          参加者: {room.currentPlayers}/{room.maxPlayers}
        </p>
        <p>
          作成: {formatDistanceToNow(new Date(room.createdAt), { addSuffix: true })}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {room.participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-1 bg-gray-700 rounded px-2 py-1 text-xs"
            title={participant.name}
          >
            {participant.avatar && (
              <img
                src={participant.avatar}
                alt={participant.name}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span className="truncate max-w-[100px]">{participant.name}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {!isLoggedIn ? (
          <div className="flex-1 bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded text-center">
            ログインして参加
          </div>
        ) : isHost ? (
          <button
            onClick={() => onClose(room.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition"
          >
            募集を終了
          </button>
        ) : isParticipant ? (
          <button
            onClick={() => onLeave(room.id)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
          >
            退出する
          </button>
        ) : (
          <button
            onClick={() => onJoin(room.id)}
            disabled={isFull}
            className={`flex-1 font-bold py-2 px-4 rounded transition ${
              isFull
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-splatoon-pink hover:bg-pink-600 text-white'
            }`}
          >
            {isFull ? '満員' : 'VCに参加'}
          </button>
        )}

        {isParticipant && room.discordInviteUrl && (
          <button
            onClick={() => window.open(room.discordInviteUrl, '_blank')}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded transition"
          >
            Discord
          </button>
        )}
      </div>
    </div>
  );
}
