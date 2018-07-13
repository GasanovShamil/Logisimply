import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTabChangeEvent, MatTableDataSource} from "@angular/material";
import {DataService} from "../../services/data.service";
import {AlertService} from "../../services/alert.service";
import {Customer} from "../../models/customer";
import {MediaMatcher} from "@angular/cdk/layout";
import {Provider} from "../../models/provider";
import {SelectionModel} from "@angular/cdk/collections";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog, MatDialogRef} from '@angular/material';
import {CustomerDialogComponent} from "../dialogs/customer-dialog/customer-dialog.component";
import {ProviderDialogComponent} from "../dialogs/provider-dialog/provider-dialog.component";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = false;
  displayedCustomerColumns = [];
  displayedProviderColumns = [];
  customerDataSource: MatTableDataSource<any>;
  providerDataSource: MatTableDataSource<any>;
  customers: Customer[] = [];
  providers: Provider[] = [];
  customerSelection = new SelectionModel<Customer>(true, []);
  providerSelection = new SelectionModel<Provider>(true, []);
  errorMessage = '';
  customer: Customer = new Customer();
  provider: Provider = new Provider();


  @ViewChild('customerPaginator') customerPaginator: MatPaginator;
  @ViewChild('customerSort') customerSort: MatSort;
  @ViewChild('providerPaginator') providerPaginator: MatPaginator;
  @ViewChild('providerSort') providerSort: MatSort;

  constructor(public dialog: MatDialog, public translate: TranslateService, private dataService : DataService, private alertService: AlertService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngAfterViewInit() {
  }

  applyCustomerFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.customerDataSource.filter = filterValue;
  }

  applyProviderFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.providerDataSource.filter = filterValue;
  }

  ngOnInit() {
    this.displayedCustomerColumns = (this.mobileQuery.matches)?['select','code', 'name',  'info']:['select','code', 'type', 'name', 'email', 'town', 'info'];
    this.displayedProviderColumns = (this.mobileQuery.matches)?['select','code', 'companyName', 'info']:['select','code', 'companyName', 'legalForm', 'email', 'town', 'info'];
    this.getCustomers();
  }

  getCustomers() {
    this.isLoadingResults = true;
    this.dataService.getMyCustomers().subscribe(
      data => {
        this.customers = data;
        this.customerDataSource = new MatTableDataSource(this.customers);
        this.customerDataSource.paginator = this.customerPaginator;
        this.customerDataSource.sort = this.customerSort;
        this.isLoadingResults = false;
      },
      error => {
        this.isLoadingResults = false;
        this.alertService.error(error.error.message)
      }
    );
  }


  getProviders() {
    this.isLoadingResults = true;
    this.dataService.getMyProviders().subscribe(
      data => {
        this.providers = data;
        this.providerDataSource = new MatTableDataSource(this.providers);
        this.providerDataSource.paginator = this.providerPaginator;
        this.providerDataSource.sort = this.providerSort;
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
        if (!this.customers || this.customers.length == 0) {
          this.getCustomers();
        }
        break;
      }
      case 1 : {
        if (!this.providers || this.providers.length == 0) {
          this.getProviders();
        }
        break;
      }
    }
  }

  isAllCustomersSelected() {
    const numSelected = this.customerSelection.selected.length;
    const numRows = this.customerDataSource.data.length;
    return numSelected === numRows;
  }

  isAllProvidersSelected() {
    const numSelected = this.providerSelection.selected.length;
    const numRows = this.providerDataSource.data.length;
    return numSelected === numRows;
  }

  customerToggle() {
    this.isAllCustomersSelected() ?
      this.customerSelection.clear() :
      this.customerDataSource.data.forEach(row => this.customerSelection.select(row));
  }
  providerToggle() {
    this.isAllProvidersSelected() ?
      this.providerSelection.clear() :
      this.providerDataSource.data.forEach(row => this.providerSelection.select(row));
  }


  onDeleteCustomerClick(){
    if(this.customerSelection.isEmpty()){
      this.translate.get(['contacts']).subscribe(translation => {
        this.errorMessage = translation.contacts.select_at_least_one;
        this.alertService.error(this.errorMessage);
      })
    } else {
      this.dataService.deleteCustomers(this.customerSelection.selected).subscribe(
        data => {
          this.customerSelection.selected.forEach(item => {
            let index: number = this.customerDataSource.data.findIndex(i => i === item);
            this.customerDataSource.data.splice(index, 1);
          })
          this.customerDataSource._updateChangeSubscription();
          this.customerSelection.clear();
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    }
  }

  onDeleteProviderClick(){
    if(this.providerSelection.isEmpty()){
      this.translate.get(['contacts']).subscribe(translation => {
        this.errorMessage = translation.contacts.select_at_least_one;
        this.alertService.error(this.errorMessage);
      })
    } else {
      this.dataService.deleteProviders(this.providerSelection.selected).subscribe(
        data => {
          this.providerSelection.selected.forEach(item => {
            let index: number = this.providerDataSource.data.findIndex(i => i === item);
            this.providerDataSource.data.splice(index, 1);
          })
          this.providerDataSource._updateChangeSubscription();
          this.providerSelection.clear();
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    }
  }

  openCustomerDialog(customer?: Customer): void {
    let dialogRef = this.dialog.open(CustomerDialogComponent, {
      maxWidth: '500px',
      minWidth: '100px',
      maxHeight: '95vh',
      data: (customer)?customer:null
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alertService.success(result.message);
        if(result.editMode){
          console.log(JSON.stringify(result.data));
          let index: number = this.customerDataSource.data.findIndex(i => i.code === result.data.code);
          this.customerDataSource.data.splice(index, 1, result.data);
          this.customerDataSource._updateChangeSubscription();
        } else {
          this.customerDataSource.data.push(result.data);
          this.customerDataSource._updateChangeSubscription();
        }
      }
    });
  }

  openProviderDialog(provider?: Provider): void {
    let dialogRef = this.dialog.open(ProviderDialogComponent, {
      maxWidth: '500px',
      minWidth: '100px',
      maxHeight: '95vh',
      data: (provider)?provider:null
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alertService.success(result.message);
        if(result.editMode){
          let index: number = this.providerDataSource.data.findIndex(i => i.code === result.data.code);
          this.providerDataSource.data.splice(index, 1, result.data);
          this.providerDataSource._updateChangeSubscription();
        } else {
          this.providerDataSource.data.push(result.data);
          this.providerDataSource._updateChangeSubscription();
        }
      }
    });
  }

}

