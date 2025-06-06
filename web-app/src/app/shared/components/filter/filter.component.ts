import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FilterConfig} from '../../models/filter-config.interface';
import {FormsModule} from '@angular/forms';
import {GAMEMODE_OPTIONS, getSportIdByValue} from '../../models/sport-space.constants';

@Component({
  selector: 'app-filter',
  imports: [
    FormsModule
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiltersComponent {
  @Input() config: FilterConfig[] = [];
  @Output() filtersChanged = new EventEmitter<Record<string, any>>();

  filters: Record<string, any> = {};

  emitChanges() {
    this.filtersChanged.emit(this.filters);
  }

  clearFilters() {
    this.filters = {};
    this.emitChanges();
  }

  timeOptions: string[] = Array.from({ length: 16 }, (_, i) => {
    const hour = (i + 8).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  onSelectChange(field: string, value: any) {
    this.filters[field] = value;

    if (field === 'sport') {
      this.filters['gamemode'] = null;

      const sportId = getSportIdByValue(value);
      const gameModeConfig = this.config.find(c => c.field === 'gamemode');
      if (gameModeConfig) {
        gameModeConfig.options = [
          { label: 'Seleccionar...', value: null, disabled: true },
          ...GAMEMODE_OPTIONS
            .filter(g => g.sportId === sportId)
            .map(g => ({ label: g.label, value: g.value }))
        ];
      }

    }

    this.emitChanges();
  }

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }


  protected readonly Object = Object;
}
