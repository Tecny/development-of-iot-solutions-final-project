import {inject, Injectable} from '@angular/core';
import {Room} from '../models/room.interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getAllRooms() {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms/all`);
  }
}
