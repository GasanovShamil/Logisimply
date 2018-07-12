import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {CustomerDialogComponent} from "../customer-dialog/customer-dialog.component";
import {MAT_DIALOG_DATA, MatDialogRef, MatSlideToggleChange} from "@angular/material";
import {DataService} from "../../../services/data.service";

@Component({
  selector: 'app-provider-dialog',
  templateUrl: './provider-dialog.component.html',
  styleUrls: ['./provider-dialog.component.css']
})
export class ProviderDialogComponent implements OnInit {
  saveButton: boolean = (this.data)?false:true;
  editLablePosition = 'before';
  providerForm: FormGroup;
  editMode: boolean = false;
  close: boolean = false;



  constructor(private alertService: AlertService,
              private dataService: DataService,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<CustomerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }

  saveData(){
    if(!this.close) {
      if (this.providerForm.valid) {
        if (this.editMode) {
          this.dataService.updateProvider(this.providerForm.getRawValue()).subscribe(
            data => this.dialogRef.close({data: data.data, message: data.message, editMode: this.editMode}),
            error => this.alertService.error(error.error.message)
          )
        } else {
          this.dataService.addProvider(this.providerForm.getRawValue()).subscribe(
            data => this.dialogRef.close(data),
            error => this.alertService.error(error.error.message)
          )
        }
      } else {
        this.translate.get(['contactsDialog']).subscribe(translation => {
          let errorMessage = translation.contactsDialog.contacts_form_error_message;
          this.alertService.error(errorMessage);
        })
      }
    }
  }

  ngOnInit(): void {
    this.setFormGroup();
  }

  editSliderChange(event: MatSlideToggleChange) {
    if (event.checked){
      this.providerForm.enable();
      this.saveButton = true;
      this.editMode = true;
    }else{
      this.providerForm.disable();
      this.saveButton = false;
      this.editMode = false;
      this.setFormGroup();
    }
  }

  setFormGroup(){
    if(this.data){
      this.saveButton = false;
      this.providerForm = new FormGroup({
        code: new FormControl({value: this.data.code, disabled: true}, []),
        companyName: new FormControl({value: this.data.companyName, disabled: true}, [Validators.required]),
        legalForm: new FormControl({value: this.data.legalForm, disabled: true}, [Validators.required]),
        siret: new FormControl({value: this.data.siret, disabled: true}, [Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$'),Validators.required]),
        phone: new FormControl({value: this.data.phone, disabled: true}, []),
        email: new FormControl({value: this.data.email, disabled: true}, [Validators.required, Validators.email]),
        website: new FormControl({value: this.data.website, disabled: true}, [Validators.pattern('(http(s)?://)?([\\w-]+\\.)+[\\w-]+[.com]+(/[/?%&=]*)?')]),
        address: new FormControl({value: this.data.address, disabled: true}, [Validators.required]),
        zipCode: new FormControl({value: this.data.zipCode, disabled: true}, [Validators.required, Validators.maxLength(5), Validators.minLength(5),Validators.pattern('^\\d+$'),Validators.pattern('^\\d+$')]),
        town: new FormControl({value: this.data.town, disabled: true}, [Validators.required]),
        country: new FormControl({value: this.data.country, disabled: true}, [Validators.required])
      });
    } else {
      this.providerForm = new FormGroup({
        code: new FormControl('', []),
        companyName: new FormControl('', [Validators.required]),
        legalForm: new FormControl('', [Validators.required]),
        siret: new FormControl('', [Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$'),Validators.required]),
        phone: new FormControl('', []),
        email: new FormControl('', [Validators.required, Validators.email]),
        website: new FormControl('', [Validators.pattern('(http(s)?://)?([\\w-]+\\.)+[\\w-]+[.com]+(/[/?%&=]*)?')]),
        address: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(5),Validators.pattern('^\\d+$')]),
        town: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required])
      });
    }
  }
}
