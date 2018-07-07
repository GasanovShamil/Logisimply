import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";
import {catchError} from "rxjs/operators";
import {Customer} from "../models/customer";
import {User} from "../models/user";

@Injectable()
export class DataService {

  constructor(private http: HttpClient) { }

///////////////////////////// CUSTOMER SECTION /////////////////////////////

  addCustomer(customerData) {
    return this.http.post<any>('/api/customers/add', customerData).pipe(
      catchError(this.handleError)
    );
  }

  updateCustomer(customerData) {
    return this.http.put<any>('api/customers/update', customerData).pipe(
      catchError(this.handleError)
    );
  }

  getMyCustomers() {
    return this.http.get<Customer[]>('/api/customers/').pipe(
      catchError(this.handleError)
    );
  }

  getCustomerBySiret(customerSiret) {
    return this.http.get<any>('/api/customers/'+customerSiret).pipe(
      catchError(this.handleError)
    );
  }

  deleteCustomerById(customerId) {
    return this.http.delete<any>('/api/customers/'+customerId).pipe(
      catchError(this.handleError)
    );
  }

  ///////////////////////////// PROVIDER SECTION /////////////////////////////

  addProvider(providerData) {
    return this.http.post<any>('/api/providers/add', providerData).pipe(
      catchError(this.handleError)
    );
  }

  updateProvider(providerData) {
    return this.http.put<any>('api/providers/update', providerData).pipe(
      catchError(this.handleError)
    );
  }

  getMyProviders() {
    return this.http.get<any>('/api/providers/').pipe(
      catchError(this.handleError)
    );
  }

  getProviderBySiret(providerSiret) {
    return this.http.get<any>('/api/providers/'+providerSiret).pipe(
      catchError(this.handleError)
    );
  }

  deleteProviderById(providerId) {
    return this.http.delete<any>('/api/providers/'+providerId).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred. Handle it accordingly.
    // console.error('An error occurred:', error.error.message);
    // } else {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong,
    // console.error(
    //   `Backend returned code ${error.status}, ` +
    //   `body was: ${error.error.message}`);
    // }
    // return an ErrorObservable with a user-facing error message
    return new ErrorObservable(
      error
    );
  };
}
