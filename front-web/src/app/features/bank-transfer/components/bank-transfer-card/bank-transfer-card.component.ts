import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {BankTransfer} from '../../models/bank-transfer.interface';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-bank-transfer-card',
  imports: [
    TitleCasePipe
  ],
  template: `
    <div class="bank-transfer-card">
      <div class="bank-transfer-card__content">
        <h2 class="bank-transfer-card__title">{{ bankTransfer.fullName }}</h2>
        <p class="bank-transfer-card__bank">Banco: {{ bankTransfer.bankName }}</p>
        <p class="bank-transfer-card__type">Tipo de transferencia: {{ bankTransfer.transferType }}</p>
        <p class="bank-transfer-card__account">Número de cuenta: {{ bankTransfer.accountNumber }}</p>
        <p class="bank-transfer-card__amount">Monto: {{ bankTransfer.amount }} créditos</p>
        <p class="bank-transfer-card__status">Estado: {{ bankTransfer.status | titlecase }}</p>
        <p class="bank-transfer-card__ticket">Número de ticket: {{ bankTransfer.ticketNumber }}</p>
      </div>
    </div>
  `,
  styleUrl: './bank-transfer-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankTransferCardComponent {
  @Input() bankTransfer!: BankTransfer;
}
