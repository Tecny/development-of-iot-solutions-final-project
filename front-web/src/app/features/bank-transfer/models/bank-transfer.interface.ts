export interface BankTransferRequest {
  fullName: string;
  bankName: string;
  transferType: string;
  accountNumber: string;
}

export interface BankTransfer {
  id: string;
  userId: string;
  fullName: string;
  bankName: string;
  transferType: string;
  accountNumber: string;
  amount: number;
  status: string;
  ticketNumber: string;
}
