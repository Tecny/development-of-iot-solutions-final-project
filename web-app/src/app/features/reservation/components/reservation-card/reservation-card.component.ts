import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {Reservation} from '../../models/reservation.interface';
import {LowerCasePipe, TitleCasePipe} from '@angular/common';
import {PriceUtil, TimeUtil} from '../../../../shared/utils/time.util';
import {QrViewerComponent} from "../../../../shared/components/qr-viewer/qr-viewer.component";
import {RouterLink} from '@angular/router';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {ModalComponent} from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-reservation-card',
  imports: [
    TitleCasePipe,
    QrViewerComponent,
    LowerCasePipe,
    RouterLink,
    ModalComponent
  ],
  template: `
    <div class="reservation-card">
      <div class="reservation-card__header">
        <div class="reservation-card__header-top">
          <span class="reservation-card__title">{{ reservation.name }}</span>
          @if (currentUser()?.roleType !== 'ADMIN') {
            <button class="btn btn--blockchain" (click)="showBCModal = true">
              <i class="lni lni-ethereum-logo"></i>
            </button>
<!--            <button class="btn btn&#45;&#45;qr" (click)="showQRModal = true">-->
<!--              <i class="fa-solid fa-qrcode"></i>-->
<!--            </button>-->
          }
        </div>
        <span class="reservation-card__status badge badge--{{ reservation.status | lowercase }}">
            {{ reservation.status | titlecase }}
        </span>
      </div>

      <div class="reservation-card__body">
        <div class="reservation-card__details">
          <p><strong>Modo de juego:</strong> {{ reservation.sportSpaces.gamemode.replaceAll('_', ' ') | titlecase }}
          </p>
          <p><strong>Fecha:</strong> {{ TimeUtil.formatDate(reservation.gameDay) }}
            , {{ reservation.startTime }} - {{ reservation.endTime }}</p>
          <p><strong>Precio de la reserva:</strong> {{ getPrice() }} créditos</p>
          <p><strong>Espacio deportivo: </strong>
            <a
              [routerLink]="['/sport-spaces', reservation.sportSpaces.id]">{{ reservation.sportSpaces.name }}</a>
          </p>
          <p><strong>Lugar:</strong> {{ reservation.sportSpaces.address }}</p>
        </div>
      </div>
    </div>

    @if (showBCModal) {
      <app-modal [width]="'400px'" [variant]="'info'" (closeModal)="handleClose()">
        <div modal-header>Datos en la blockchain</div>
        <div modal-body>
          <div class="reservation-card__details">
            <p><strong>Hash de transacción:</strong><br> <span class="tx-hash">{{ reservation.blockchain.txHash }}</span></p>
            <p><strong>Input Hex:</strong><br> <span class="input-hex">{{ reservation.blockchain.inputHex }}</span></p>
            <p><strong>ID Espacio:</strong> {{ reservation.blockchain.spaceId }}</p>
            <p><strong>ID Usuario:</strong> {{ reservation.blockchain.userId }}</p>
            <p><strong>Marca de tiempo:</strong> {{ reservation.blockchain.timestamp }}</p>
          </div>
        </div>
        <div modal-footer>
          <button class="button-submit--info" (click)="handleClose()">Aceptar</button>
        </div>
      </app-modal>
    }

    @if (showQRModal) {
      <app-qr-viewer [reservationId]="reservation.id" (close)="showQRModal = false"/>
    }
  `,
  styleUrl: './reservation-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReservationCardComponent {
  @Input() reservation!: Reservation;

  private userStore = inject(UserStoreService);

  currentUser = this.userStore.currentUser;

  showQRModal = false;
  showBCModal = false;

  getPrice(): number {
    const hours = TimeUtil.getHoursDifference(this.reservation.startTime, this.reservation.endTime);
    return PriceUtil.calculatePrice(
      this.reservation.type,
      this.reservation.sportSpaces.price,
      this.reservation.sportSpaces.amount,
      hours
    );
  }

  handleClose() {
    this.showBCModal = false;
  }

  protected readonly TimeUtil = TimeUtil;
}
