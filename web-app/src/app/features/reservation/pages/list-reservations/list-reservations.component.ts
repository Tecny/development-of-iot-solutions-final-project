import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ReservationService} from '../../services/reservation.service';
import {Reservation} from '../../models/reservation.interface';
import {ReservationCardComponent} from '../../components/reservation-card/reservation-card.component';
import {RoomService} from '../../../room/services/room.service';
import {Room} from '../../../room/models/room.interface';
import {RoomCardComponent} from '../../../room/components/room-card/room-card.component';

@Component({
  selector: 'app-list-reservations',
  imports: [
    ReservationCardComponent,
    RoomCardComponent
  ],
  templateUrl: './list-reservations.component.html',
  styleUrl: './list-reservations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);

  viewReservationSelected = signal<'PERSONAL' | 'COMMUNITY-OWN' | 'COMMUNITY-JOIN'>('PERSONAL');
  communityViewSelected = signal<'OWN' | 'JOIN'>('OWN');

  reservations = signal<Reservation[] | null>(null);
  ownRooms = signal<Room[] | null>(null);
  joinedRooms = signal<Room[] | null>(null);

  ngOnInit() {
    this.loadReservations();
    this.loadOwnRooms();
    this.loadJoinedRooms();
  }

  loadReservations() {
    this.reservationService.myReservations().subscribe({
      next: (reservations) => this.reservations.set(reservations),
      error: (err) => {
        if (err.status === 404) {
          this.reservations.set([]);
        }
        console.error('Error loading user reservations', err);
      }
    });
  }

  loadOwnRooms() {
    this.roomService.getMyRooms().subscribe({
      next: (rooms) => this.ownRooms.set(rooms),
      error: (err) => {
        if (err.status === 404) {
          this.ownRooms.set([]);
        }
        console.error('Error loading owned rooms', err);
      }
    });
  }

  loadJoinedRooms() {
    this.roomService.getRoomsJoined().subscribe({
      next: (rooms) => this.joinedRooms.set(rooms),
      error: (err) => {
        if (err.status === 404) {
          this.joinedRooms.set([]);
        }
        console.error('Error loading joined rooms', err);
      }
    });
  }

  selectCommunityView(type: 'OWN' | 'JOIN') {
    this.communityViewSelected.set(type);
    this.viewReservationSelected.set(
      type === 'OWN' ? 'COMMUNITY-OWN' : 'COMMUNITY-JOIN'
    );
  }
}
