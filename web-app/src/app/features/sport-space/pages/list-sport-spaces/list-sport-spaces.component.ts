import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {SportSpaceCardComponent} from '../../components/sport-space-card/sport-space-card.component';
import {SportSpaceService} from '../../services/sport-space.service';
import {SportSpace} from '../../models/sport-space.interface';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {UserRole} from '../../../../core/models/user.role.enum';
import {RouterLink} from '@angular/router';
import {FiltersComponent} from '../../../../shared/components/filter/filter.component';
import {
  districtIdToLabelMap,
  DISTRICTS,
  sportIdToLabelMap,
  SPORTS
} from '../../../../shared/models/sport-space.constants';

@Component({
  selector: 'app-list-sport-spaces',
  imports: [
    SportSpaceCardComponent,
    RouterLink,
    FiltersComponent
  ],
  templateUrl: './list-sport-spaces.component.html',
  styleUrl: './list-sport-spaces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSportSpacesComponent implements OnInit {
  private userStoreService = inject(UserStoreService);
  private sportSpaceService = inject(SportSpaceService);

  userRole = this.userStoreService.getRoleFromToken();

  allSpaces: SportSpace[] = [];
  sportSpaces = signal<SportSpace[] | null>(null);
  showAddSportSpaceButton = false;

  filters = {
    sport: null,
    district: null,
    price: null,
    openTime: null,
    closeTime: null,
  };

  ngOnInit() {
    this.loadSportSpaces();
  }

  loadSportSpaces() {
    const request$ = this.userRole === UserRole.OWNER
      ? this.sportSpaceService.getMySportSpaces()
      : this.sportSpaceService.getSportSpaces();

    request$.subscribe({
      next: (spaces) => {
        this.allSpaces = spaces;
        this.applyFilters();

        if (this.userRole === UserRole.OWNER) {
          this.canAddSportSpace();
        } else {
          this.showAddSportSpaceButton = false;
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.allSpaces = [];
          this.sportSpaces.set([]);
        } else {
          console.error('Error loading sport spaces');
        }

        if (this.userRole === UserRole.OWNER) {
          this.canAddSportSpace();
        } else {
          this.showAddSportSpaceButton = false;
        }
      }
    });
  }

  canAddSportSpace(): void {
    this.sportSpaceService.canAddSportSpace().subscribe({
      next: (allow) => {
        this.showAddSportSpaceButton = allow.canAdd;
      },
      error: () => {
        console.error('Error checking if user can add sport space');
        this.showAddSportSpaceButton = false;
      }
    });
  }

  onFiltersChanged(filters: any) {
    this.filters = filters;
    this.applyFilters();
  }

  applyFilters() {
    const filtered = this.allSpaces.filter(space => {
      const { sport, district, price, openTime, closeTime } = this.filters;

      return (
        (!sport || sportIdToLabelMap[space.sportId] === sport) &&
        (!district || districtIdToLabelMap[space.districtId] === district) &&
        (!price || space.price <= price) &&
        (!openTime || String(space.openTime) <= String(openTime)) &&
        (!closeTime || String(space.closeTime) <= String(closeTime))
      );
    });

    this.sportSpaces.set(filtered);
  }

  protected readonly SPORTS = SPORTS;
  protected readonly DISTRICTS = DISTRICTS;
}
