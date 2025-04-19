import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {RoomService} from '../../services/room.service';
import {Room} from '../../models/room.interface';
import {RoomInfoComponent} from '../../components/room-info/room-info.component';
import {RoomChatComponent} from '../../components/room-chat/room-chat.component';
import {RoomPlayerListComponent} from '../../components/room-player-list/room-player-list.component';

@Component({
  selector: 'app-room-detail',
  imports: [
    RoomInfoComponent,
    RoomChatComponent,
    RoomPlayerListComponent
  ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomService = inject(RoomService);

  room = signal<Room | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.roomService.getRoomById(id).subscribe({
      next: (room) => {
        this.room.set(room);
      },
      error: () => {
        console.error('Error loading sport space');
      }
    });
  }
}
