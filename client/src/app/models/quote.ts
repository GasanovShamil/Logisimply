import {Content} from "./content";

export class Quote {
  customer: string;
  code: string;
  dateQuote: string;
  subject: string;
  content: Content[];
  discount: string;
  totalPriceET: string;
  datePayment: string;
  validity: string;
  collectionCost: boolean;
  comment: string;
  status: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}
