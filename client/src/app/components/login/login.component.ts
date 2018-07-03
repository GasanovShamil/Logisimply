import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
import {User} from "../../models/user";
import {AuthService} from "../../services/auth.service";
import * as jwt_decode from "jwt-decode";
import {AlertService} from "../../services/alert.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  user: User = new User();
  constructor(private router: Router, private auth: AuthService, private alertService: AlertService) { }

  ngOnInit() {
    if(this.auth.isLogedIn()){
      this.router.navigate(['/']);
    }
  }

  login() {
    if(this.user.emailAddress && this.user.password ){
      let loginData = {
        'email' : this.user.emailAddress,
        "password" : this.user.password
      }
      this.auth.login(loginData).subscribe(
        data =>{
          this.router.navigate(['/']);
        },
        error => {
          console.log(error.status + ' : ' + error.error.message);
          this.alertService.error(error.error.message);
        }
      );


    }
  }
 /* emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);*/

  // login() {
  //   if(this.user.email && this.user.password ){
  //     let loginData = {
  //       'email' : this.user.email,
  //       "password" : this.user.password
  //     }
  //     this.auth.login(loginData).subscribe(
  //       data =>{
  //         let decoded_token = jwt_decode(data['token']);
  //         console.log('DEBUG : '+data['token']);
  //         let user = new User();
  //         user = decoded_token.user;
  //         localStorage.setItem("access_token" , JSON.stringify(data['token']));
  //         localStorage.setItem("currentUser", JSON.stringify(user));
  //         this.router.navigate(['/']);
  //       }
  //     );
  //
  //
  //   }
  // }
}
