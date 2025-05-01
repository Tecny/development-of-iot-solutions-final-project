import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RoomService} from '../../services/room.service';
import {Room} from '../../models/room.interface';
import {RoomCardComponent} from '../../components/room-card/room-card.component';

@Component({
  selector: 'app-list-rooms',
  imports: [
    RoomCardComponent
  ],
  templateUrl: './list-rooms.component.html',
  styleUrl: './list-rooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListRoomsComponent implements OnInit {
  private roomService = inject(RoomService);

  rooms = signal<Room[] | null>(null);

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        console.log(rooms);
        this.rooms.set(rooms);
      },
      error: () => {
        console.error('Error loading rooms');
      }
    });
  }
}
