'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Room, GameMode } from '@/types';
import { RoomCard } from '@/components/RoomCard';
import { CreateRoomModal } from '@/components/CreateRoomModal';

export default function Home() {
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleCreateRoom = async (title: string, mode: GameMode) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, mode }),
      });

      if (res.ok) {
        await fetchRooms();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });

      if (res.ok) {
        const room = await res.json();
        if (room.discordInviteUrl) {
          window.open(room.discordInviteUrl, '_blank');
        }
        await fetchRooms();
      }
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
      });
      await fetchRooms();
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  const handleCloseRoom = async (roomId: string) => {
    try {
      await fetch(`/api/rooms/${roomId}/close`, {
        method: 'POST',
      });
      await fetchRooms();
    } catch (error) {
      console.error('Failed to close room:', error);
    }
  };

  const filteredRooms = filter === 'all' ? rooms : rooms.filter(r => r.mode === filter);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-gray-800 p-4 rounded-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-splatoon-pink to-splatoon-yellow bg-clip-text text-transparent">
            インクマーレ／スプラトゥーンマルチ募集
          </h1>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('discord')}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 px-4 rounded transition"
              >
                Discord でログイン
              </button>
            )}
          </div>
        </header>

        {/* 使い方ガイド */}
        <div className="mb-6 bg-gradient-to-r from-splatoon-pink/10 to-splatoon-purple/10 border border-splatoon-pink/30 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 text-splatoon-yellow">使い方</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-splatoon-pink text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-bold mb-1">募集に参加する</p>
                <p className="text-gray-300">気になる募集の「VCに参加」ボタンをクリック → Discordが開くのでVCに入る</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-splatoon-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-bold mb-1">募集を作成する</p>
                <p className="text-gray-300">「+ 新規募集作成」ボタンでタイトルとモードを選択して作成</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-splatoon-blue text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-bold mb-1">自動で片付く</p>
                <p className="text-gray-300">全員がVCから抜けると5分後に自動的に募集が削除されます</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          {isLoggedIn && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-splatoon-pink hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              + 新規募集作成
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded transition ${
                filter === 'all' ? 'bg-splatoon-yellow text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              全て
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded transition ${
                filter === 'open' ? 'bg-splatoon-green text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              オープン
            </button>
            <button
              onClick={() => setFilter('salmon-run')}
              className={`px-4 py-2 rounded transition ${
                filter === 'salmon-run' ? 'bg-splatoon-orange text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              サーモンラン
            </button>
            <button
              onClick={() => setFilter('event')}
              className={`px-4 py-2 rounded transition ${
                filter === 'event' ? 'bg-splatoon-purple text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              イベント
            </button>
            <button
              onClick={() => setFilter('fest')}
              className={`px-4 py-2 rounded transition ${
                filter === 'fest' ? 'bg-splatoon-blue text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              フェス
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currentUserId={session?.user?.id}
              onJoin={handleJoinRoom}
              onLeave={handleLeaveRoom}
              onClose={handleCloseRoom}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">募集がありません</p>
            {isLoggedIn && <p className="mt-2">新しい募集を作成してみましょう!</p>}
            {!isLoggedIn && <p className="mt-2">ログインして募集を作成できます</p>}
          </div>
        )}
      </div>

      {isLoggedIn && (
        <CreateRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
}
