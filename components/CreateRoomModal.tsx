'use client';

import { useState } from 'react';
import { GameMode } from '@/types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, mode: GameMode) => void;
}

const modes: { value: GameMode; label: string; color: string }[] = [
  { value: 'open', label: 'オープン', color: 'bg-splatoon-green' },
  { value: 'salmon-run', label: 'サーモンラン', color: 'bg-splatoon-orange' },
  { value: 'event', label: 'イベントマッチ', color: 'bg-splatoon-purple' },
  { value: 'fest', label: 'フェス', color: 'bg-splatoon-blue' },
];

export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<GameMode>('open');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), mode);
      setTitle('');
      setMode('open');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">新規募集作成</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">募集タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: エンジョイ勢集まれ!"
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-splatoon-pink"
              maxLength={50}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">モード</label>
            <div className="grid grid-cols-2 gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`py-3 px-4 rounded font-bold transition ${
                    mode === m.value
                      ? `${m.color} text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-splatoon-pink hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
