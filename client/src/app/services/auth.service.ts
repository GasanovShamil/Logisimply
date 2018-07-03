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
    let user = localStorage.getItem('currentUser');
    return (user)?true:false;
  }

  getCurrentUser(): User {
    let user = new User();
    user = JSON.parse(localStorage.getItem('currentUser'));
    return user;
  }

  login(loginData) {
    return this.http.post<any>('/api/login', loginData)
      .map(data => {
        // login successful if there's a jwt token in the response
        if (data['token']) {
          let user = new User();
          let decoded_token = jwt_decode(data['token']);
          user = decoded_token.user;
          localStorage.setItem("access_token" , decoded_token);
          localStorage.setItem("currentUser", JSON.stringify(user));
          return user;
        }
      }).pipe(
        catchError(this.handleError)
      );
  }

  logout(){
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser")
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

