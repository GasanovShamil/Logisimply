import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
import {User} from "../../models/user";
import {AuthService} from "../../services/auth.service";
import * as jwt_decode from "jwt-decode";
import {AlertService} from "../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = true;
  user: User = new User();
  errorMessage: string;

  constructor(public translate: TranslateService, private router: Router, private auth: AuthService, private alertService: AlertService) { }

  ngOnInit() {
    if(this.auth.isLogedIn()){
      this.router.navigate(['/']);
    }
  }

  login() {
    if(this.user.email && this.user.password ){
      let loginData = {
        'email' : this.user.email,
        'password' : this.user.password
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

  forgotPassword() {
    if(!this.user.email){
      this.translate.get(['login']).subscribe(translation => {
        this.errorMessage = translation.login.enter_email_error;
        this.alertService.error(this.errorMessage, true);
      })
    }else{
      this.auth.forgetPassword({'email':this.user.email}).subscribe(
        data => {
          this.alertService.success(data.message);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )

    }
  }

  resendActivationEmail() {
    if(!this.user.email){
      this.translate.get(['login']).subscribe(translation => {
        this.errorMessage = translation.login.enter_email_error;
        this.alertService.error(this.errorMessage, true);
      })
    }else{
      this.auth.resendActivationUrl({'email':this.user.email}).subscribe(
        data => {
          this.alertService.success(data.message);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )

    }
  }
}
