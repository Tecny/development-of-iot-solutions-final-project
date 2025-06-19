import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ReservationService} from '../../services/reservation.service';
import {Reservation} from '../../models/reservation.interface';
import {ReservationCardComponent} from '../../components/reservation-card/reservation-card.component';
import {RoomService} from '../../../room/services/room.service';
import {Room} from '../../../room/models/room.interface';
import {RoomCardComponent} from '../../../room/components/room-card/room-card.component';
import {SpinnerComponent} from '../../../../shared/components/spinner/spinner.component';
import {UserStoreService} from '../../../../core/services/user-store.service';

@Component({
  selector: 'app-list-reservations',
  imports: [
    ReservationCardComponent,
    RoomCardComponent,
    SpinnerComponent
  ],
  templateUrl: './list-reservations.component.html',
  styleUrl: './list-reservations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);
  private userStore = inject(UserStoreService);

  currentUser = this.userStore.currentUser;

  activeTab = signal<'personal' | 'community'>('personal');
  activeSubTab = signal<'own' | 'join'>('own');

  reservations = signal<Reservation[] | null>(null);
  ownRooms = signal<Room[] | null>(null);
  joinedRooms = signal<Room[] | null>(null);
  ownerRooms = signal<Room[] | null>(null);

  ngOnInit() {
    this.loadReservations();
    if (this.currentUser()?.roleType === 'PLAYER') {
      this.loadOwnRooms();
      this.loadJoinedRooms();
    } else {
      this.loadOwnerRooms();
    }
  }

  loadReservations() {
    this.reservationService.myReservations().subscribe({
      next: (reservations) => this.reservations.set(reservations),
      error: (err) => {
        if (err.status === 404) {
          this.reservations.set([]);
        }
      }
    });
  }

  loadOwnerRooms() {
    this.roomService.getRoomsBySportspaces().subscribe({
      next: (rooms) => this.ownerRooms.set(rooms),
      error: (err) => {
        if (err.status === 404) {
          this.ownerRooms.set([]);
        }
      }
    })
  }

  loadOwnRooms() {
    this.roomService.getMyRooms().subscribe({
      next: (rooms) => this.ownRooms.set(rooms),
      error: (err) => {
        if (err.status === 404) {
          this.ownRooms.set([]);
        }
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
      }
    });
  }

  setTab(tab: 'personal' | 'community') {
    this.activeTab.set(tab);
  }

  setSubTab(subTab: 'own' | 'join') {
    this.activeSubTab.set(subTab);
  }
}
