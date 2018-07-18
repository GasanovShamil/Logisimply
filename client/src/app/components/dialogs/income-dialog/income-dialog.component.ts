import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {InvoiceDialogComponent} from "../invoice-dialog/invoice-dialog.component";
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from "@angular/material";
import {MediaMatcher} from "@angular/cdk/layout";
import {DataService} from "../../../services/data.service";
import {Income} from "../../../models/income";

@Component({
  selector: 'app-income-dialog',
  templateUrl: './income-dialog.component.html',
  styleUrls: ['./income-dialog.component.css']
})
export class IncomeDialogComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  incomeForm: FormGroup;
  close: boolean = false;
  incomeDataSource: MatTableDataSource<Income>;
  displayedColumns:string[];

  methodTypes = [
    {
      "name": "incomesDialog.payment_methods.asset",
      "value": "asset"
    },
    {
      "name": "incomesDialog.payment_methods.cash",
      "value": "cash"
    },
    {
      "name": "incomesDialog.payment_methods.check",
      "value": "check"
    },
    {
      "name": "incomesDialog.payment_methods.transfer",
      "value": "transfer"
    }];

  addIncome() {
    if(this.incomeForm.valid){
      this.dataService.addIncome(this.incomeForm.getRawValue()).subscribe(
        data => {
          this.alertService.success(data.message);
          this.incomeDataSource.data.push(data.data);
          this.incomeDataSource._updateChangeSubscription();
        },
        error => this.alertService.error(error.error.message)
      )
    }
  }

  constructor(private alertService: AlertService,
              private dataService: DataService,
              public translate: TranslateService,
              private changeDetectorRef: ChangeDetectorRef,
              private media: MediaMatcher,
              public dialogRef: MatDialogRef<IncomeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.setFormGroup();
    this.displayedColumns = ['method', 'dateIncome', 'amount'];
    this.incomeDataSource = new MatTableDataSource(this.data.incomes);
    this.incomeDataSource._updateChangeSubscription();
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
      dateIncome: new FormControl({value: new Date(), disabled: false}, [Validators.required]),
      user: new FormControl({value: this.data.user._id, disabled: false}, [Validators.required])
    });

  }

}

