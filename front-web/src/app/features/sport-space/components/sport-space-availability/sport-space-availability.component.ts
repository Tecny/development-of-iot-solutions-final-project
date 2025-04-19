import {ChangeDetectionStrategy, Component, computed, inject, Input, OnInit, signal} from '@angular/core';
import {SportSpaceService} from '../../services/sport-space.service';
import {ReservationService} from '../../../reservation/services/reservation.service';
import {NgClass} from '@angular/common';
import {SportSpace} from '../../models/sport-space.interface';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ModalComponent} from '../../../../shared/components/modal/modal.component';
import {Router} from '@angular/router';
import {gamemodeMaxPlayersMap} from '../../../../shared/models/sport-space.constants';
import {TimeUtil} from '../../../../shared/utils/time.util';

@Component({
  selector: 'app-sport-space-availability',
  imports: [
    NgClass,
    ModalComponent,
    ReactiveFormsModule
  ],
  templateUrl: './sport-space-availability.component.html',
  styleUrl: './sport-space-availability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceAvailabilityComponent implements OnInit {
  @Input() sportSpace!: SportSpace;

  protected readonly TimeUtil = TimeUtil;

  private sportSpaceService = inject(SportSpaceService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);

  availabilityMap: Record<string, string[]> = {};
  timeSlots: string[] = [];
  weekDays: string[] = [];
  gamemodeMaxPlayers = gamemodeMaxPlayersMap;
  selectedGameDay: string = '';
  selectedStartTime: string = '';
  selectedEndTime: string = '';

  reservationType = signal<string>('');
  selectedSlots = signal<{ gameDay: string; startTime: string; endTime: string }[]>([]);

  totalCost = computed(() => {
    const slots = this.selectedSlots();
    if (slots.length === 0) return 0;

    const type = this.reservationType();
    const gamemode = this.sportSpace.gamemode;
    const maxPlayers = this.gamemodeMaxPlayers[gamemode] || 1;

    switch (type) {
      case 'PERSONAL':
        return Math.trunc((this.sportSpace.price * slots.length) / 2);
      case 'COMMUNITY':
        return Math.trunc(((this.sportSpace.price * slots.length) / 2) / maxPlayers);
      default:
        return 0;
    }
  });

  reservationForm!: FormGroup;
  showReservationModal = false;

  ngOnInit(): void {
    this.generateTimeSlots();
    this.fetchAvailability();
    this.initForm();

    this.reservationForm.get('type')?.valueChanges.subscribe((type) => {
      this.reservationType.set(type);
    });
  }

  initForm() {
    this.reservationForm = this.fb.group({
      gameDay: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      sportSpacesId: [this.sportSpace.id, Validators.required],
      type: ['', Validators.required],
      reservationName: ['', [Validators.required, Validators.minLength(5)]],
    });
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

  onSlotClick(gameDay: string, time: string): void {
    if (!this.isAvailable(gameDay, time)) return;

    const currentSlots = this.selectedSlots();

    if (currentSlots.length > 0 && currentSlots[0].gameDay !== gameDay) {
      console.warn('Solo puedes seleccionar slots para el mismo día.');
      return;
    }

    const selectedIndex = currentSlots.findIndex(slot => slot.gameDay === gameDay && slot.startTime === time);

    let newSlots = [...currentSlots];

    if (selectedIndex === -1) {
      if (currentSlots.length >= 3) {
        console.warn('Solo puedes seleccionar un máximo de 3 slots.');
        return;
      }

      if (currentSlots.length === 0) {
        newSlots.push({ gameDay: gameDay, startTime: time, endTime: time });
      } else {
        const lastSelected = currentSlots[currentSlots.length - 1];
        const firstSelected = currentSlots[0];
        const selectedTimeIndex = this.timeSlots.indexOf(time);
        const lastEndTimeIndex = this.timeSlots.indexOf(lastSelected.endTime);
        const firstStartTimeIndex = this.timeSlots.indexOf(firstSelected.startTime);

        if (selectedTimeIndex === lastEndTimeIndex + 1 || selectedTimeIndex === firstStartTimeIndex - 1) {
          newSlots.push({ gameDay: gameDay, startTime: time, endTime: time });
          newSlots.sort((a, b) => this.timeSlots.indexOf(a.startTime) - this.timeSlots.indexOf(b.startTime));
        } else {
          console.warn('Los bloques seleccionados deben ser consecutivos.');
          return;
        }
      }
    } else {
      newSlots.splice(selectedIndex, 1);

      for (let i = 1; i < newSlots.length; i++) {
        const prevIndex = this.timeSlots.indexOf(newSlots[i - 1].endTime);
        const currentIndex = this.timeSlots.indexOf(newSlots[i].startTime);

        if (currentIndex !== prevIndex + 1) {
          console.warn('Los bloques restantes deben ser consecutivos. Deselección no permitida.');
          return;
        }
      }
    }

    this.selectedSlots.set(newSlots);
    console.log(`Selected Slots:`, newSlots);
  }

  isSelected(date: string, time: string): boolean {
    return this.selectedSlots().some(slot => slot.gameDay === date && slot.startTime === time);
  }

  confirmHours(): void {
    const slots = this.selectedSlots();
    if (slots.length > 0) {
      const firstSlot = slots[0];
      const lastSlot = slots[slots.length - 1];

      this.selectedGameDay = firstSlot.gameDay;
      this.selectedStartTime = firstSlot.startTime;

      const lastEndTimeIndex = this.timeSlots.indexOf(lastSlot.endTime);
      if (lastEndTimeIndex === this.timeSlots.length - 1) {
        const [hour, minute] = lastSlot.endTime.split(':').map(Number);
        const nextHour = (hour + 1).toString().padStart(2, '0');
        this.selectedEndTime = `${nextHour}:${minute.toString().padStart(2, '0')}`;
      } else {
        this.selectedEndTime = this.timeSlots[lastEndTimeIndex + 1];
      }

      this.reservationForm.patchValue({
        gameDay: this.selectedGameDay,
        startTime: this.selectedStartTime,
        endTime: this.selectedEndTime
      });

      this.showReservationModal = true;
      console.log(this.reservationForm.get('endTime')?.value);
    } else {
      console.warn('Debes seleccionar al menos un horario.');
    }
  }

  closeReservationModal() {
    this.showReservationModal = false;
    this.reservationForm.reset();
    this.selectedSlots.set([]);
  }

  submitReservation() {
    if (this.reservationForm.valid) {
      const reservationData = this.reservationForm.getRawValue();

      this.reservationService.createReservation(reservationData).subscribe({
        next: () => {
          console.log('Reserva creada exitosamente:', reservationData);
          this.selectedSlots.set([]);
          this.closeReservationModal();
          this.router.navigate(['/reservations']).then();
        },
        error: (err) => {
          console.error('Error al crear la reserva:', err);
        },
      });
    } else {
      console.warn('Completa todos los campos del formulario.');
    }
  }
}
