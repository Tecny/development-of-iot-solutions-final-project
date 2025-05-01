import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {BankTransferRequest} from '../models/bank-transfer.interface';

@Injectable({
  providedIn: 'root'
})
export class BankTransferService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  createBankTransfer(bankTransfer: BankTransferRequest) {
    return this.http.post<void>(`${this.baseUrl}/bank-transfer/create`, bankTransfer);
  }
}
