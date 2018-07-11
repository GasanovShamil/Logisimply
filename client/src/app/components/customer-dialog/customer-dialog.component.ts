import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSlideToggleChange, MatOption} from '@angular/material';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../services/alert.service";
import {DataService} from "../../services/data.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.css']
})
export class CustomerDialogComponent implements OnInit {
  saveButton: boolean = (this.data)?false:true;
  editLablePosition = 'before';
  customerForm: FormGroup;
  editMode: boolean = false;

  types = [
    {
      "name": "customerDialog.private_customer",
      "value": "private"
    },
    {
      "name": "customerDialog.professional_customer",
      "value": "professional"
    }];

  constructor(private alertService: AlertService,
              private dataService: DataService,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<CustomerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  saveData(){
    this.updateDynamicControls(this.customerForm.controls['type'].value);
    if (this.customerForm.valid) {
      if(this.editMode){
        this.dataService.updateCustomer(this.customerForm.getRawValue()).subscribe(
          data => this.dialogRef.close({ data: data.data, message: data.message, editMode: this.editMode }),
          error => this.alertService.error(error.error.message)
        )
      }else{
        this.dataService.addCustomer(this.customerForm.getRawValue()).subscribe(
          data => this.dialogRef.close(data),
          error => this.alertService.error(error.error.message)
        )
      }
    } else {
      this.translate.get(['customerDialog']).subscribe(translation => {
       let errorMessage = translation.customerDialog.customer_form_error_message;
        this.alertService.error(errorMessage);
      })
    }
  }

  ngOnInit(): void {
    this.setFormGroup();
  }

  onSelectChange(element: string){
    this.updateDynamicControls(element);
    this.customerForm.controls['type'].setValue(element);
  }

  editSliderChange(event: MatSlideToggleChange) {
    if (event.checked){
      this.customerForm.enable();
      this.saveButton = true;
      this.editMode = true;
    }else{
      this.customerForm.disable();
      this.saveButton = false;
      this.editMode = false;
      this.setFormGroup();
    }
  }

  setFormGroup(){
    if(this.data){
      this.saveButton = false;
      this.customerForm = new FormGroup({
        code: new FormControl({value: this.data.code, disabled: true}, []),
        civility: new FormControl({value: this.data.civility, disabled: true}, []),
        lastname: new FormControl({value: this.data.lastname, disabled: true}, [Validators.required]),
        firstname: new FormControl({value: this.data.firstname, disabled: true}, []),
        name: new FormControl({value: this.data.name, disabled: true}, [Validators.required]),
        legalForm: new FormControl({value: this.data.legalForm, disabled: true}, []),
        siret: new FormControl({value: this.data.siret, disabled: true}, [Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$')]),
        type: new FormControl({value: this.data.type, disabled: true}, []),
        phone: new FormControl({value: this.data.phone, disabled: true}, []),
        email: new FormControl({value: this.data.email, disabled: true}, [Validators.required, Validators.email]),
        address: new FormControl({value: this.data.address, disabled: true}, [Validators.required]),
        zipCode: new FormControl({value: this.data.zipCode, disabled: true}, [Validators.required, Validators.maxLength(5), Validators.minLength(5)]),
        town: new FormControl({value: this.data.town, disabled: true}, [Validators.required]),
        country: new FormControl({value: this.data.country, disabled: true}, [Validators.required]),
        comment: new FormControl({value: this.data.comment, disabled: true}, [])
      });
    } else {
      this.customerForm = new FormGroup({
        code: new FormControl('', []),
        civility: new FormControl('', []),
        lastname: new FormControl('', [Validators.required]),
        firstname: new FormControl('', []),
        name: new FormControl('', [Validators.required]),
        legalForm: new FormControl('', []),
        siret: new FormControl('', [Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$')]),
        type: new FormControl({value: 'private', disabled: false}, []),
        phone: new FormControl('', []),
        email: new FormControl('', [Validators.required, Validators.email]),
        address: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(5)]),
        town: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        comment: new FormControl('', [])
      });
    }
  }

  updateDynamicControls(type: string){
    switch(type){
      case 'private' : {
        this.customerForm.controls['civility'].enable();
        this.customerForm.controls['lastname'].enable();
        this.customerForm.controls['firstname'].enable();
        this.customerForm.controls['name'].disable();
        this.customerForm.controls['legalForm'].disable();
        this.customerForm.controls['siret'].disable();
        break;
      }
      case 'professional' : {
        this.customerForm.controls['name'].enable();
        this.customerForm.controls['legalForm'].enable();
        this.customerForm.controls['siret'].enable();
        this.customerForm.controls['civility'].disable();
        this.customerForm.controls['lastname'].disable();
        this.customerForm.controls['firstname'].disable();
      }
    }
  }
}
