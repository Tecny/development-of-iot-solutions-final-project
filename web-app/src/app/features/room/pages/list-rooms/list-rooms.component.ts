import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RoomService} from '../../services/room.service';
import {Room} from '../../models/room.interface';
import {RoomCardComponent} from '../../components/room-card/room-card.component';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {UserRole} from '../../../../core/models/user.role.enum';
import {FiltersComponent} from '../../../../shared/components/filter/filter.component';
import {DISTRICTS, SPORTS} from '../../../../shared/models/sport-space.constants';
import {PriceUtil, TimeUtil} from '../../../../shared/utils/time.util';

@Component({
  selector: 'app-list-rooms',
  imports: [
    RoomCardComponent,
    FiltersComponent
  ],
  templateUrl: './list-rooms.component.html',
  styleUrl: './list-rooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListRoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private userStore = inject(UserStoreService);

  userRole = this.userStore.getRoleFromToken();

  allRooms: Room[] = [];
  rooms = signal<Room[] | null>(null);

  filters = {
    sport: null,
    district: null,
    gameday: null,
    startTime: null,
    endTime: null,
    maxAmount: null,
  };

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    const request$ = this.userRole === UserRole.OWNER
      ? this.roomService.getRoomsBySportspaces()
      : this.roomService.getAllRooms();

    request$.subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.applyFilters();
      },
      error: (err) => {
        if (err.status === 404) {
          this.allRooms = [];
          this.rooms.set([]);
        } else {
          console.error('Error loading rooms');
        }
      }
    });
  }

  onFiltersChanged(filters: any) {
    this.filters = filters;
    this.applyFilters();
  }

  applyFilters() {
    const filtered = this.allRooms.filter(room => {
      const { sport, district, gameday, startTime, endTime, maxAmount } = this.filters;

      let hours = 0;
      let roomAmount = 0;

      if (room.reservation.startTime && room.reservation.endTime) {
        hours = TimeUtil.getHoursDifference(room.reservation.startTime, room.reservation.endTime);
        roomAmount = PriceUtil.calculatePrice(
          'COMMUNITY',
          room.reservation.sportSpace.price,
          room.reservation.sportSpace.amount,
          hours
        );
      }

      return (
        (!sport || room.reservation.sportSpace.sportType === sport) &&
        (!district || room.reservation.sportSpace.district === district) &&
        (!gameday || room.reservation.gameDay === gameday) &&
        (!startTime || String(room.reservation.startTime) >= String(startTime)) &&
        (!endTime || String(room.reservation.endTime) <= String(endTime)) &&
        (!maxAmount || roomAmount <= maxAmount)
      );
    });

    this.rooms.set(filtered);
  }

  protected readonly UserRole = UserRole;
  protected readonly SPORTS = SPORTS;
  protected readonly DISTRICTS = DISTRICTS;
}
