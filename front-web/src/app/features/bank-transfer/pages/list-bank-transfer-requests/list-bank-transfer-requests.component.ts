import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {BankTransferService} from '../../services/bank-transfer.service';
import {FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {BankTransferRequest} from '../../models/bank-transfer.interface';
import {ModalComponent} from '../../../../shared/components/modal/modal.component';
import {customAccountNumberLengthByBank} from '../../../../shared/validators/banks.validator';

@Component({
  selector: 'app-list-bank-transfer-requests',
  imports: [
    FormsModule,
    ModalComponent,
    ReactiveFormsModule
  ],
  templateUrl: './list-bank-transfer-requests.component.html',
  styleUrl: './list-bank-transfer-requests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListBankTransferRequestsComponent implements OnInit {
  private bankTransferService = inject(BankTransferService);
  private fb = inject(NonNullableFormBuilder);

  bankType: 'asociado' | 'otro' = 'asociado';
  associatedBanks = ['BCP', 'BBVA', 'Interbank'];

  bankTransferForm!: FormGroup;
  showBankTransferModal = false;

  initForm() {
    this.bankTransferForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(5)]],
      bankName: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      transferType: ['CC', Validators.required]
    });

    this.updateValidatorsByBankType();

    this.bankTransferForm.get('bankName')?.valueChanges.subscribe((bank: string) => {
      const accountControl = this.bankTransferForm.get('accountNumber');
      const transferType = this.isAssociatedBank(bank) ? 'CC' : 'CCI';
      this.bankTransferForm.get('transferType')?.setValue(transferType);

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

  ngOnInit() {
    this.initForm();
  }

  openBankTransferModal() {
    this.showBankTransferModal = true;
  }

  closeBankTransferModal() {
    this.showBankTransferModal = false;
    this.bankTransferForm.reset();
  }

  submitBankTransferRequest() {
    if (this.bankTransferForm.valid) {
      const bankTransferData: BankTransferRequest = this.bankTransferForm.getRawValue();

      console.log(bankTransferData);

      this.bankTransferService.createBankTransfer(bankTransferData).subscribe({
        next: () => {
          console.log('Bank transfer request created successfully');
          this.closeBankTransferModal();
        },
        error: (error) => {
          console.error('Error creating bank transfer request:', error);
        }
      });
    }
  }

  onBankTypeChange() {
    this.bankTransferForm.reset();
    this.updateValidatorsByBankType();
  }

  private isAssociatedBank(bankName: string): boolean {
    return this.associatedBanks.includes(bankName);
  }

  private updateValidatorsByBankType() {
    const bankNameControl = this.bankTransferForm.get('bankName');
    const accountControl = this.bankTransferForm.get('accountNumber');
    const transferTypeControl = this.bankTransferForm.get('transferType');

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
