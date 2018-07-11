import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSlideToggleChange, MatOption} from '@angular/material';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.css']
})
export class CustomerDialogComponent implements OnInit {
  saveButton: boolean = true;
  editLablePosition = 'before';
  types = [
    {
      "name": "customerDialog.private_customer",
      "value": "private"
    },
    {
      "name": "customerDialog.professional_customer",
      "value": "professional"
    }];
  customerForm: FormGroup;
  constructor( public dialogRef: MatDialogRef<CustomerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

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
        type: new FormControl({value: this.data.type, disabled: true}, [Validators.required]),
        phone: new FormControl({value: this.data.phone, disabled: true}, []),
        email: new FormControl({value: this.data.email, disabled: true}, [Validators.required, Validators.email]),
        address: new FormControl({value: this.data.address, disabled: true}, [Validators.required]),
        zipCode: new FormControl({value: this.data.zipCode, disabled: true}, [Validators.required, Validators.maxLength(5), Validators.minLength(5)]),
        town: new FormControl({value: this.data.town, disabled: true}, [Validators.required]),
        country: new FormControl({value: this.data.country, disabled: true}, [Validators.required]),
        comment: new FormControl({value: this.data.comment, disabled: true}, [])
      });
    }else {
      this.customerForm = new FormGroup({
        code: new FormControl({disabled: true}, []),
        civility: new FormControl('', []),
        lastname: new FormControl('', [Validators.required]),
        firstname: new FormControl('', []),
        name: new FormControl('', [Validators.required]),
        legalForm: new FormControl('', []),
        siret: new FormControl('', [Validators.maxLength(14), Validators.minLength(14), Validators.pattern('^\\d+$')]),
        type: new FormControl({value: 'private', disabled: false}, [Validators.required]),
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


  onNoClick(): void {
    this.dialogRef.close();
  }

  submitData(){
    if(this.customerForm.valid){
      this.dialogRef.close(this.customerForm.value);
    } else {

    }

  }

  ngOnInit(): void {
    this.setFormGroup();
  }

  onSelectChange(element: string){
    this.customerForm.controls['type'].setValue(element);
  }

  editSliderChange(event: MatSlideToggleChange) {
    if (event.checked){
      this.customerForm.enable();
      this.saveButton = true;
    }else{
      this.customerForm.disable();
      this.saveButton = false;
    }
  }
}
