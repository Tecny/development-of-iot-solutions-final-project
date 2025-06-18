import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {RoomService} from '../../services/room.service';
import {Room} from '../../models/room.interface';
import {RoomCardComponent} from '../../components/room-card/room-card.component';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {UserRole} from '../../../../core/models/user.role.enum';
import {FiltersComponent} from '../../../../shared/components/filter/filter.component';
import {GAMEMODE_OPTIONS, SPORTS} from '../../../../shared/models/sport-space.constants';
import {PriceUtil, TimeUtil} from '../../../../shared/utils/time.util';
import {SpinnerComponent} from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-list-rooms',
  imports: [
    RoomCardComponent,
    FiltersComponent,
    SpinnerComponent
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
    gamemode: null,
    gameday: null,
    startTime: null,
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
      const { sport, gamemode, gameday, startTime, maxAmount } = this.filters;

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

      const gamemodeId = gamemode
        ? GAMEMODE_OPTIONS.find(g => g.value === gamemode)?.id
        : undefined;

      return (
        (!sport || room.reservation.sportSpace.sportType === sport) &&
        (!gamemodeId || room.reservation.sportSpace.gamemode === gamemode) &&
        (!gameday || room.reservation.gameDay === gameday) &&
        (!startTime || String(room.reservation.startTime) === String(startTime)) &&
        (!maxAmount || roomAmount <= maxAmount)
      );
    });

    this.rooms.set(filtered);
  }

  protected readonly UserRole = UserRole;
  protected readonly SPORTS = SPORTS;
}
