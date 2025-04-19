import {inject, Injectable} from '@angular/core';
import {Room} from '../models/room.interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {PlayerList} from '../models/player-list.interface';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getAllRooms() {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms/all`);
  }

  getRoomById(id: number) {
      return this.http.get<Room>(`${this.baseUrl}/rooms/${id}`);
  }

  joinRoom(id: number) {
    return this.http.post(`${this.baseUrl}/player-lists/join/${id}`, {});
  }

  getPlayerList(roomId: number) {
    return this.http.get<PlayerList[]>(`${this.baseUrl}/player-lists/room/${roomId}`);
  }

  belongsToRoom(roomId: number) {
    return this.http.get<{ isMember: boolean }>(`${this.baseUrl}/player-lists/belongs-to-room/${roomId}`);
  }

  getMyRooms() {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms/my-rooms`);
  }

  getRoomsJoined() {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms/my-join-rooms`);
  }
}
