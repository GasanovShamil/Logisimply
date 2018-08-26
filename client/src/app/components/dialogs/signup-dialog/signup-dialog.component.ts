import {Component, Inject, OnInit} from '@angular/core';
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef, MatSlideToggleChange} from "@angular/material";
import {DataService} from "../../../services/data.service";
import {CustomerDialogComponent} from "../customer-dialog/customer-dialog.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../../services/user.service";


@Component({
  selector: 'app-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.css']
})
export class SignupDialogComponent implements OnInit {
  registerForm: FormGroup;
  close: boolean = false;
  hide = true;

  constructor(private alertService: AlertService,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<SignupDialogComponent>,
              private userService : UserService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }

  signup () {
    if(!this.close) {
      if (this.registerForm.valid) {
        this.userService.addUser(JSON.parse(JSON.stringify(this.registerForm.getRawValue()))).subscribe(
          data => {
            this.dialogRef.close({data: data.data, message: data.message});
          },
          error => {
            this.alertService.error(error.error.message);
          }
        );
      } else {
        this.translate.get(['signup']).subscribe(translation => {
          let errorMessage = translation.signup.create_form_error_message;
          this.alertService.error(errorMessage);
        })
      }
    }
  }

  ngOnInit(): void {
    this.setFormGroup();
  }

  setFormGroup() {
    this.registerForm = new FormGroup ({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      lastname: new FormControl('', [Validators.required]),
      firstname: new FormControl('', [Validators.required]),
      activityType: new FormControl('', []),
      categoryType: new FormControl('', []),
      activityEntitled: new FormControl('', [Validators.required]),
      activityStarted: new FormControl('', [Validators.required]),
      siret: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$')]),
      address: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(5),Validators.pattern('^\\d+$')]),
      town: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
    });
  }

}
