import {ChangeDetectionStrategy, Component, inject, Input, OnInit, signal} from '@angular/core';
import {RoomService} from '../../services/room.service';
import {PlayerList} from '../../models/player-list.interface';
import {Room} from '../../models/room.interface';

@Component({
  selector: 'app-room-player-list',
  imports: [],
  templateUrl: './room-player-list.component.html',
  styleUrl: './room-player-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomPlayerListComponent implements OnInit {
  @Input() room!: Room;

  private roomService = inject(RoomService);

  players = signal<PlayerList[] | null>(null);

  ngOnInit() {
    this.getPlayerList();
  }

  getPlayerList() {
    this.roomService.getPlayerList(this.room.id).subscribe({
      next: (res) => {
        this.players.set(res);
      },
      error: (err) => {
        console.error('Error fetching players:', err);
      }
    });
  }
}
