import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {SportSpaceService} from '../../services/sport-space.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-sport-space-dashboard',
  imports: [],
  template: `
    <div class="dashboard-container">
      <h2>Métricas del espacio deportivo</h2>

      <p>Cantidad de visitantes por mes en el año 2025</p>

      @if (datosMensuales().length > 0) {
        <div class="bar-chart">
          @for (dato of datosMensuales(); track dato.mes) {
            <div class="bar-wrapper">
              <span class="bar-label">{{ dato.cantidad }}</span>
              <div class="bar" [style.height.px]="dato.cantidad"></div>
              <span class="label">{{ dato.mes }}</span>
            </div>
          }
        </div>
      } @else {
        <p class="no-data">No hay métricas generadas aún.</p>
      }
    </div>
  `,
  styleUrl: './sport-space-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SportSpaceDashboardComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private sportSpaceService = inject(SportSpaceService);

  datosMensuales = signal<{ mes: string, cantidad: number }[]>([]);

  private readonly meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  ngOnInit() {
    this.showMetrics();
  }

  showMetrics() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const currentYear = new Date().getFullYear().toString();

    this.sportSpaceService.getMetrics(id, currentYear).subscribe({
      next: (response: Record<string, number>) => {
        const datos = this.meses
          .map(mes => ({
            mes,
            cantidad: response[mes] ?? 0
          }))
          .filter(d => d.cantidad > 0);

        console.log(datos);

        const maxCantidad = Math.max(...datos.map(d => d.cantidad), 1); // evita división por 0
        const alturaMax = 150; // altura máxima en px

        this.datosMensuales.set(
          datos.map(d => ({
            ...d,
            altura: (d.cantidad / maxCantidad) * alturaMax
          }))
        );
      },
      error: (error) => {
        console.error('Error al obtener métricas:', error);
      }
    });
  }
}
