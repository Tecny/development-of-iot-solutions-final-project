import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {ModalComponent} from '../modal/modal.component';
import {QrService} from '../../services/qr.service';

@Component({
  selector: 'app-qr-viewer',
  imports: [
    ModalComponent
  ],
  template: `
    <app-modal (closeModal)="onClose()">
      <div modal-header>
        <h2>QR de la Reserva</h2>
      </div>
      <div modal-body>
        @if (qrImageUrl) {
          <img [src]="qrImageUrl" alt="QR de la reserva" style="width: 250px; height: 250px;" />
        } @else {
          <p>Cargando QR...</p>
        }
      </div>
    </app-modal>
  `,
  styleUrl: './qr-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrViewerComponent implements OnChanges {
  @Input() reservationId!: number;
  @Output() close = new EventEmitter<void>();

  qrImageUrl: string | null = null;
  private qrService = inject(QrService);
  private cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reservationId'] && this.reservationId) {
      this.qrService.generateQrToken(this.reservationId).subscribe({
        next: (res) => {
          this.qrService.generateQRImage(res.qrToken).subscribe({
            next: (url) => {
              this.qrImageUrl = url;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Error al generar la imagen QR:', err);
              this.qrImageUrl = null;
              this.cdr.markForCheck();
            },
          });
        },
        error: (err) => {
          console.error('Error al generar el token QR:', err);
          this.qrImageUrl = null;
          this.cdr.markForCheck();
        },
      });
    }
  }

  onClose() {
    this.qrImageUrl = null;
    this.close.emit();
  }
}
