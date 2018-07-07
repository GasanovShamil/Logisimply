import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {DataService} from "../../services/data.service";
import {AlertService} from "../../services/alert.service";
import {Customer} from "../../models/customer";
import {MediaMatcher} from "@angular/cdk/layout";

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
  customerDataSource: MatTableDataSource<any>;
  contacts: Customer[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService : DataService, private alertService: AlertService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
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

  ngOnInit() {
    this.displayedCustomerColumns = (this.mobileQuery.matches)?['name', 'emailAddress']:['name', 'emailAddress', 'town', 'zipCode'];
    this.getCustomers();
  }

  getCustomers() {
    this.isLoadingResults = true;
    this.dataService.getMyCustomers().subscribe(
      data => {
        console.log(JSON.stringify(data));
        this.contacts = data;
        this.customerDataSource = new MatTableDataSource(this.contacts);
        this.customerDataSource.paginator = this.paginator;
        this.customerDataSource.sort = this.sort;
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

}

