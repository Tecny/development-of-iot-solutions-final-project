import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Reservation} from '../../models/reservation.interface';
import {TitleCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {PriceUtil, TimeUtil} from '../../../../shared/utils/time.util';
import {QrViewerComponent} from "../../../../shared/components/qr-viewer/qr-viewer.component";

@Component({
  selector: 'app-reservation-card',
  imports: [
    TitleCasePipe,
    RouterLink,
    QrViewerComponent
  ],
  template: `
    <div class="reservation-card">
      <img
        src="{{ reservation.sportSpaces.imageUrl }}"
        alt="Imagen de {{ reservation.sportSpaces.name }}"
        class="reservation-card__image"
        width="300"
        height="180"
      />

      <div class="reservation-card__content">
        <h2 class="reservation-card__title">{{ reservation.name }}</h2>
        <p class="reservation-card__sport">{{ reservation.sportSpaces.sport| titlecase }}</p>
        <p class="reservation-card__gamemode">{{ reservation.sportSpaces.gamemode.replaceAll('_',' ') | titlecase }}</p>
        <p class="reservation-card__sportspace">Espacio deportivo: {{ reservation.sportSpaces.name}}</p>
        <p class="reservation-card__price"> Precio de la reserva: {{ getPrice() }} créditos</p>
        <p class="reservation-card__type">Tipo: {{ reservation.type | titlecase }}</p>
        <p class="reservation-card__date">Fecha: {{ reservation.gameDay }}</p>
        <p class="reservation-card__time">Hora: {{ reservation.startTime }} - {{ reservation.endTime }}</p>
        <p class="reservation-card__status">Estado: {{ reservation.status | titlecase }}</p>
      </div>

      @if (reservation.type === 'COMUNIDAD') {
        <div>
          <button [routerLink]="['/rooms']">Ir a la sala</button>
        </div>
      }
      <button (click)="showQr = true">Ver QR</button>
    </div>

    @if (showQr) {
      <app-qr-viewer [reservationId]="reservation.id" (close)="showQr = false" />
    }
  `,
  styleUrl: './reservation-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationCardComponent {
  @Input() reservation!: Reservation;

  showQr = false;

  getPrice(): number {
    const hours = TimeUtil.getHoursDifference(this.reservation.startTime, this.reservation.endTime);
    return PriceUtil.calculatePrice(
      this.reservation.type,
      this.reservation.sportSpaces.price,
      this.reservation.sportSpaces.amount,
      hours
    );
  }
}
