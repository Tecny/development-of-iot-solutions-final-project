import {ChangeDetectionStrategy, Component, inject, Input, OnInit, signal} from '@angular/core';
import {Room} from '../../models/room.interface';
import {TitleCasePipe} from '@angular/common';
import {TimeUtil} from '../../../../shared/utils/time.util';
import {RoomService} from '../../services/room.service';
import {Router, RouterLink} from '@angular/router';
import {ReservationService} from '../../../reservation/services/reservation.service';

@Component({
  selector: 'app-room-card',
  imports: [
    TitleCasePipe,
    RouterLink
  ],
  template: `
    <div class="room-card">
      <div class="room-card__header">
        <span class="room-card__header__title">{{ room.reservation.reservationName }}</span>
        <span class="room-card__header__players">{{ room.playerCount }}</span>
      </div>

      <small class="room-card__creator">Creado por: {{ room.reservation.userName | titlecase }}</small>

      <div class="room-card__details">
        <p>Modo de juego: {{ room.reservation.sportSpace.gamemode.replaceAll('_', ' ') | titlecase }}</p>
        <p>Fecha: {{ TimeUtil.formatDate(room.reservation.gameDay) }}, {{ room.reservation.startTime }}
          -{{ room.reservation.endTime }}</p>
        <p>Lugar: {{ room.reservation.sportSpace.address }}
          , {{ room.reservation.sportSpace.district.replaceAll('_', ' ') }}</p>
        Espacio deportivo: <a
        [routerLink]="['/sport-spaces', room.reservation.sportSpace.id]"> {{ room.reservation.sportSpace.name }}</a>
      </div>

      <div class="room-card__actions">
        <div>
          @defer (on timer(200ms)) {
            @if (isMember()) {
              <button class="room-card__view" (click)="viewRoom()">Ver sala</button>
              @if (isRoomCreator()) {
                <button class="room-card__delete" (click)="deleteRoom()">Borrar sala</button>
              }
            } @else {
              <button class="room-card__join" (click)="joinRoom()">Unirse</button>
              <div class="room-card__credits">({{ getAmount() }} créditos)</div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './room-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomCardComponent implements OnInit {
  @Input() room!: Room;

  protected readonly TimeUtil = TimeUtil;

  private router = inject(Router);
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);

  isMember = signal<boolean | null>(null);
  isRoomCreator = signal<boolean | null>(null);

  ngOnInit(): void {
    if (this.room?.id) {
      this.roomService.userRoomStatus(this.room.id).subscribe({
        next: (res) => {
          this.isMember.set(res.isMember);
          this.isRoomCreator.set(res.isRoomCreator);
        },
        error: (err) => {
          console.error('Error checking user status in the room:', err);
          this.isMember.set(false);
          this.isRoomCreator.set(false);
        }
      });
    }
  }

  getAmount(): number {
    const hours = TimeUtil.getHoursDifference(this.room.reservation.startTime, this.room.reservation.endTime);
    return TimeUtil.calculatePrice(
      'COMMUNITY',
      this.room.reservation.sportSpace.price,
      this.room.reservation.sportSpace.amount,
      hours
    );
  }

  viewRoom() {
    this.roomService.allowAccess(this.room.id);
    this.router.navigate(['/rooms', this.room.id]).then();
  }

  joinRoom() {
    if(window.confirm('¿Estás seguro de que deseas unirte a esta sala?')) {
      this.roomService.joinRoom(this.room.id).subscribe({
        next: () => {
          this.roomService.allowAccess(this.room.id);
          this.router.navigate(['/rooms', this.room.id]).then();
        },
        error: (error) => {
          console.error('Error joining room:', error);
        }
      });
    }
  }

  deleteRoom() {
    if (window.confirm('¿Estás seguro de que deseas borrar esta sala?')) {
      this.reservationService.deleteReservation(this.room.reservation.id).subscribe({
        next: () => {
          console.log('Room deleted successfully');
          window.location.reload();
        },
        error: (error) => {
          console.error('Error deleting room:', error);
        }
      });
    }
  }
}
