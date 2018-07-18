import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";
import {catchError} from "rxjs/operators";
import {Customer} from "../models/customer";
import {User} from "../models/user";
import {Provider} from "../models/provider";
import {Item} from "../models/item";
import {Quote} from "../models/quote";
import {Invoice} from "../models/invoice";
import "rxjs/add/operator/share";
import "rxjs/add/operator/shareReplay";
import "rxjs/add/operator/publish";
import {Income} from "../models/income";

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

///////////////////////////// CUSTOMER SECTION /////////////////////////////

  addCustomer(customerData) {
    return this.http.post<any>('api/customers/add', customerData).pipe(
      catchError(this.handleError)
    );
  }

  updateCustomer(customerData) {
    return this.http.put<any>('api/customers/update', customerData).pipe(
      catchError(this.handleError)
    );
  }

  getMyCustomers() {
    return this.http.get<Customer[]>('api/customers/me').pipe(
      catchError(this.handleError)
    );
  }

  getCustomerBySiret(customerSiret) {
    return this.http.get<any>('api/customers/'+customerSiret).pipe(
      catchError(this.handleError)
    );
  }

  deleteCustomerById(customerId) {
    return this.http.delete<any>('api/customers/'+customerId).pipe(
      catchError(this.handleError)
    );
  }

  deleteCustomers(customers: Customer[]){
    return this.http.post<any>('api/customers/delete', customers).pipe(
      catchError(this.handleError)
    );
  }

  ///////////////////////////// PROVIDER SECTION /////////////////////////////

  addProvider(providerData) {
    return this.http.post<any>('api/providers/add', providerData).pipe(
      catchError(this.handleError)
    );
  }

  updateProvider(providerData) {
    return this.http.put<any>('api/providers/update', providerData).pipe(
      catchError(this.handleError)
    );
  }

  getMyProviders() {
    return this.http.get<any>('api/providers/me').pipe(
      catchError(this.handleError)
    );
  }

  getProviderBySiret(providerSiret) {
    return this.http.get<any>('api/providers/'+providerSiret).pipe(
      catchError(this.handleError)
    );
  }

  deleteProviderById(providerId) {
    return this.http.delete<any>('api/providers/'+providerId).pipe(
      catchError(this.handleError)
    );
  }

  deleteProviders(providers: Provider[]){
    return this.http.post<any>('api/providers/delete', providers).pipe(
      catchError(this.handleError)
    );
  }


///////////////////////////// ITEM SECTION /////////////////////////////


  addItem(itemData) {
    return this.http.post<any>('api/items/add', itemData).pipe(
      catchError(this.handleError)
    );
  }

  updateItem(itemData) {
    return this.http.put<any>('api/items/update', itemData).pipe(
      catchError(this.handleError)
    );
  }

  getMyItems() {
    return this.http.get<any>('api/items/me').pipe(
      catchError(this.handleError)
    );
  }

  deleteItemById(itemId) {
    return this.http.delete<any>('api/items/'+itemId).pipe(
      catchError(this.handleError)
    );
  }

  deleteItems(items: Item[]){
    return this.http.post<any>('api/items/delete', items).pipe(
      catchError(this.handleError)
    );
  }



///////////////////////////// QUOTE SECTION /////////////////////////////

  getMyQuotes() {
    return this.http.get<any>('api/quotes/me').pipe(
      catchError(this.handleError)
    );
  }

  sendQuote(quoteCode: string) {
    return this.http.get<any>('api/quotes/send/'+quoteCode).pipe(
      catchError(this.handleError)
    );
  }


  downloadQuote(quoteCode: string) {
    // "Devis - " + quote.code + ".pdf"
    return  this.http.get('api/quotes/download/' + quoteCode, {responseType: 'blob' as 'json'});
  }

  generateInvoiceFromQuote(quote: Quote){
    return this.http.post<any>('api/quotes/generateInvoice', quote).pipe(
      catchError(this.handleError)
    );
  }

  deleteQuotes(quotes: Quote[]){
    return this.http.post<any>('api/quotes/delete', quotes).pipe(
      catchError(this.handleError)
    );
  }

  addQuote(quoteData) {
    return this.http.post<any>('api/quotes/add', quoteData).pipe(
      catchError(this.handleError)
    );
  }

  updateQuote(quoteData) {
    return this.http.put<any>('api/quotes/update', quoteData).pipe(
      catchError(this.handleError)
    );
  }

  deleteQuotById(quoteId) {
    return this.http.delete<any>('api/quotes/'+quoteId).pipe(
      catchError(this.handleError)
    );
  }


  ///////////////////////////// INVOICE SECTION /////////////////////////////

  getMyInvoices() {
    return this.http.get<any>('api/invoices/me').pipe(
      catchError(this.handleError)
    );
  }

  sendInvoice(invoiceCode: string) {
    return this.http.get<any>('api/invoices/send/'+invoiceCode).pipe(
      catchError(this.handleError)
    );
  }

  deleteInvoices(invoices: Invoice[]){
    return this.http.post<any>('api/invoices/delete', invoices).pipe(
      catchError(this.handleError)
    );
  }

  getInvoicePayment(userId, invoiceCode) {
    return this.http.get<any>('api/payment/' + userId + '/' + invoiceCode + '/display').pipe(
      catchError(this.handleError)
    );
  }

  addInvoice(invoiceData) {
    return this.http.post<any>('api/invoices/add', invoiceData).pipe(
      catchError(this.handleError)
    );
  }

  updateInvoice(invoiceData) {
    return this.http.put<any>('api/invoices/update', invoiceData).pipe(
      catchError(this.handleError)
    );
  }

  downloadInvoice(invoiceCode: string) {
    return  this.http.get('api/invoices/download/' + invoiceCode, {responseType: 'blob' as 'json'});
  }

  ///////////////////////////// CONTACT SECTION /////////////////////////////

  contact(infos) {
    return this.http.post<any>('/api/contact', infos).pipe(
      catchError(this.handleError)
    );
  }


  ///////////////////////////// INCOME SECTION /////////////////////////////

  addIncome(data) {
    return this.http.post<any>('api/payment/add', data).pipe(
      catchError(this.handleError)
    );
  }



  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
     } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
     console.error(
       `Backend returned code ${error.status}, ` +
       `body was: ${error.error.message}`);
     }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      error
    );
  };
}
