import {ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {Ticket} from '../../models/ticket.interface';
import {NgClass, TitleCasePipe} from '@angular/common';
import {UserStoreService} from "../../../../core/services/user-store.service";
import {BankTransferService} from "../../services/bank-transfer.service";
import {ModalComponent} from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-ticket-card',
  imports: [
    TitleCasePipe,
    NgClass,
    ModalComponent
  ],
  template: `
    <div class="ticket-card"
         [ngClass]="{
            'ticket-card--pending': ticket.status === 'PENDING',
            'ticket-card--confirmed': ticket.status === 'CONFIRMED',
            'ticket-card--deferred': ticket.status === 'DEFERRED'
          }">
      <div class="ticket-card__header">
        <p class="ticket-card__status">{{ ticket.status | titlecase }}</p>
        <h2>Ticket: {{ ticket.ticketNumber }}</h2>
      </div>
      <div class="ticket-card__content">
        <p>Nombre: {{ ticket.fullName }}</p>
        <p>Banco: {{ ticket.bankName }}</p>
        <p>Tipo de transferencia: {{ ticket.transferType }}</p>
        <p>Número de cuenta: {{ ticket.accountNumber }}</p>
        <p>Monto: {{ ticket.amount }} créditos</p>
      </div>
      @if (this.currentUser()?.roleType === 'ADMIN') {
        <div class="ticket-card__actions">
          <div class="ticket-card__actions">
            @if (canConfirmTicket()) {
              <button (click)="showConfirmModal = true">
                <i class="lni lni-check-circle-1"></i>
                Confirmar
              </button>
            }
            @if (canDeferTicket()) {
              <button (click)="showDeferModal = true">
                <i class="lni lni-alarm-1"></i>
                Diferir
              </button>
            }
          </div>

        </div>
      }
    </div>
    @if (showConfirmModal) {
      <app-modal [width]="'400px'" [variant]="'default'" (closeModal)="handleClose()">
        <div modal-header>Confirmar ticket</div>
        <div modal-body>¿Estás seguro de que deseas confirmar este ticket de retiro de créditos?</div>
        <div modal-footer>
          <button type="submit" class="button-submit" (click)="confirmTicket()" [disabled]="isLoadingRequest()" >
            @if (isLoadingRequest()) {
              <span class="spinner-default"></span>
            } @else {
              Confirmar
            }
          </button>
        </div>
      </app-modal>
    }
    @if (showDeferModal) {
      <app-modal [width]="'400px'" [variant]="'warning'" (closeModal)="handleClose()">
        <div modal-header>Diferir ticket</div>
        <div modal-body>¿Estás seguro de que deseas diferir este ticket de retiro de créditos?</div>
        <div modal-footer>
          <button type="submit" class="button-submit--warning" (click)="deferTicket()" [disabled]="isLoadingRequest()" >
            @if (isLoadingRequest()) {
              <span class="spinner-warning"></span>
            } @else {
              Confirmar
            }
          </button>
        </div>
      </app-modal>
    }
  `,
  styleUrl: './ticket-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCardComponent {
  @Input() ticket!: Ticket;
  @Output() ticketConfirmed = new EventEmitter<void>();
  @Output() ticketDeferred = new EventEmitter<void>();

  private userStore = inject(UserStoreService);
  private bankTransferService = inject(BankTransferService);

  currentUser = this.userStore.currentUser;
  isAdmin = computed(() => {
    const currentUser = this.currentUser();
    return currentUser && currentUser.roleType === 'ADMIN';
  });
  isLoadingRequest = signal(false);

  showConfirmModal = false;
  showDeferModal = false;

  canConfirmTicket(){
    return (this.ticket.status === 'PENDING' || this.ticket.status === 'DEFERRED') && this.isAdmin();
  }

  canDeferTicket(){
    return this.ticket.status === 'PENDING' && this.isAdmin();
  }

  confirmTicket() {
    this.isLoadingRequest.set(true);
    if (this.isAdmin()) {
      this.bankTransferService.confirmTicket(this.ticket.id).subscribe({
        next: () => {
          this.isLoadingRequest.set(false);
          this.ticketConfirmed.emit();
        },
        error: () => {
          this.isLoadingRequest.set(false);
        }
      });
    } else {
      this.isLoadingRequest.set(false);
    }
  }

  deferTicket() {
    this.isLoadingRequest.set(true);
    if (this.isAdmin()) {
      this.bankTransferService.deferTicket(this.ticket.id).subscribe({
        next: () => {
          this.isLoadingRequest.set(false);
          this.ticketDeferred.emit();
        },
        error: () => {
          this.isLoadingRequest.set(false);
        }
      });
    } else {
      this.isLoadingRequest.set(false);
    }
  }

  handleClose() {
    this.showConfirmModal = false;
    this.showDeferModal = false;
  }
}
