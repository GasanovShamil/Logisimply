import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from "@angular/material";
import {DataService} from "../../services/data.service";
import {AlertService} from "../../services/alert.service";
import {Customer} from "../../models/customer";

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  displayedColumns = ['name', 'emailAddress', 'town', 'zipCode'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private dataService : DataService, private alertService: AlertService) {

    let contacts: Customer[] = [];

    this.dataService.getMyCustomers().subscribe(
      data => {
        contacts = data;
        this.dataSource = new MatTableDataSource(contacts);
      },
      error => this.alertService.error(error.error.message)
    );
    // Assign the data to the data source for the table to render

  }

  /**
   * Set the paginator and sort after the view init since this component will
   * be able to query its view for the initialized paginator and sort.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
  }

}

