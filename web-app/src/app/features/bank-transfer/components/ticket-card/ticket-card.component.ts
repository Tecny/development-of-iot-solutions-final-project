import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Ticket} from '../../models/ticket.interface';
import {TitleCasePipe} from '@angular/common';

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
    </div>
  `,
  styleUrl: './ticket-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCardComponent {
  @Input() ticket!: Ticket;
}
