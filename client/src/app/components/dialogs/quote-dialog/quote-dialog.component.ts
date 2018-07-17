import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../services/alert.service";
import {TranslateService} from "@ngx-translate/core";
import {
  MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatDialog, MatDialogRef,
  MatSlideToggleChange, MatTableDataSource
} from "@angular/material";
import {DataService} from "../../../services/data.service";
import {CustomerDialogComponent} from "../customer-dialog/customer-dialog.component";
import {Customer} from "../../../models/customer";
import {Observable} from "rxjs/Observable";
import {startWith} from "rxjs/operators";
import {map} from 'rxjs/operators';
import {MediaMatcher} from "@angular/cdk/layout";
import {Subscription} from "rxjs/Subscription";
import {Item} from "../../../models/item";
import {Content} from "../../../models/content";

@Component({
  selector: 'app-quote-dialog',
  templateUrl: './quote-dialog.component.html',
  styleUrls: ['./quote-dialog.component.css']
})
export class QuoteDialogComponent implements AfterViewInit, OnInit, OnDestroy {
  saveButton: boolean = (this.data) ? false : true;
  editLablePosition = 'after';
  quoteForm: FormGroup;
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
              public dialogRef: MatDialogRef<QuoteDialogComponent>,
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
    this.displayedColumns = this.mobileQuery.matches ? ['delete','label', 'quantity'] : ['delete','reference', 'label', 'type', 'unitPriceET', 'quantity', 'discount'];
    this.setFormGroup();
    this.filteredOptions = this.quoteForm.controls['customer'].valueChanges
      .pipe(
        startWith<string | Customer>(''),
        map(value => typeof value === 'string' ? value : (value) ? value.name : null),
        map(name => name ? this.filter(name) : this.myCustomers.slice())
      );

    this.filteredOptionsItem = this.quoteForm.controls['itemRow'].valueChanges
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
            this.quoteForm.controls['customer'].setValue(null);
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
            this.quoteForm.controls['itemRow'].setValue(null);
          }
        },
        err => this._subscribeToClosingActionsItem(),
        () => this._subscribeToClosingActionsItem());
  }

  handler(event: MatAutocompleteSelectedEvent): void {
    this.quoteForm.controls['customer'].setValue(event.option.value);
  }

  handlerItem(event: MatAutocompleteSelectedEvent): void {
    this.quoteForm.controls['itemRow'].setValue(event.option.value);
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
      this.quoteForm.enable();
      this.saveButton = true;
      this.editMode = true;
    } else {
      this.quoteForm.disable();
      this.saveButton = false;
      this.editMode = false;
      this.setFormGroup();
    }
  }


  addItemRow() {
    let content = new Content();
    let itemRow: Item = this.quoteForm.controls['itemRow'].value;
    if (this.mobileQuery.matches && !itemRow) {
      this.alertService.error(this.mobile_content_error_message);
    } else if (itemRow) {
      content.reference = itemRow.reference;
      content.unitPriceET = itemRow.priceET;
      content.type = itemRow.type;
      content.description = itemRow.description;
      content.label = itemRow.label;
      content.quantity = 1;
      this.quoteForm.controls['itemRow'].setValue(null);
      this.contentDataSource.data.push(content);
      this.contentDataSource._updateChangeSubscription();
    } else {
      this.contentDataSource.data.push(content);
      this.contentDataSource._updateChangeSubscription();
    }
  }

  sendQuote() {
    if (!this.close && !this.editMode) {
      this.dialogRef.close({data: this.data, sendMode: true})
    }
  }

  saveData() {
    if (!this.close) {
      if (this.quoteForm.valid && this.contentDataSource.data.length > 0) {
        this.quoteForm.controls['customer'].setValue(this.quoteForm.controls['customer'].value.code);
        this.quoteForm.controls['content'].setValue(this.contentDataSource.data);
        if (this.editMode) {
          this.dataService.updateQuote(this.quoteForm.getRawValue()).subscribe(
            data => this.dialogRef.close({
              data: data.data,
              message: data.message,
              editMode: this.editMode,
              sendMode: false
            }),
            error => this.alertService.error(error.error.message)
          )
        } else {
          this.dataService.addQuote(this.quoteForm.getRawValue()).subscribe(
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

  generateInvoice(){
    this.data.customer = this.data.customer.code;
    this.dataService.generateInvoiceFromQuote(this.data).subscribe(
      data =>this.dialogRef.close({
        generateInvoiceMode: true,
        data: data.data,
        message: data.data.code+' : '+data.message
      }),
      error => this.alertService.error(error.error.message)
    )

  }

  setFormGroup() {
    if (this.data) {
      this.saveButton = false;
      this.quoteForm = new FormGroup({
        code: new FormControl({value: this.data.code, disabled: true}, []),
        customer: new FormControl({value: this.data.customer, disabled: true}, [Validators.required]),
        dateQuote: new FormControl({value: this.data.dateQuote, disabled: true}, [Validators.required]),
        subject: new FormControl({value: this.data.subject, disabled: true}, []),
        content: new FormControl({value: this.data.content, disabled: true}, []),
        datePayment: new FormControl({value: this.data.datePayment, disabled: true}, [Validators.required]),
        validity: new FormControl({
          value: this.data.validity,
          disabled: true
        }, [Validators.pattern('^\\d+$'), Validators.required]),
        collectionCost: new FormControl({value: this.data.collectionCost, disabled: true}, [Validators.required]),
        comment: new FormControl({value: this.data.comment, disabled: true}, []),
        status: new FormControl({value: this.data.status, disabled: true}, []),
        itemRow: new FormControl({value: '', disabled: true}, [])
      });
    } else {
      this.quoteForm = new FormGroup({
        code: new FormControl('', []),
        customer: new FormControl('', [Validators.required]),
        dateQuote: new FormControl('', [Validators.required]),
        subject: new FormControl('', []),
        content: new FormControl('', []),
        datePayment: new FormControl('', [Validators.required]),
        validity: new FormControl('', [Validators.pattern('^\\d+$'), Validators.required]),
        collectionCost: new FormControl({value: false, disabled: false}, [Validators.required]),
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
          this.quoteForm.controls['customer'].setValue(result.data);
        }
      });
    }
  }

  deleteItemRow(content:Content){
    let index: number = this.contentDataSource.data.findIndex(i => i.reference === content.reference);
    this.contentDataSource.data.splice(index, 1);
    this.contentDataSource._updateChangeSubscription();
  }

  disable() {
    if (!this.editMode && this.saveButton) {
      return false;
    } else if (!this.editMode) {
      return true;
    }
  }
}

