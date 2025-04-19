import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {SportSpaceCardComponent} from '../../components/sport-space-card/sport-space-card.component';
import {SportSpaceService} from '../../services/sport-space.service';
import {SportSpace} from '../../models/sport-space.interface';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {UserRole} from '../../../../core/models/user.role.enum';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-list-sport-spaces',
  imports: [
    SportSpaceCardComponent
  ],
  templateUrl: './list-sport-spaces.component.html',
  styleUrl: './list-sport-spaces.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSportSpacesComponent implements OnInit {
  private userStoreService = inject(UserStoreService);
  private sportSpaceService = inject(SportSpaceService);

  sportSpaces = signal<SportSpace[] | null>(null);
  userRole = this.userStoreService.getRoleFromToken();
  showAddSportSpaceButton = false;

  ngOnInit() {
    this.loadSportSpaces();
  }

  loadSportSpaces() {
    if (this.userRole === UserRole.OWNER) {
      this.canAddSportSpace();
      this.sportSpaceService.getMySportSpaces().subscribe({
        next: (spaces) => {
          console.log(spaces);
          this.sportSpaces.set(spaces);
        },
        error: (err) => {
          if (err.status === 404) {
            this.sportSpaces.set([]);
          } else {
            console.error('Error loading user\'s sport spaces');
          }
        }
      });
    } else {
      this.showAddSportSpaceButton = false;
      this.sportSpaceService.getSportSpaces().subscribe({
        next: (spaces) => {
          this.sportSpaces.set(spaces);
        },
        error: () => {
          console.error('Error loading all sport spaces');
        }
      });
    }
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
}
