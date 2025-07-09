import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SportSpaceService} from '../../services/sport-space.service';
import {SportSpace} from '../../models/sport-space.interface';
import {SportSpaceInfoComponent} from '../../components/sport-space-info/sport-space-info.component';
import {
  SportSpaceAvailabilityComponent
} from '../../components/sport-space-availability/sport-space-availability.component';

@Component({
  selector: 'app-sport-space-detail',
  imports: [
    SportSpaceInfoComponent,
    SportSpaceAvailabilityComponent
  ],
  templateUrl: './sport-space-detail.component.html',
  styleUrl: './sport-space-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceDetailComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private sportSpaceService = inject(SportSpaceService);

  sportSpace = signal<SportSpace | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sportSpaceService.getSportSpaceById(id).subscribe({
      next: (space) => {
        this.sportSpace.set(space);
        this.isLoading.set(false);
      },
      error: () => {
        console.error('Error loading sport space');
        this.isLoading.set(false);
      }
    });
  }
}
