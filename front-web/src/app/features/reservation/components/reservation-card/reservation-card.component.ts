import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Reservation} from '../../models/reservation.model';
import {TitleCasePipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-reservation-card',
  imports: [
    TitleCasePipe,
    RouterLink
  ],
  template: `
    <div class="reservation-card">
      <img
        [src]="imageUrl"
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
        <p class="reservation-card__price"> Precio: {{ getPrice() }} créditos</p>
        <p class="reservation-card__type">Tipo: {{ reservation.type | titlecase }}</p>
        <p class="reservation-card__date">Fecha: {{ reservation.gameDay }}</p>
        <p class="reservation-card__time">Hora: {{ reservation.startTime }} - {{ reservation.endTime }}</p>
        <p class="reservation-card__status">Estado: {{ reservation.status | titlecase }}</p>
      </div>
    </div>

    @if (reservation.type === 'COMUNIDAD') {
      <div>
        <button [routerLink]="['/rooms']">Ir a la sala</button>
      </div>
    }
  `,
  styleUrl: './reservation-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationCardComponent implements OnChanges {
  @Input() reservation!: Reservation;

  imageUrl: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reservation'] && this.reservation.sportSpaces?.image) {
      this.imageUrl = this.getImageUrl(this.reservation.sportSpaces.image);
    }
  }

  getImageUrl(image: string): string {
    if (image.startsWith('data:image/')) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  }

  getHoursDifference(startTime: string, endTime: string): number {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const differenceInMilliseconds = end.getTime() - start.getTime();
    return differenceInMilliseconds / (1000 * 60 * 60);
  }

  getPrice(): number {
    const hours = this.getHoursDifference(this.reservation.startTime, this.reservation.endTime);
    if (this.reservation.type === 'PERSONAL') {
      return (this.reservation.sportSpaces.price * hours) / 2;
    } else {
      return this.reservation.sportSpaces.amount * hours;
    }
  }
}
