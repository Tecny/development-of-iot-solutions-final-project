import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Room} from '../../models/room.interface';
import {TitleCasePipe} from '@angular/common';
import {TimeUtil} from '../../../../shared/utils/time.util';

@Component({
  selector: 'app-room-card',
  imports: [
    TitleCasePipe
  ],
  template: `
    <div class="room-card">
      <div class="room-card__header">
        <span class="room-card__header__title">{{ room.reservation.reservationName }}</span>
        <span class="room-card__header__players">{{ room.playerCount }}</span>
      </div>

      <small class="room-card__creator">Creado por: {{ room.reservation.userName }}</small>

      <div class="room-card__details">
        <p>Modo de juego: {{ room.reservation.sportSpaces.gamemode.replaceAll('_', ' ') | titlecase }}</p>
        <p>Fecha: {{ TimeUtil.formatDate(room.reservation.gameDay) }}, {{ room.reservation.startTime }}-{{ room.reservation.endTime }}</p>
        <p>Lugar: {{ room.reservation.sportSpaces.address }}, {{ room.reservation.sportSpaces.district.replaceAll('_', ' ') }}</p>
        <p>Espacio deportivo: {{ room.reservation.sportSpaces.name }}</p>
      </div>

      <div class="room-card__actions">
        <div>
          <button class="room-card__join">UNIRSE</button>
          <div class="room-card__credits">({{ getAmount() }} créditos)</div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './room-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomCardComponent {
  @Input() room!: Room;

  getAmount(): number {
    const hours = TimeUtil.getHoursDifference(this.room.reservation.startTime, this.room.reservation.endTime);
    return TimeUtil.calculatePrice(
      'COMMUNITY',
      this.room.reservation.sportSpaces.price,
      this.room.reservation.sportSpaces.amount,
      hours
    );
  }


  protected readonly TimeUtil = TimeUtil;
}
