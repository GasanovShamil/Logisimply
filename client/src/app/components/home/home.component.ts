import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {AlertService} from '../../services/alert.service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../services/user.service';
import {Chart} from 'chart.js';
import {Customer} from "../../models/customer";
import {CustomerDialogComponent} from "../dialogs/customer-dialog/customer-dialog.component";
import {CredentialsDialogComponent} from "../dialogs/credentials-dialog/credentials-dialog.component";
import {MatDialog} from "@angular/material";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults: boolean = true;
  isUserReady: boolean = false;
  isPaypalAllowed: boolean = false;
  me: any;
  incomesPerCustomerTypeChart = [];
  // chart = [];
  // chart = [];
  errorMessage = '';
  @ViewChild('incomes-per-customer-type') incomesPerCustomerTypeCanvas: any;

  constructor(public translate: TranslateService, private alertService : AlertService, private userService : UserService, public dialog: MatDialog, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.getMe();
  }

  getMe() {
    this.userService.stats().subscribe(
      data => {
        this.isLoadingResults = false;
        this.isUserReady = true;
        this.me = data.me;
        this.isPaypalAllowed = data.me.credentials;
        //this.incomesPerCustomerType(data);
      },
      error => {
        this.isLoadingResults = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  openCredentialsDialog(): void {
    let config = this.mobileQuery.matches ? {maxWidth: '100%', minWidth: '100px'} : {width: '600px'};
    let dialogRef = this.dialog.open(CredentialsDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isPaypalAllowed = result.data.credentials;
        this.alertService.success(result.message);
      }
    });
  }

  // incomesPerCustomerType(data) {
  //   let privateColor = HomeComponent.randomColor();
  //   let professionnalColor = HomeComponent.randomColor();
  //   this.incomesPerCustomerTypeChart = new Chart(this.incomesPerCustomerTypeCanvas.getContext('2d'), {
  //     type: 'line',
  //     data: {
  //       labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  //       datasets: [{
  //         label: 'Private',
  //         backgroundColor: privateColor.fill,
  //         borderColor: privateColor.border,
  //         data: [1, 2, 4, 8, 16, 32, 64],
  //         fill: false,
  //       }, {
  //         label: 'Professionnal',
  //         fill: false,
  //         backgroundColor: professionnalColor.fill,
  //         borderColor: professionnalColor.border,
  //         data: [64, 32, 16, 8, 4, 2, 1],
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       title: {
  //         display: true,
  //         text: 'THIS IS THE TITLE : incomesPerCustomerType'
  //       },
  //       tooltips: {
  //         mode: 'index',
  //         intersect: false,
  //       },
  //       hover: {
  //         mode: 'nearest',
  //         intersect: true
  //       },
  //       scales: {
  //         xAxes: [{
  //           display: true,
  //           scaleLabel: {
  //             display: true,
  //             labelString: 'Month'
  //           }
  //         }],
  //         yAxes: [{
  //           display: true,
  //           scaleLabel: {
  //             display: true,
  //             labelString: 'Income'
  //           },
  //           ticks: {
  //             beginAtZero:true
  //           }
  //         }]
  //       }
  //     }
  //   });
  // }

  static randomColor() {
    let red = Math.round(Math.random() * 255);
    let green = Math.round(Math.random() * 255);
    let blue = Math.round(Math.random() * 255);
    return {fill: 'rgba(' + red + ', ' + green + ', ' + blue + ', 0.2)', border: 'rgba(' + red + ', ' + green + ', ' + blue + ', 1)'}
  }
}
