import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal} from '@angular/core';
import {Room} from '../../models/room.interface';
import {LowerCasePipe, TitleCasePipe} from '@angular/common';
import {PriceUtil, TimeUtil} from '../../../../shared/utils/time.util';
import {RoomService} from '../../services/room.service';
import {Router, RouterLink} from '@angular/router';
import {ReservationService} from '../../../reservation/services/reservation.service';
import {QrViewerComponent} from '../../../../shared/components/qr-viewer/qr-viewer.component';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {ModalComponent} from '../../../../shared/components/modal/modal.component';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-room-card',
  imports: [
    TitleCasePipe,
    RouterLink,
    QrViewerComponent,
    LowerCasePipe,
    ModalComponent
  ],
  template: `
    <div class="room-card">
      <div class="room-card__header">
        <div class="room-card__header-top">
          <span class="room-card__title">{{ room.reservation.reservationName }}</span>
          <span class="room-card__players">{{ room.playerCount }}</span>
        </div>
        @if (showStatus) {
          <span class="room-card__status badge badge--{{ room.reservation.status | lowercase }}">
            {{ room.reservation.status | titlecase }}
          </span>
        }
      </div>

      <div class="room-card__body">
        <div class="room-card__details">
          <p><strong>Modo de juego:</strong> {{ room.reservation.sportSpace.gamemode.replaceAll('_', ' ') | titlecase }}
          </p>
          <p><strong>Fecha:</strong> {{ TimeUtil.formatDate(room.reservation.gameDay) }}
            , {{ room.reservation.startTime }} - {{ room.reservation.endTime }}</p>
          <p><strong>Adelanto:</strong> {{ getAmount() }} créditos</p>
          <p><strong>Espacio deportivo: </strong>
            <a
              [routerLink]="['/sport-spaces', room.reservation.sportSpace.id]">{{ room.reservation.sportSpace.name }}</a>
          </p>
          <p><strong>Lugar:</strong> {{ room.reservation.sportSpace.address }}</p>
        </div>
      </div>

      @if (currentUser()?.roleType === 'PLAYER') {
        <div class="room-card__actions">
          @if (isMember() !== null) {
            @if (isMember()) {
              <button class="btn btn--primary" (click)="viewRoom()">
                <i class="lni lni-location-arrow-right"></i> <span class="btn-text">Ir a la sala</span>
              </button>
              @if (isRoomCreator()) {
                <button class="btn btn--danger" (click)="showDeleteModal = true">
                  <i class="lni lni-trash-3"></i> <span class="btn-text">Borrar</span>
                </button>
                @if (room.reservation.status === 'CONFIRMED') {
                  <button class="btn btn--blockchain" (click)="showBCModal = true">
                    <i class="lni lni-ethereum-logo"></i>
                  </button>
                  <button class="btn btn--secondary" (click)="showQRModal = true">
                    <i class="fa-solid fa-qrcode"></i>
                  </button>
                }
              } @else {
                <button class="btn btn--warning" (click)="showLeaveModal = true">
                  <i class="lni lni-exit"></i> <span class="btn-text">Salir</span>
                </button>
              }
            } @else {
              <button class="btn btn--success" (click)="showJoinModal = true">
                <i class="lni lni-enter"></i> <span class="btn-text">Unirse</span>
              </button>
            }
          }
        </div>
      }
    </div>
    @if (showJoinModal) {
      <app-modal [width]="'400px'" [variant]="'default'" (closeModal)="handleClose()">
        <div modal-header>Unirte a la sala</div>
        <div modal-body>¿Quieres unirte a esta sala comunidad por un costo de {{ getAmount() }} créditos?</div>
        <div modal-footer>
          <button type="submit" class="button-submit" (click)="joinRoom()" [disabled]="isLoadingRequest()" >
            @if (isLoadingRequest()) {
              <span class="spinner-default"></span>
            } @else {
              Unirse
            }
          </button>
        </div>
      </app-modal>
    }
    @if (showLeaveModal) {
      <app-modal [width]="'400px'" [variant]="'warning'" (closeModal)="handleClose()">
        <div modal-header>Confirmar salida</div>
        <div modal-body>¿Estás seguro que deseas salir de esta sala comunidad? Se reembolsarán tus créditos.</div>
        <div modal-footer>
          <button type="submit" class="button-submit--warning" (click)="leaveRoom()" [disabled]="isLoadingRequest()">
            @if (isLoadingRequest()) {
              <span class="spinner-warning"></span>
            } @else {
              Salir
            }
          </button>
        </div>
      </app-modal>
    }
    @if (showDeleteModal) {
      <app-modal [width]="'400px'" [variant]="'danger'" (closeModal)="handleClose()">
        <div modal-header>Confirmar eliminación</div>
        <div modal-body>¿Estás seguro que deseas eliminar este sala comunidad? Se reembolsarán tus créditos.</div>
        <div modal-footer>
          <button type="submit" class="button-submit--danger" (click)="deleteRoom()" [disabled]="isLoadingRequest()">
            @if (isLoadingRequest()) {
              <span class="spinner-danger"></span>
            } @else {
              Eliminar
            }
          </button>
        </div>
      </app-modal>
    }
    @if (showBCModal) {
      <app-modal [width]="'400px'" [variant]="'info'" (closeModal)="handleClose()">
        <div modal-header>Datos en la blockchain</div>
        <div modal-body>
          <div class="reservation-card__details">
            <p><strong>Hash de transacción:</strong><br> <span class="tx-hash">{{ room.reservation.blockchain.txHash }}</span></p>
            <p><strong>Input Hex:</strong><br> <span class="input-hex">{{ room.reservation.blockchain.inputHex }}</span></p>
            <p><strong>ID Espacio:</strong> {{ room.reservation.blockchain.spaceId }}</p>
            <p><strong>ID Usuario:</strong> {{ room.reservation.blockchain.userId }}</p>
          </div>
        </div>
        <div modal-footer>
          <button class="button-submit--info" (click)="handleClose()">Aceptar</button>
        </div>
      </app-modal>
    }
    @if (showQRModal) {
      <app-qr-viewer [reservationId]="room.reservation.id" (close)="showQRModal = false"/>
    }
  `,
  styleUrl: './room-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomCardComponent implements OnInit {
  @Input() room!: Room;
  @Input() showStatus: boolean = false;
  @Output() roomDeleted = new EventEmitter<void>();

  protected readonly TimeUtil = TimeUtil;

  private userStore = inject(UserStoreService);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);
  private toastService = inject(ToastrService);

  currentUser = this.userStore.currentUser;
  isMember = signal<boolean | null>(null);
  isRoomCreator = signal<boolean | null>(null);
  isLoadingRequest = signal<boolean>(false);

  showJoinModal = false;
  showLeaveModal = false;
  showDeleteModal = false;
  showQRModal = false;
  showBCModal = false;

  ngOnInit(): void {
    this.checkRoomAccess();
  }

  getAmount(): number {
    const hours = TimeUtil.getHoursDifference(this.room.reservation.startTime, this.room.reservation.endTime);
    return PriceUtil.calculatePrice(
      'COMMUNITY',
      this.room.reservation.sportSpace.price,
      this.room.reservation.sportSpace.amount,
      hours
    );
  }

  viewRoom() {
    this.roomService.allowAccess(this.room.id);
    this.router.navigate(['/rooms', this.room.id]).then();
  }

  checkRoomAccess() {
    if (this.room?.id) {
      this.roomService.userRoomStatus(this.room.id).subscribe({
        next: (res) => {
          this.isMember.set(res.isMember);
          this.isRoomCreator.set(res.isRoomCreator);
        },
        error: () => {
          this.isMember.set(false);
          this.isRoomCreator.set(false);
        }
      });
    }
  }

  joinRoom() {
    this.isLoadingRequest.set(true);
    this.roomService.joinRoom(this.room.id).subscribe({
      next: () => {
        this.isLoadingRequest.set(false);
        this.handleClose();
        this.roomService.allowAccess(this.room.id);
        this.router.navigate(['/rooms', this.room.id]).then();
        this.toastService.success('Te has unido a la sala comunidad exitosamente', 'Éxito');
      },
      error: () => {
        this.isLoadingRequest.set(false);
        this.toastService.error('No se pudo unir a la sala comunidad', 'Error');
      }
    });
  }

  leaveRoom() {
    this.isLoadingRequest.set(true);
    this.roomService.leaveRoom(this.room.id).subscribe({
      next: () => {
        this.isLoadingRequest.set(false);
        this.handleClose();
        this.roomService.clearAccess(this.room.id);
        this.toastService.success('Has salido de la sala comunidad exitosamente', 'Éxito');
        this.checkRoomAccess();
      },
      error: () => {
        this.isLoadingRequest.set(true);
        this.toastService.error('No se pudo salir de la sala comunidad', 'Error');
      }
    });
  }

  deleteRoom() {
    this.isLoadingRequest.set(true);
    this.reservationService.deleteReservation(this.room.reservation.id).subscribe({
      next: () => {
        this.isLoadingRequest.set(false);
        this.handleClose();
        this.checkRoomAccess();
        this.roomDeleted.emit();
        this.toastService.success('Sala comunidad eliminada exitosamente', 'Éxito');
      },
      error: () => {
        this.isLoadingRequest.set(false);
        this.toastService.error('No se pudo eliminar la sala comunidad', 'Error');
      }
    });
  }

  handleClose() {
    this.showDeleteModal = false;
    this.showJoinModal = false;
    this.showLeaveModal = false;
    this.showQRModal = false;
    this.showBCModal = false;
  }
}
