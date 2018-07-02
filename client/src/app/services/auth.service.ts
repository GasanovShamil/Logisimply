import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
//import {JwtHelperService } from '@auth0/angular-jwt';
//const config = require('../../../appconfig.json')
import { User } from "../models/user";

@Injectable()
export class AuthService {
  // // private config: any = config;
  // private jwtHelper = new JwtHelperService();
  constructor(private http: HttpClient) { }

  // isLogedIn(): boolean {
  //   let user = localStorage.getItem('currentUser');
  //   return (user)?true:false;
  // }
  //
  // getCurrentUser(): User {
  //   let user = new User();
  //   user = JSON.parse(localStorage.getItem('currentUser'));
  //   return user;
  // }
  //
  // login(loginData : JSON) {
  //   return this.http.post<any>("localhost:3000/login", loginData, {}).map(
  //     token => {
  //       let user = new User();
  //       user = this.jwtHelper.decodeToken(token).user;
  //       localStorage.setItem("access_token" , JSON.stringify(token));
  //       localStorage.setItem("currentUser", JSON.stringify(user));
  //     }
  //   )
  // }
  //
  // logout(){
  //   localStorage.removeItem("access_token");
  //   localStorage.removeItem("currentUser")
  // }



}
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
