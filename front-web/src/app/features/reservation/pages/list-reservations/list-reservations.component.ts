import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ReservationService} from '../../services/reservation.service';
import {Reservation} from '../../models/reservation.interface';
import {ReservationCardComponent} from '../../components/reservation-card/reservation-card.component';

@Component({
  selector: 'app-list-reservations',
  imports: [
    ReservationCardComponent
  ],
  templateUrl: './list-reservations.component.html',
  styleUrl: './list-reservations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);

  reservations = signal<Reservation[] | null>(null);

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.myReservations().subscribe({
      next: (reservations) => {
        console.log(reservations);
        this.reservations.set(reservations);
      },
      error: () => {
        console.error('Error loading user\'s reservations');
      }
    });
  }
}
