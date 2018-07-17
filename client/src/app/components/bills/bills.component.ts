import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {MatDialog, MatPaginator, MatSort, MatTabChangeEvent, MatTableDataSource} from "@angular/material";
import {AlertService} from "../../services/alert.service";
import {DataService} from "../../services/data.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {SelectionModel} from "@angular/cdk/collections";
import {Quote} from "../../models/quote";
import {Invoice} from "../../models/invoice";
import {QuoteDialogComponent} from "../dialogs/quote-dialog/quote-dialog.component";
import {InvoiceDialogComponent} from "../dialogs/invoice-dialog/invoice-dialog.component";
import {Content} from "../../models/content";

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css']
})
export class BillsComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = false;
  displayedQuoteColumns = [];
  displayedInvoiceColumns = [];
  quoteDataSource: MatTableDataSource<any>;
  invoiceDataSource: MatTableDataSource<any>;
  quotes: Quote[] = [];
  invoices: Invoice[] = [];
  quoteSelection = new SelectionModel<Quote>(true, []);
  invoiceSelection = new SelectionModel<Invoice>(true, []);
  errorMessage = '';
  quote: Quote = new Quote();
  invoice: Invoice = new Invoice();


  @ViewChild('quotePaginator') quotePaginator: MatPaginator;
  @ViewChild('quoteSort') quoteSort: MatSort;
  @ViewChild('invoicePaginator') invoicePaginator: MatPaginator;
  @ViewChild('invoiceSort') invoiceSort: MatSort;

  constructor(public dialog: MatDialog, public translate: TranslateService, private dataService : DataService, private alertService: AlertService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngAfterViewInit() {
  }

  applyQuoteFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.quoteDataSource.filter = filterValue;
  }

  applyInvoiceFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.invoiceDataSource.filter = filterValue;
  }

  ngOnInit() {
    this.displayedQuoteColumns = (this.mobileQuery.matches)?['select','code', 'customer', 'info']:['select','code', 'subject', 'customer', 'dateQuote', 'datePayment','totalPriceET', 'status', 'info'];
    this.displayedInvoiceColumns = (this.mobileQuery.matches)?['select','code', 'customer', 'info']:['select','code', 'subject', 'customer', 'dateInvoice', 'datePayment','totalPriceET', 'status', 'info'];
    this.getQuotes();
  }

  getQuotes() {
    this.isLoadingResults = true;
    this.dataService.getMyQuotes().subscribe(
      data => {
        this.quotes = data;
        this.quoteDataSource = new MatTableDataSource(this.quotes);
        this.quoteDataSource.paginator = this.quotePaginator;
        this.quoteDataSource.sort = this.quoteSort;
        this.isLoadingResults = false;
      },
      error => {
        this.isLoadingResults = false;
        this.alertService.error(error.error.message)
      }
    );
  }


  getInvoices() {
    this.isLoadingResults = true;
    this.dataService.getMyInvoices().subscribe(
      data => {
        this.invoices = data;
        this.invoiceDataSource = new MatTableDataSource(this.invoices);
        this.invoiceDataSource.paginator = this.invoicePaginator;
        this.invoiceDataSource.sort = this.invoiceSort;
        this.isLoadingResults = false;
      },
      error => {
        this.isLoadingResults = false;
        this.alertService.error(error.error.message)
      }
    );
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }


  onTabChange(event: MatTabChangeEvent){
    switch(event.index){
      case 0 : {
        if (!this.quotes || this.quotes.length == 0) {
          this.getQuotes();
        }
        break;
      }
      case 1 : {
        if (!this.invoices || this.invoices.length == 0) {
          this.getInvoices();
        }
        break;
      }
    }
  }

  isAllQuotesSelected() {
    const numSelected = this.quoteSelection.selected.length;
    const numRows = this.quoteDataSource.data.length;
    return numSelected === numRows;
  }

  isAllInvoicesSelected() {
    const numSelected = this.invoiceSelection.selected.length;
    const numRows = this.invoiceDataSource.data.length;
    return numSelected === numRows;
  }

  quoteToggle() {
    this.isAllQuotesSelected() ?
      this.quoteSelection.clear() :
      this.quoteDataSource.data.forEach(row => this.quoteSelection.select(row));
  }
  invoiceToggle() {
    this.isAllInvoicesSelected() ?
      this.invoiceSelection.clear() :
      this.invoiceDataSource.data.forEach(row => this.invoiceSelection.select(row));
  }


  onDeleteQuoteClick(){
    if(this.quoteSelection.isEmpty()){
      this.translate.get(['bills']).subscribe(translation => {
        this.errorMessage = translation.bills.select_at_least_one;
        this.alertService.error(this.errorMessage);
      })
    } else {
      this.dataService.deleteQuotes(this.quoteSelection.selected).subscribe(
        data => {
          this.quoteSelection.selected.forEach(item => {
            let index: number = this.quoteDataSource.data.findIndex(i => i === item);
            this.quoteDataSource.data.splice(index, 1);
          })
          this.quoteDataSource._updateChangeSubscription();
          this.quoteSelection.clear();
          this.alertService.success(data.message);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    }
  }

  onDeleteInvoiceClick(){
    if(this.invoiceSelection.isEmpty()){
      this.translate.get(['bills']).subscribe(translation => {
        this.errorMessage = translation.bills.select_at_least_one;
        this.alertService.error(this.errorMessage);
      })
    } else {
      this.dataService.deleteInvoices(this.invoiceSelection.selected).subscribe(
        data => {
          this.invoiceSelection.selected.forEach(item => {
            let index: number = this.invoiceDataSource.data.findIndex(i => i === item);
            this.invoiceDataSource.data.splice(index, 1);
          })
          this.invoiceDataSource._updateChangeSubscription();
          this.invoiceSelection.clear();
          this.alertService.success(data.message);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    }
  }

  updateQuoteDataTable(quote: Quote){
    let index: number = this.quoteDataSource.data.findIndex(i => i.code === quote.code);
    this.quoteDataSource.data.splice(index, 1, quote);
    this.quoteDataSource._updateChangeSubscription();
  }
  updateInvoiceDataTable(invoice: Invoice){
    let index: number = this.invoiceDataSource.data.findIndex(i => i.code === invoice.code);
    this.invoiceDataSource.data.splice(index, 1, invoice);
    this.invoiceDataSource._updateChangeSubscription();
  }
  openQuoteDialog(quote?: Quote): void {
    let config = this.mobileQuery.matches? {maxWidth: '100%', minWidth: '100px', data: (quote)?quote:null }:{width: '600px',  data: (quote)?quote:null };
    let dialogRef = this.dialog.open(QuoteDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alertService.success(result.message);
        if(result.editMode){
          this.updateQuoteDataTable(result.data);
        } else if(result.sendMode){
          this.sendQuote(result.data);
        }else {
          this.quoteDataSource.data.push(result.data);
          this.quoteDataSource._updateChangeSubscription();
        }
      }
    });
  }

  openInvoiceDialog(invoice?: Invoice): void {
    let config = this.mobileQuery.matches? {maxWidth: '100%', minWidth: '100px', data: (invoice)?invoice:null }:{width: '600px',  data: (invoice)?invoice:null };
    let dialogRef = this.dialog.open(InvoiceDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alertService.success(result.message);
        if(result.editMode){
          let index: number = this.invoiceDataSource.data.findIndex(i => i.code === result.data.code);
          this.invoiceDataSource.data.splice(index, 1, result.data);
          this.invoiceDataSource._updateChangeSubscription();
        } else {
          this.invoiceDataSource.data.push(result.data);
          this.invoiceDataSource._updateChangeSubscription();
        }
      }
    });
  }

  sendQuote(quote: Quote){
    this.dataService.sendQuote(quote.code).subscribe(
      data => {
        console.log(data);
        this.alertService.success(data.message);
        this.updateQuoteDataTable(data.data);
      },
        error => {
        this.alertService.error(error.error.message);
        });
  }

  sendInvoice(invoice: Invoice){
    this.dataService.sendInvoice(invoice.code).subscribe(
      data => {
        console.log(data);
        this.alertService.success(data.message);
        this.updateInvoiceDataTable(data.data);
      },
      error => {
        this.alertService.error(error.error.message);
      });
  }

  downloadInvoice(invoice: Invoice){

  }

  downloadQuote(quote: Quote){
    this.dataService.downloadQuote(quote.code).subscribe(
      data => {},
      error => {
        this.alertService.error(error.error.message);
      }
    )
  }
}
