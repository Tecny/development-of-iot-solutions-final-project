import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Room} from '../../models/room.interface';
import {TitleCasePipe} from '@angular/common';
import {TimeUtil} from '../../../../shared/utils/time.util';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-room-info',
  imports: [
    TitleCasePipe,
    RouterLink
  ],
  templateUrl: './room-info.component.html',
  styleUrl: './room-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomInfoComponent {
  @Input() room!: Room;

  get imageUrl(): string {
    if (this.room.reservation.sportSpace.image.startsWith('data:image/')) {
      return this.room.reservation.sportSpace.image
    }
    return `data:image/jpeg;base64,${this.room.reservation.sportSpace.image}`;
  }

  protected readonly TimeUtil = TimeUtil;
}
