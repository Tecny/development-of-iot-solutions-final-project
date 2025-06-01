import {ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import {Ticket} from '../../models/ticket.interface';
import {TitleCasePipe} from '@angular/common';
import {UserStoreService} from "../../../../core/services/user-store.service";
import {BankTransferService} from "../../services/bank-transfer.service";

@Component({
  selector: 'app-ticket-card',
  imports: [
    TitleCasePipe
  ],
  template: `
    <div class="ticket-card">
      <div class="ticket-card__content">
        <h2 class="ticket-card__ticket">Número de ticket: {{ ticket.ticketNumber }}</h2>
        <p class="ticket-card__name">Nombre: {{ ticket.fullName }}</p>
        <p class="ticket-card__bank">Banco: {{ ticket.bankName }}</p>
        <p class="ticket-card__type">Tipo de transferencia: {{ ticket.transferType }}</p>
        <p class="ticket-card__account">Número de cuenta: {{ ticket.accountNumber }}</p>
        <p class="ticket-card__amount">Monto: {{ ticket.amount }} créditos</p>
        <p class="ticket-card__status">Estado: {{ ticket.status | titlecase }}</p>
      </div>

      @if (canConfirmTicket()) {
        <button (click)="confirmTicket()">Confirmar</button>
      }
      @if (canDeferTicket()) {
        <button (click)="deferTicket()">Diferir</button>
      }
    </div>
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

  canConfirmTicket(){
    return (this.ticket.status === 'PENDING' || this.ticket.status === 'DEFERRED') && this.isAdmin();
  }

  canDeferTicket(){
    return this.ticket.status === 'PENDING' && this.isAdmin();
  }

  confirmTicket() {
    if(window.confirm('¿Está seguro de que desea confirmar este ticket?')) {
      if (this.isAdmin()) {
        this.bankTransferService.confirmTicket(this.ticket.id).subscribe({
          next: () => {
            this.ticketConfirmed.emit();
          },
          error: (error) => {
            console.error('Error confirming ticket:', error);
          }
        });
      } else {
        console.warn('Only admins can confirm tickets');
      }
    }
  }

  deferTicket() {
    if(window.confirm('¿Está seguro de que desea diferir este ticket?')) {
      if (this.isAdmin()) {
        this.bankTransferService.deferTicket(this.ticket.id).subscribe({
          next: () => {
            this.ticketDeferred.emit();
          },
          error: (error) => {
            console.error('Error deferring ticket:', error);
          }
        });
      } else {
        console.warn('Only admins can defer tickets');
      }
    }
  }
}
