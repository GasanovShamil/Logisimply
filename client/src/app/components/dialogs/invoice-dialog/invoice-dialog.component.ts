import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Item} from "../../../models/item";
import {Content} from "../../../models/content";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {
  MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatDialog, MatDialogRef, MatSlideToggleChange,
  MatTableDataSource
} from "@angular/material";
import {Customer} from "../../../models/customer";
import {map, startWith} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {CustomerDialogComponent} from "../customer-dialog/customer-dialog.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../services/alert.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {DataService} from "../../../services/data.service";
import {Quote} from "../../../models/quote";
import {Invoice} from "../../../models/invoice";
import {IncomeDialogComponent} from "../income-dialog/income-dialog.component";

@Component({
  selector: 'app-invoice-dialog',
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.css']
})
export class InvoiceDialogComponent implements AfterViewInit, OnInit, OnDestroy {
  saveButton: boolean = (this.data) ? false : true;
  editLablePosition = 'before';
  invoiceForm: FormGroup;
  editMode: boolean = false;
  close: boolean = false;
  myCustomers: Customer[] = [];
  myItems: Item[] = [];
  filteredOptions: Observable<Customer[]>;
  filteredOptionsItem: Observable<Item[]>;
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  customerSelectSubscription: Subscription;
  itemSelectSubscription: Subscription;
  displayedColumns: string[];
  myContents: Content[] = [];
  mobile_content_error_message: string;
  contentDataSource = new MatTableDataSource(this.myContents);
  types = [{
    "name": "billsDialog.product",
    "value": "product"
  },
    {
      "name": "billsDialog.service",
      "value": "service"
    }];
  @ViewChild('inputCustomer', {read: MatAutocompleteTrigger}) trigger: MatAutocompleteTrigger;
  @ViewChild('inputItem', {read: MatAutocompleteTrigger}) triggerItem: MatAutocompleteTrigger;

  // @ViewChild('autoCustomer') trigger: MatAutocompleteTrigger;
  // @ViewChild('autoItem') triggerItem: MatAutocompleteTrigger;

  constructor(private alertService: AlertService,
              private dataService: DataService,
              private changeDetectorRef: ChangeDetectorRef,
              private media: MediaMatcher,
              public dialog: MatDialog,
              public translate: TranslateService,
              public dialogRef: MatDialogRef<InvoiceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.dataService.getMyCustomers().subscribe(
      data => {
        this.myCustomers = data;
      },
      error => {
        this.alertService.error(error.error.message);
      }
    )
    this.dataService.getMyItems().subscribe(
      data => {
        this.myItems = data;
      },
      error => {
        this.alertService.error(error.error.message);
      }
    )
    if (this.data) {
      this.contentDataSource.data = this.data.content;
      this.contentDataSource._updateChangeSubscription();
    }
    this.translate.get(['billsDialog']).subscribe(translation => {
      this.mobile_content_error_message = translation.billsDialog.mobile_content_error_message;
    })
  }

  ngOnInit(): void {
    this.displayedColumns = this.mobileQuery.matches ? ['delete', 'label', 'quantity'] : ['delete', 'reference', 'label', 'type', 'unitPriceET', 'quantity', 'discount'];
    this.setFormGroup();
    this.filteredOptions = this.invoiceForm.controls['customer'].valueChanges
      .pipe(
        startWith<string | Customer>(''),
        map(value => typeof value === 'string' ? value : (value) ? value.name : null),
        map(name => name ? this.filter(name) : this.myCustomers.slice())
      );

    this.filteredOptionsItem = this.invoiceForm.controls['itemRow'].valueChanges
      .pipe(
        startWith<string | Item>(''),
        map(value => typeof value === 'string' ? value : (value) ? value.label : null),
        map(label => label ? this.filterItem(label) : this.myItems.slice())
      );
  }

  ngAfterViewInit() {
    this._subscribeToClosingActions();
    this._subscribeToClosingActionsItem();
  }

  ngOnDestroy() {
    if (this.customerSelectSubscription && !this.customerSelectSubscription.closed) {
      this.customerSelectSubscription.unsubscribe();
    }
    if (this.itemSelectSubscription && !this.itemSelectSubscription.closed) {
      this.itemSelectSubscription.unsubscribe();
    }
  }

  private _subscribeToClosingActions(): void {
    if (this.customerSelectSubscription && !this.customerSelectSubscription.closed) {
      this.customerSelectSubscription.unsubscribe();
    }

    this.customerSelectSubscription = this.trigger.panelClosingActions
      .subscribe(e => {
          if (!e || !e.source) {
            this.invoiceForm.controls['customer'].setValue(null);
          }
        },
        err => this._subscribeToClosingActions(),
        () => this._subscribeToClosingActions());
  }

  private _subscribeToClosingActionsItem(): void {
    if (this.itemSelectSubscription && !this.itemSelectSubscription.closed) {
      this.itemSelectSubscription.unsubscribe();
    }

    this.itemSelectSubscription = this.triggerItem.panelClosingActions
      .subscribe(e => {
          if (!e || !e.source) {
            this.invoiceForm.controls['itemRow'].setValue(null);
          }
        },
        err => this._subscribeToClosingActionsItem(),
        () => this._subscribeToClosingActionsItem());
  }

  handler(event: MatAutocompleteSelectedEvent): void {
    this.invoiceForm.controls['customer'].setValue(event.option.value);
  }

  handlerItem(event: MatAutocompleteSelectedEvent): void {
    this.invoiceForm.controls['itemRow'].setValue(event.option.value);
  }

  filter(name: string): Customer[] {
    return this.myCustomers.filter(option =>
      option.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  filterItem(label: string): Item[] {
    return this.myItems.filter(option =>
      option.label.toLowerCase().indexOf(label.toLowerCase()) === 0);
  }

  displayFn(customer?: Customer): string | undefined {
    return customer ? customer.code + ' - ' + customer.name : undefined;
  }

  displayFnItem(item?: Item): string | undefined {
    return item ? item.reference + ' - ' + item.label : undefined;
  }

  editSliderChange(event: MatSlideToggleChange) {
    if (event.checked) {
      this.invoiceForm.enable();
      this.invoiceForm.controls['discount'].disable();
      this.invoiceForm.controls['sumToPay'].disable();
      this.invoiceForm.controls['totalPriceET'].disable();
      this.saveButton = true;
      this.editMode = true;
    } else {
      this.invoiceForm.disable();
      this.saveButton = false;
      this.editMode = false;
      this.setFormGroup();
    }
  }


  addItemRow() {
    let content = new Content();
    let itemRow: Item = this.invoiceForm.controls['itemRow'].value;
    if (this.mobileQuery.matches && !itemRow) {
      this.alertService.error(this.mobile_content_error_message);
    } else if (itemRow) {
      content.reference = itemRow.reference;
      content.unitPriceET = itemRow.priceET;
      content.type = itemRow.type;
      content.description = itemRow.description;
      content.label = itemRow.label;
      content.quantity = 1;
      this.invoiceForm.controls['itemRow'].setValue(null);
      this.contentDataSource.data.push(content);
      this.contentDataSource._updateChangeSubscription();
    } else {
      this.contentDataSource.data.push(content);
      this.contentDataSource._updateChangeSubscription();
    }
  }

  sendInvoice() {
    if (!this.close && !this.editMode) {
      this.dialogRef.close({data: this.data, sendMode: true})
    }
  }

  saveData() {
    if (!this.close) {
      if (this.invoiceForm.valid && this.contentDataSource.data.length > 0) {
        let invoice: Invoice = this.invoiceForm.getRawValue();
        invoice.customer = invoice.customer.code;
        invoice.content = this.contentDataSource.data;
        if (this.editMode) {
          this.dataService.updateInvoice(invoice).subscribe(
            data => this.dialogRef.close({
              data: data.data,
              message: data.message,
              editMode: this.editMode,
              sendMode: false
            }),
            error => this.alertService.error(error.error.message)
          )
        } else {
          this.dataService.addInvoice(invoice).subscribe(
            data => this.dialogRef.close({
              data: data.data,
              message: data.message,
              createMode: true
            }),
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

  setFormGroup() {
    if (this.data) {
      this.saveButton = false;
      this.invoiceForm = new FormGroup({
        code: new FormControl({value: this.data.code, disabled: true}, []),
        customer: new FormControl({value: this.data.customer, disabled: true}, [Validators.required]),
        dateInvoice: new FormControl({value: this.data.dateInvoice, disabled: true}, [Validators.required]),
        subject: new FormControl({value: this.data.subject, disabled: true}, []),
        content: new FormControl({value: this.data.content, disabled: true}, []),
        datePayment: new FormControl({value: this.data.datePayment, disabled: true}, [Validators.required]),
        dateExecution: new FormControl({value: this.data.dateExecution, disabled: true}, [Validators.required]),
        advancedPayment: new FormControl({value: this.data.advancedPayment, disabled: true}, [Validators.required]),
        collectionCost: new FormControl({value: this.data.collectionCost, disabled: true}, [Validators.required]),
        discount: new FormControl({value: this.data.discount, disabled: true}, []),
        sumToPay: new FormControl({value: this.data.sumToPay, disabled: true}, []),
        totalPriceET: new FormControl({value: this.data.totalPriceET, disabled: true}, []),
        comment: new FormControl({value: this.data.comment, disabled: true}, []),
        status: new FormControl({value: this.data.status, disabled: true}, []),
        itemRow: new FormControl({value: '', disabled: true}, [])
      });
    } else {
      this.invoiceForm = new FormGroup({
        code: new FormControl('', []),
        customer: new FormControl('', [Validators.required]),
        dateInvoice: new FormControl('', [Validators.required]),
        subject: new FormControl('', []),
        content: new FormControl('', []),
        datePayment: new FormControl('', [Validators.required]),
        dateExecution: new FormControl('', [Validators.required]),
        advancedPayment: new FormControl({value: 0, disabled: false}, [Validators.required]),
        collectionCost: new FormControl({value: false, disabled: false}, [Validators.required]),
        discount: new FormControl({value: '', disabled: true}, []),
        sumToPay: new FormControl({value: '', disabled: true}, []),
        totalPriceET: new FormControl({value: '', disabled: true}, []),
        comment: new FormControl('', []),
        status: new FormControl('', []),
        itemRow: new FormControl('', [])
      });
    }
  }

  onCloseClick(): void {
    this.close = true;
    this.dialogRef.close();
  }

  openCustomerDialog(customer?: Customer): void {
    if (this.editMode || this.saveButton) {
      let mobileDevice: boolean = this.mobileQuery.matches;
      let config = mobileDevice ? {
        maxWidth: '100%',
        minWidth: '100px',
        data: (customer) ? customer : null
      } : {width: '600px', data: (customer) ? customer : null};
      let dialogRef = this.dialog.open(CustomerDialogComponent, config);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.alertService.success(result.message);
          this.myCustomers.push(result.data);
          this.invoiceForm.controls['customer'].setValue(result.data);
        }
      });
    }
  }

  deleteItemRow(content: Content) {
    let index: number = this.contentDataSource.data.findIndex(i => i.reference === content.reference);
    this.contentDataSource.data.splice(index, 1);
    this.contentDataSource._updateChangeSubscription();
  }

  showIncomes(){
    if (!this.editMode || !this.saveButton) {
      let mobileDevice: boolean = this.mobileQuery.matches;
      let config = mobileDevice ? {
        maxWidth: '100%',
        minWidth: '100px',
        data: this.invoiceForm.getRawValue()
      } : {width: '600px', data: this.invoiceForm.getRawValue()};
      let dialogRef = this.dialog.open(IncomeDialogComponent, config);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {

        }
      });
    }
  }

  disable() {
    if (!this.editMode && this.saveButton) {
      return false;
    } else if (!this.editMode) {
      return true;
    }
  }
}
