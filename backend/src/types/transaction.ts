export interface TransactionResponse {
  id: string;
  senderId: string;
  senderName: string;
  senderHandle: string;
  recipientId: string;
  recipientName: string;
  recipientHandle: string;
  amountCents: number;
  memo: string | null;
  createdAt: string;
}
