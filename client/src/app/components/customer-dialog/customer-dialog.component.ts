import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.css']
})
export class CustomerDialogComponent implements OnInit {

  customerForm: FormGroup;
  constructor( public dialogRef: MatDialogRef<CustomerDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  setFormGroup(){
    this.customerForm = new FormGroup ({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      lastname: new FormControl('', [Validators.required]),
      firstname: new FormControl('', [Validators.required]),
      activityType: new FormControl('', []),
      categoryType: new FormControl('', []),
      activityEntitled: new FormControl('', [Validators.required]),
      activityStarted: new FormControl('', [Validators.required]),
      siret: new FormControl('', [Validators.required, Validators.maxLength(14), Validators.minLength(14)]),
      address: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(5)]),
      town: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
    });
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  submitData(){
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
