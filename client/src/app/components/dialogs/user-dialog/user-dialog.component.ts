import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  close: boolean = false;
  hide = true;

  constructor(private alertService: AlertService, private userService: UserService, public translate: TranslateService, public dialogRef: MatDialogRef<UserDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.setForm();
  }

  setForm() {
    this.userForm = new FormGroup ({
      email: new FormControl({value: this.data.email, disabled: false}, [Validators.required, Validators.email]),
      password: new FormControl({value: this.data.password, disabled: false}, [Validators.minLength(8)]),
      firstname: new FormControl({value: this.data.firstname, disabled: false}, [Validators.required]),
      lastname: new FormControl({value: this.data.lastname, disabled: false}, [Validators.required]),
      address: new FormControl({value: this.data.address, disabled: false}, [Validators.required]),
      zipCode: new FormControl({value: this.data.zipCode, disabled: false}, [Validators.required, Validators.maxLength(5), Validators.minLength(5),Validators.pattern('^\\d+$')]),
      town: new FormControl({value: this.data.town, disabled: false}, [Validators.required]),
      country: new FormControl({value: this.data.country, disabled: false}, [Validators.required]),
      activityType: new FormControl({value: this.data.activityType, disabled: false}, []),
      categoryType: new FormControl({value: this.data.categoryType, disabled: false}, []),
      activityEntitled: new FormControl({value: this.data.activityEntitled, disabled: false}, [Validators.required]),
      activityStarted: new FormControl({value: this.data.activityStarted, disabled: false}, [Validators.required]),
      siret: new FormControl({value: this.data.siret, disabled: false}, [Validators.required, Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$')])
    });
  }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }

  saveData() {
    if (!this.close) {
      if (this.userForm.valid) {
        this.userService.update(this.userForm.getRawValue()).subscribe(
          result => this.dialogRef.close({message: result.message, data: result.data, token: result.token}),
          error => this.alertService.success(error.error.message)
        )
      } else {
        this.translate.get(['credentialsDialog']).subscribe(translation => {
          this.alertService.error(translation.credentialsDialog.credentials_form_error_message);
        })
      }
    }
  }

}
