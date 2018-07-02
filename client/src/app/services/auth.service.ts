import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import * as jwt_decode from "jwt-decode";
//const config = require('../../../appconfig.json');
import { User } from "../models/user";
import {tap} from "rxjs/operators";
import {Observable} from "rxjs/Observable";

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
    return this.http.post("http://dockerhost:3000/api/login", loginData, {}).pipe(
      tap(
        data => {
          let user = new User();
          user = jwt_decode(data['token']).user;
          localStorage.setItem("access_token" , data['token']);
          localStorage.setItem("currentUser", JSON.stringify(user));
        },
        error => console.log(error)
      )
    )
  }

  // login(loginData) {
  //   return this.http.post("http://dockerhost:3000/api/login", loginData, {})
  // }

  logout(){
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser")
  }



}

// .map(
// token => {
//   let decoded_token = jwtDecode(token).user;
//   let user = new User();
//   user = decoded_token.user;
//   localStorage.setItem("access_token" , JSON.stringify(token));
//   localStorage.setItem("currentUser", JSON.stringify(user));
// }

// .pipe(
//   tap(
//     data => function(){
//       let user = new User();
//       user = this.jwtHelper.decodeToken(data).user;
//       localStorage.setItem("access_token" , data.toString());
//       localStorage.setItem("currentUser", JSON.stringify(user));
//     },
//     error => console.log(error)
//   )
