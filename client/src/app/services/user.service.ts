import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {ErrorObservable} from "rxjs/observable/ErrorObservable";

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  addUser(userData) {
    return this.http.post<any>('/api/users/add', userData).pipe(
      catchError(this.handleError)
    );
  }

  activate(activateToken) {
    return this.http.get<any>('/api/users/activate/' + activateToken).pipe(
      catchError(this.handleError)
    );
  }

  stats() {
    return this.http.get<any>('/api/users/me').pipe(
      catchError(this.handleError)
    );
  }

  setCredentials(credentialsData) {
    return this.http.post<any>('api/users/credentials', credentialsData).pipe(
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
      error);
  };

}
