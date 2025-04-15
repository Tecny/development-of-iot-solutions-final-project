import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {SportSpaceService} from '../../services/sport-space.service';
import {NgClass} from '@angular/common';
import {SportSpace} from '../../models/sport-space.model';

@Component({
  selector: 'app-sport-space-availability',
  imports: [
    NgClass
  ],
  templateUrl: './sport-space-availability.component.html',
  styleUrl: './sport-space-availability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceAvailabilityComponent implements OnInit {
  @Input() sportSpace!: SportSpace;

  // Para emitir selección al componente padre si se desea
  @Output() slotSelected = new EventEmitter<{ gameDay: string, startTime: string, endTime: string }>();

  sportSpaceService = inject(SportSpaceService);

  availabilityMap: Record<string, string[]> = {};
  timeSlots: string[] = [];
  weekDays: string[] = [];
  selectedSlots: { gameDay: string; startTime: string; endTime: string }[] = [];

  ngOnInit(): void {
    this.generateTimeSlots();
    this.fetchAvailability();
  }

  generateTimeSlots() {
    const start = parseInt(this.sportSpace.openTime.split(':')[0], 10);
    const end = parseInt(this.sportSpace.closeTime.split(':')[0], 10);
    this.timeSlots = Array.from({ length: end - start }, (_, i) => {
      const hour = start + i;
      return `${hour.toString().padStart(2, '0')}:00`;
    });
  }

  fetchAvailability() {
    this.sportSpaceService.checkAvailability(this.sportSpace.id).subscribe((res: any) => {
      this.availabilityMap = res.weeklyAvailability;
      this.weekDays = Object.keys(res.weeklyAvailability).sort();
    });
  }

  isAvailable(date: string, hour: string): boolean {
    return this.availabilityMap[date]?.includes(hour) ?? false;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const formatter = new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      timeZone: 'America/Lima'
    });

    const parts = formatter.formatToParts(date);
    const weekday = parts.find(p => p.type === 'weekday')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;

    return `${this.capitalize(weekday!)} ${day}/${month}`;
  }

  capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  onSlotClick(gameDay: string, time: string): void {
    if (!this.isAvailable(gameDay, time)) return;

    // Verificar si el bloque ya está seleccionado
    const selectedIndex = this.selectedSlots.findIndex(slot => slot.gameDay === gameDay && slot.startTime === time);

    if (selectedIndex === -1) {
      // Si no está seleccionado, agregarlo
      if (this.selectedSlots.length === 0) {
        this.selectedSlots.push({ gameDay, startTime: time, endTime: time });
      } else {
        const lastSelected = this.selectedSlots[this.selectedSlots.length - 1];
        const lastEndTime = lastSelected.endTime;
        const selectedTimeIndex = this.timeSlots.indexOf(time);
        const lastEndTimeIndex = this.timeSlots.indexOf(lastEndTime);

        // Si el nuevo bloque está justo después del último bloque seleccionado, agregarlo
        if (selectedTimeIndex === lastEndTimeIndex + 1) {
          this.selectedSlots.push({ gameDay, startTime: lastEndTime, endTime: time });
        }
      }
    } else {
      // Si está seleccionado, deseleccionarlo
      this.selectedSlots.splice(selectedIndex, 1);
    }

    console.log(`Selected Slots:`, this.selectedSlots);
    this.emitReservationData();
  }


  emitReservationData(): void {
    if (this.selectedSlots.length > 0) {
      const { gameDay, startTime, endTime } = this.selectedSlots[0]; // Solo tomamos el primer intervalo
      const reservationData = {
        gameDay: gameDay,
        startTime: startTime,
        endTime: endTime,
        //sportSpacesId: this.sportSpace.id,
        //type: 'personal', // Por ahora, solo tipo personal
        //reservationName: 'Reserva personal' // Puedes cambiar este campo si lo necesitas
      };

      this.slotSelected.emit(reservationData); // Emitir al componente padre
    }
  }

  isSelected(date: string, time: string): boolean {
    return this.selectedSlots.some(slot => slot.gameDay === date && slot.startTime === time);
  }
}
