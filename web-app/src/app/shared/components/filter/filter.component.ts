import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {FilterConfig} from '../../models/filter-config.interface';
import {FormsModule} from '@angular/forms';

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

  onTimeChange(field: string) {
    const startTime = this.filters['startTime'];
    const endTime = this.filters['endTime'];

    if (field === 'startTime' && endTime && startTime >= endTime) {
      const [hour] = startTime.split(':').map(Number);
      const nextHour = Math.min(hour + 1, 23);
      this.filters['endTime'] = `${nextHour.toString().padStart(2, '0')}:00`;
    }

    if (field === 'endTime' && startTime && endTime <= startTime) {
      const [hour] = startTime.split(':').map(Number);
      const nextHour = Math.min(hour + 1, 23);
      this.filters['endTime'] = `${nextHour.toString().padStart(2, '0')}:00`;
    }

    this.emitChanges();
  }


  timeOptions: string[] = Array.from({ length: 16 }, (_, i) => {
    const hour = (i + 8).toString().padStart(2, '0');
    return `${hour}:00`;
  });


  protected readonly Object = Object;
}
