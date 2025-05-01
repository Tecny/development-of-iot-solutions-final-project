export interface TicketRequest {
  fullName: string;
  bankName: string;
  transferType: string;
  accountNumber: string;
}

export interface Ticket {
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
