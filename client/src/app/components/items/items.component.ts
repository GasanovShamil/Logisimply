import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatPaginator, MatSort, MatTabChangeEvent, MatTableDataSource} from "@angular/material";
import {SelectionModel} from "@angular/cdk/collections";
import {MediaMatcher} from "@angular/cdk/layout";
import {DataService} from "../../services/data.service";
import {TranslateService} from "@ngx-translate/core";
import {AlertService} from "../../services/alert.service";
import {Item} from "../../models/item";
import {ItemDialogComponent} from "../dialogs/item-dialog/item-dialog.component";

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = false;
  displayedItemColumns = [];
  itemDataSource: MatTableDataSource<any>;
  items: Item[] = [];
  itemSelection = new SelectionModel<Item>(true, []);
  errorMessage = '';
  item: Item = new Item();


  @ViewChild('itemPaginator') itemPaginator: MatPaginator;
  @ViewChild('itemSort') itemSort: MatSort;

  constructor(public dialog: MatDialog, public translate: TranslateService, private dataService : DataService, private alertService: AlertService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngAfterViewInit() {
  }

  applyItemFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.itemDataSource.filter = filterValue;
  }

  ngOnInit() {
    this.displayedItemColumns = (this.mobileQuery.matches)?['select', 'label', 'priceET', 'info']:['select','reference','type', 'label', 'priceET', 'info'];
    this.getItems();
  }

  getItems() {
    this.isLoadingResults = true;
    this.dataService.getMyItems().subscribe(
      data => {
        this.items = data;
        this.itemDataSource = new MatTableDataSource(this.items);
        this.itemDataSource.paginator = this.itemPaginator;
        this.itemDataSource.sort = this.itemSort;
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

  isAllItemsSelected() {
    const numSelected = this.itemSelection.selected.length;
    const numRows = this.itemDataSource.data.length;
    return numSelected === numRows;
  }

  itemToggle() {
    this.isAllItemsSelected() ?
      this.itemSelection.clear() :
      this.itemDataSource.data.forEach(row => this.itemSelection.select(row));
  }

  onDeleteItemClick(){
    if(this.itemSelection.isEmpty()){
      this.translate.get(['contacts']).subscribe(translation => {
        this.errorMessage = translation.contacts.select_at_least_one;
        this.alertService.error(this.errorMessage);
      })
    } else {
      this.dataService.deleteItems(this.itemSelection.selected).subscribe(
        data => {
          this.itemSelection.selected.forEach(item => {
            let index: number = this.itemDataSource.data.findIndex(i => i === item);
            this.itemDataSource.data.splice(index, 1);
          })
          this.itemDataSource._updateChangeSubscription();
          this.itemSelection.clear();
          this.alertService.success(data.message);
        },
        error => {
          this.alertService.error(error.error.message);
        }
      )
    }
  }

  openItemDialog(item?: Item): void {
    let mobileDevice: boolean = this.mobileQuery.matches;
    let config = mobileDevice? {maxWidth: '100%', minWidth: '100px', maxHeight: '85vh', data: (item)?item:null }:{width: '600px', maxHeight: '85vh', data: (item)?item:null };
    let dialogRef = this.dialog.open(ItemDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.alertService.success(result.message);
        if(result.editMode){
          console.log(JSON.stringify(result.data));
          let index: number = this.itemDataSource.data.findIndex(i => i.reference === result.data.reference);
          this.itemDataSource.data.splice(index, 1, result.data);
          this.itemDataSource._updateChangeSubscription();
        } else {
          this.itemDataSource.data.push(result.data);
          this.itemDataSource._updateChangeSubscription();
        }
      }
    });
  }
}
