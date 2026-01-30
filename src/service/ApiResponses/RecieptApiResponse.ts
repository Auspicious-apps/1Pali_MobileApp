export interface GetUserReceiptResponse {
  receiptId: string;
  date: string;
  price: number;
  receiptUrl: string;
}

export interface ReceiptsData {
  receipts: GetUserReceiptResponse[];
  total: number;
  limit: number;
  offset: number;
}
