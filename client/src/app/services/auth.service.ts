import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import * as jwt_decode from "jwt-decode";
//const config = require('../../../appconfig.json');
import { User } from "../models/user";
import {catchError, tap} from "rxjs/operators";
import 'rxjs/add/operator/map';
import {ErrorObservable} from "rxjs/observable/ErrorObservable";

@Injectable()
export class AuthService {
  // // private config: any = config;
  // private jwtHelper = new JwtHelperService();
  constructor(private http: HttpClient) { }

  isLogedIn(): boolean {
    let user = localStorage.getItem('current_user');
    return (user)?true:false;
  }

  getCurrentUser(): User {
    let user = new User();
    user = JSON.parse(localStorage.getItem('current_user'));
    return user;
  }

  login(loginData) {
    return this.http.post<any>('/api/users/login', loginData)
      .map(data => {
        // login successful if there's a jwt token in the response
        if (data['token']) {
          let decoded_token = jwt_decode(data['token']);
          localStorage.setItem("access_token" , data['token']);
          localStorage.setItem("current_user", JSON.stringify(decoded_token));
        }
      }).pipe(
        catchError(this.handleError)
      );
  }

  logout(){
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user")
  }

  forgetPassword(data){
    return this.http.post<any>('/api/users/forgetPassword', data).pipe(
      catchError(this.handleError)
    );
  }

  resendActivationUrl(data){
    return this.http.post<any>('/api/users/resendActivationUrl', data).pipe(
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

