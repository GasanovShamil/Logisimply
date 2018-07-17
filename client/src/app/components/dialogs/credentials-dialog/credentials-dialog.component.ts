import {Component, Inject, OnInit} from '@angular/core';
import {AlertService} from "../../../services/alert.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {UserService} from "../../../services/user.service";

@Component({
  selector: 'app-credentials-dialog',
  templateUrl: './credentials-dialog.component.html',
  styleUrls: ['./credentials-dialog.component.css']
})
export class CredentialsDialogComponent implements OnInit {
  credentialsForm: FormGroup;
  close: boolean = false;

  constructor(private alertService: AlertService, private userService: UserService, public translate: TranslateService, public dialogRef: MatDialogRef<CredentialsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.setForm();
  }

  setForm() {
    this.credentialsForm = new FormGroup({
      client: new FormControl('', [Validators.required]),
      secret: new FormControl('', [Validators.required])
    });
  }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }

  saveData() {
    if (!this.close) {
      if (this.credentialsForm.valid) {
        this.userService.setCredentials(this.credentialsForm.getRawValue()).subscribe(
          data => this.dialogRef.close({message: data.message, data: data.data}),
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
