import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SportSpace} from '../../models/sport-space.model';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-sport-space-info',
  imports: [
    TitleCasePipe
  ],
  templateUrl: './sport-space-info.component.html',
  styleUrl: './sport-space-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceInfoComponent {
  @Input() sportSpace!: SportSpace;

  get imageUrl(): string {
    if (this.sportSpace.image.startsWith('data:image/')) {
      return this.sportSpace.image;
    }
    return `data:image/jpeg;base64,${this.sportSpace.image}`;
  }
}
