import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SportSpaceService} from '../../services/sport-space.service';
import {timeRangeValidator} from '../../../../shared/validators/forms.validator';
import {DISTRICTS, GAMEMODE_OPTIONS, gamemodesMap, SPORTS} from '../../../../shared/models/sport-space.constants';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-sport-space',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './create-sport-space.component.html',
  styleUrl: './create-sport-space.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateSportSpaceComponent{
  private sportSpaceService = inject(SportSpaceService);
  private fb = inject(NonNullableFormBuilder)
  private router = inject(Router);

  private _sportId = signal<number>(1);
  gamemodes = computed(() => this.getGamemodesBySport(this._sportId()));

  createSportSpaceForm: FormGroup;
  districts = DISTRICTS;
  selectedImageUrl: string | null = null;
  selectedImageFile: File | null = null;

  constructor() {
    this.createSportSpaceForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(7)]],
        sportId: [1, [Validators.required, Validators.min(1), Validators.max(2)]],
        gamemodeId: [null, [Validators.required]],
        price: [0, [Validators.required, Validators.min(40)]],
        districtId: [null, [Validators.required]],
        address: ['', [Validators.required, Validators.minLength(8)]],
        description: ['', [Validators.required, Validators.minLength(10)]],
        openTime: ['', [Validators.required]],
        closeTime: ['', [Validators.required]],
      },
      { validators: timeRangeValidator() }
    );

    this.createSportSpaceForm.get('sportId')?.valueChanges.subscribe(value => {
      this._sportId.set(value);
      this.createSportSpaceForm.get('gamemodeId')?.reset();
    });
  }

  createSportSpace() {
    if (!this.selectedImageFile) return;

    const formValues = this.createSportSpaceForm.getRawValue();

    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('image', this.selectedImageFile);
    formData.append('sportId', formValues.sportId.toString());
    formData.append('gamemodeId', formValues.gamemodeId.toString());
    formData.append('price', formValues.price.toString());
    formData.append('districtId', formValues.districtId.toString());
    formData.append('address', formValues.address);
    formData.append('description', formValues.description);
    formData.append('openTime', formValues.openTime);
    formData.append('closeTime', formValues.closeTime);

    this.sportSpaceService.createSportSpace(formData).subscribe({
      next: () => {
        this.createSportSpaceForm.reset();
        this.selectedImageUrl = null;
        this.selectedImageFile = null;
        this._sportId.set(1);
        this.router.navigate(['/sport-spaces']).then();
      },
      error: (error) => {
        console.error('Error al crear espacio:', error);
      }
    });
    console.log('Created', formValues);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImageUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }

  private getGamemodesBySport(sportId: number): { id: number, label: string, value: string, sportId: number }[] {
    const values = gamemodesMap[sportId] ?? [];  // Obtenemos los valores asociados al sportId
    return GAMEMODE_OPTIONS.filter(g => values.includes(g.value));  // Filtramos por los valores
  }

  protected readonly SPORTS = SPORTS;
}
