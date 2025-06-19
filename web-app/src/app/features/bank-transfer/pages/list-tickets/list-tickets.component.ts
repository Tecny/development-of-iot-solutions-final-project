import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {BankTransferService} from '../../services/bank-transfer.service';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Ticket, TicketRequest} from '../../models/ticket.interface';
import {ModalComponent} from '../../../../shared/components/modal/modal.component';
import {customAccountNumberLengthByBank} from '../../../../shared/validators/banks.validator';
import {UserStoreService} from '../../../../core/services/user-store.service';
import {TicketCardComponent} from '../../components/ticket-card/ticket-card.component';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-list-tickets',
  imports: [
    FormsModule,
    ModalComponent,
    ReactiveFormsModule,
    TicketCardComponent
  ],
  templateUrl: './list-tickets.component.html',
  styleUrl: './list-tickets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListTicketsComponent implements OnInit {
  private bankTransferService = inject(BankTransferService);
  private userStore = inject(UserStoreService);
  private fb = inject(NonNullableFormBuilder);
  private toastService = inject(ToastrService);

  currentUser = this.userStore.currentUser;
  tickets = signal<Ticket[] | null>(null);
  isLoadingSubmitRequest = signal(false);

  bankType: 'asociado' | 'otro' = 'asociado';
  associatedBanks = ['BCP', 'BBVA', 'Interbank'];

  ticketForm!: FormGroup;
  showTicketModal = false;

  ngOnInit() {
    this.initForm();
    this.loadTickets();
  }

  initForm() {
    this.ticketForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(5)]],
      bankName: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      transferType: ['CC', Validators.required]
    });

    this.updateValidatorsByBankType();

    this.ticketForm.get('bankName')?.valueChanges.subscribe((bank: string) => {
      const accountControl = this.ticketForm.get('accountNumber');
      const transferType = this.isAssociatedBank(bank) ? 'CC' : 'CCI';
      this.ticketForm.get('transferType')?.setValue(transferType);

      const validators = [Validators.required, Validators.pattern(/^\d+$/)];

      if (this.isAssociatedBank(bank)) {
        validators.push(customAccountNumberLengthByBank(bank));
      } else {
        validators.push(customAccountNumberLengthByBank('Otros'));
      }

      accountControl?.setValidators(validators);
      accountControl?.updateValueAndValidity();
    });
  }

  loadTickets() {
    if (this.currentUser()?.roleType === 'OWNER') {
      this.bankTransferService.getTicketsByOwner().subscribe({
        next: (tickets) => {
          this.tickets.set(tickets);
        },
        error: (err) => {
          if (err.status === 404) {

            this.tickets.set([]);
          }
        }
      });
    } else {
      this.bankTransferService.getAllTickets().subscribe({
        next: (tickets) => {
          this.tickets.set(tickets);
        },
        error: () => {
          this.toastService.info('No tienes solicitudes de transferencia bancaria pendientes', 'Info');
        }
      });
    }
  }

  haveCredits() {
    return this.currentUser()?.credits !== 0;
  }

  openTicketModal() {
    this.showTicketModal = true;
  }

  closeTicketModal() {
    this.showTicketModal = false;
    this.ticketForm.reset();
  }

  submitTicketRequest() {

    if (!this.ticketForm.valid) {
      this.ticketForm.markAllAsTouched();
      return;
    }
    const bankTransferData: TicketRequest = this.ticketForm.getRawValue();
    this.isLoadingSubmitRequest.set(true);
    this.bankTransferService.createTicket(bankTransferData).subscribe({
      next: () => {
        this.isLoadingSubmitRequest.set(false);
        this.closeTicketModal();
        this.loadTickets();
      },
      error: () => {
        this.isLoadingSubmitRequest.set(false);
      }
    });
  }

  onBankTypeChange() {
    this.ticketForm.reset();
    this.updateValidatorsByBankType();
  }

  private isAssociatedBank(bankName: string): boolean {
    return this.associatedBanks.includes(bankName);
  }

  private updateValidatorsByBankType() {
    const bankNameControl = this.ticketForm.get('bankName');
    const accountControl = this.ticketForm.get('accountNumber');
    const transferTypeControl = this.ticketForm.get('transferType');

    if (this.bankType === 'asociado') {
      transferTypeControl?.setValue('CC');
      accountControl?.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);

      bankNameControl?.valueChanges.subscribe((bank: string) => {
        const validators = [Validators.required, Validators.pattern(/^\d+$/)];
        validators.push(customAccountNumberLengthByBank(bank));
        accountControl?.setValidators(validators);
        accountControl?.updateValueAndValidity();
      });
    } else {
      transferTypeControl?.setValue('CCI');
      bankNameControl?.setValidators([Validators.required]);
      accountControl?.setValidators([Validators.required, Validators.pattern(/^\d+$/)]);

      bankNameControl?.updateValueAndValidity();
      accountControl?.updateValueAndValidity();
    }
  }
}
