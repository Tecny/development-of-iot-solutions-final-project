import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SportSpace} from '../../models/sport-space.model';
import {RouterLink} from '@angular/router';
import {TitleCasePipe} from '@angular/common';
@Component({
  selector: 'app-sport-space-card',
  imports: [
    RouterLink,
    TitleCasePipe
  ],
  template: `
    <div class="card">
      <img
        [src]="imageUrl"
        alt="Imagen de {{ sportSpace.name }}"
        class="card__image"
        width="300"
        height="180"
      />

      <div class="card__content">
        <h2 class="card__title">{{ sportSpace.name }}</h2>
        <p class="card__type">{{ sportSpace.sportType | titlecase}}</p>
        <p class="card__district">{{ sportSpace.district.replaceAll('_',' ') }}</p>
        <p class="card__price">S/ {{ sportSpace.price }}</p>
      </div>

      <div>
        <button [routerLink]="['/sport-spaces', sportSpace.id]">Conocer más</button>
      </div>
    </div>
  `,
  styleUrl: './sport-space-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceCardComponent implements OnChanges {
  @Input() sportSpace!: SportSpace;

  imageUrl: string = '';

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
}
