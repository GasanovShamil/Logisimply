import {Component, Inject, OnInit} from '@angular/core';
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {UserService} from "../../../services/user.service";
import {DataService} from "../../../services/data.service";
import {CustomerDialogComponent} from "../customer-dialog/customer-dialog.component";
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {
  close: boolean = false;
  hide = true;
  email: string;
  password: string;
  emailErrorMessage: string;
  formErrorMessage: string;
  loginForm: FormGroup;

  constructor(private alertService: AlertService,
              private auth: AuthService,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<LoginDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }


  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }

  ngOnInit() {
    this.setFormGroup();
    this.translate.get(['login']).subscribe(translation => {
      this.emailErrorMessage = translation.login.enter_email_error;
      this.formErrorMessage = translation.login.login_form_error_message;
    })
  }

  login() {
    if (!this.close) {
      if (this.loginForm.valid) {
        this.auth.login(this.loginForm.getRawValue()).subscribe(
          data => {
            this.dialogRef.close({data: data});
          },
          error => {
            this.alertService.error(error.error.message);
          }
        );
      }else {
        this.alertService.error(this.formErrorMessage);

      }
    }
  }

  forgotPassword() {
    if (!this.email) {
      this.alertService.error(this.emailErrorMessage);
    } else {
      this.auth.forgetPassword({'email': this.email}).subscribe(
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
    if (!this.email) {
      this.alertService.error(this.emailErrorMessage);
    } else {
      this.auth.resendActivationUrl({'email': this.email}).subscribe(
        data => {
          this.alertService.success(data.message);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )

    }
  }

  setFormGroup() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    });
  }
}
