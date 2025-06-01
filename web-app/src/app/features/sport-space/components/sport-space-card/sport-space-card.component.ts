import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {SportSpace} from '../../models/sport-space.interface';
import {RouterLink} from '@angular/router';
import {SportSpaceService} from '../../services/sport-space.service';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {sportIdToLabelMap} from '../../../../shared/models/sport-space.constants';
@Component({
  selector: 'app-sport-space-card',
  imports: [
    RouterLink
  ],
  template: `
    <div class="sportspace-card">
      <img
        [src]="imageUrl"
        alt="Imagen de {{ sportSpace.name }}"
        class="sportspace-card__image"
        width="300"
        height="180"
      />

      <div class="sportspace-card__content">
        <h2 class="sportspace-card__title">{{ sportSpace.name }}</h2>
        <p class="sportspace-card__type">{{ sportIdToLabelMap[sportSpace.sportId] }}</p>
        <p class="sportspace-card__address">{{ sportSpace.address }}</p>
        <p class="sportspace-card__price">S/ {{ sportSpace.price }}</p>
      </div>

      <div>
        <button [routerLink]="['/sport-spaces', sportSpace.id]">
          {{ isOwner() ? 'Ver tu espacio deportivo' : 'Conocer más' }}
        </button>
        @if (isOwner()) {
          <button (click)="deleteSportSpace()">Eliminar</button>
        }
      </div>
    </div>
  `,
  styleUrl: './sport-space-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceCardComponent implements OnChanges {
  @Input() sportSpace!: SportSpace;

  private sportSpaceService = inject(SportSpaceService);
  private userStore = inject(UserStoreService);

  imageUrl: string = '';

  currentUser = this.userStore.currentUser;
  isOwner = computed(() => {
    const currentUser = this.currentUser();
    return currentUser && this.sportSpace
      ? currentUser.id === this.sportSpace.user.id
      : false;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sportSpace'] && this.sportSpace?.image) {
      this.imageUrl = this.getImageUrl(this.sportSpace.image);
    }
  }

  getImageUrl(image: string): string {
    if (image.startsWith('data:image/')) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  }

  deleteSportSpace() {
    if (window.confirm('¿Estás seguro de que deseas eliminar este espacio deportivo?')) {
      if (this.sportSpace) {
        this.sportSpaceService.deleteSportSpace(this.sportSpace.id).subscribe({
          next: () => {
            window.location.reload();
          },
          error: (error) => {
          }
        });
      }
    }
  }

  protected readonly sportIdToLabelMap = sportIdToLabelMap;
}
