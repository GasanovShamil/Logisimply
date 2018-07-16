import {Content} from "./content";

export class Invoice {
  customer: string;
  code: string;
  dateInvoice: string;
  subject: string;
  content: Content[];
  discount: string;
  totalPriceET: string;
  advancedPayment: string;
  sumToPay: string;
  incomes: any[];
  datePayment:string;
  dateExecution: string;
  collectionCost: boolean;
  comment: string;
  status: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}
