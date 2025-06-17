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
  template: `
    <div class="room-info">
      <h1>Detalles de la sala</h1>

      <h2 class="room-info__title">{{ room.reservation.reservationName }}</h2>

      <div class="room-info__header">
        <img src="{{ room.reservation.sportSpace.imageUrl }}" [alt]="'Imagen de ' + room.reservation.sportSpace.name" class="room-info__image" />
        Espacio deportivo: <a [routerLink]="['/sport-spaces', room.reservation.sportSpace.id]"> {{ room.reservation.sportSpace.name }}</a>
      </div>

      <div class="room-info__content">
        <p> Creado por: {{ room.reservation.userName}}</p>
        <p> Modo de juego: {{ room.reservation.sportSpace.gamemode.replaceAll('_', ' ') | titlecase}}</p>
        <p> Fecha: {{ TimeUtil.formatDate(room.reservation.gameDay) }}, {{ room.reservation.startTime }}-{{ room.reservation.endTime }}</p>
        <p> Lugar: {{ room.reservation.sportSpace.address }}</p>
      </div>
    </div>
  `,
  styleUrl: './room-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomInfoComponent {
  @Input() room!: Room;

  protected readonly TimeUtil = TimeUtil;
}
