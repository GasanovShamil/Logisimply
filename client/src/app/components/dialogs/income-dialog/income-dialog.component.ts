import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {InvoiceDialogComponent} from "../invoice-dialog/invoice-dialog.component";
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {MediaMatcher} from "@angular/cdk/layout";
import {DataService} from "../../../services/data.service";

@Component({
  selector: 'app-income-dialog',
  templateUrl: './income-dialog.component.html',
  styleUrls: ['./income-dialog.component.css']
})
export class IncomeDialogComponent implements OnInit {
  incomeForm: FormGroup;
  close:boolean= false;
  methodTypes = [{
    "name": "incomesDialog.payment_methods.advanced",
    "value": "advanced"
  },
    {
      "name": "incomesDialog.payment_methods.asset",
      "value": "asset"
    },
    {
      "name": "incomesDialog.payment_methods.paypal",
      "value": "paypal"
    },
    {
      "name": "incomesDialog.payment_methods.cash",
      "value": "cash"
    },
    {
      "name": "incomesDialog.payment_methods.check",
      "value": "check"
    }];

  addIncome(){}

  constructor(private alertService: AlertService,
              private dataService: DataService,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<IncomeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.setFormGroup();
  }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }
  setFormGroup() {
      this.incomeForm = new FormGroup({
        invoice: new FormControl({value: this.data.code, disabled: false}, [Validators.required]),
        method: new FormControl({value: '', disabled: false}, [Validators.required]),
        amount: new FormControl({value: '', disabled: false}, [Validators.required]),
        customer: new FormControl({value: this.data.customer.code, disabled: false}, [Validators.required]),
        dateIncome: new FormControl({value: '', disabled: false}, [Validators.required]),
      });

  }

}

