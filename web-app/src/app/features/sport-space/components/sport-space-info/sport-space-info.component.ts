import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SportSpace} from '../../models/sport-space.interface';
import {
  gamemodeIdToLabelMap,
  sportIdToLabelMap
} from '../../../../shared/models/sport-space.constants';

@Component({
  selector: 'app-sport-space-info',
  imports: [],
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

  protected readonly sportIdToLabelMap = sportIdToLabelMap;
  protected readonly gamemodeIdToLabelMap = gamemodeIdToLabelMap;
}
