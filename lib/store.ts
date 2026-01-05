import { Room } from '@/types';

// In-memory store for development
// For production, this should be replaced with Vercel KV or another persistent store
class RoomStore {
  private rooms: Map<string, Room> = new Map();

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
      .filter(room => room.status !== 'finished')
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  createRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  updateRoom(id: string, updates: Partial<Room>): Room | undefined {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  deleteRoom(id: string): boolean {
    return this.rooms.delete(id);
  }

  cleanupEmptyRooms(): void {
    const now = Date.now();
    const EMPTY_ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes

    for (const [id, room] of this.rooms.entries()) {
      if (room.currentPlayers === 0) {
        const emptyDuration = now - room.createdAt;
        if (emptyDuration > EMPTY_ROOM_TIMEOUT) {
          this.rooms.delete(id);
        }
      }
    }
  }
}

export const roomStore = new RoomStore();

// Run cleanup every minute
if (typeof window === 'undefined') {
  setInterval(() => {
    roomStore.cleanupEmptyRooms();
  }, 60 * 1000);
}
