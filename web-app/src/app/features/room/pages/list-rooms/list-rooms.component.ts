import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RoomService} from '../../services/room.service';
import {Room} from '../../models/room.interface';
import {RoomCardComponent} from '../../components/room-card/room-card.component';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {UserRole} from '../../../../core/models/user.role.enum';

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
  private userStore = inject(UserStoreService);

  userRole = this.userStore.getRoleFromToken();

  rooms = signal<Room[] | null>(null);

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    if (this.userRole === UserRole.OWNER) {
      this.roomService.getRoomsBySportspaces().subscribe({
        next: (rooms) => {
          console.log(rooms);
          this.rooms.set(rooms);
        },
        error: (err) => {
          if (err.status === 404) {
            this.rooms.set([]);
          } else {
            console.error('Error loading user\'s rooms');
          }
        }
      });
    } else {
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

  protected readonly UserRole = UserRole;
}
