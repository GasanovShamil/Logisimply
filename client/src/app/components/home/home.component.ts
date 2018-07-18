import {ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import {AlertService} from '../../services/alert.service';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../services/user.service';
import {Chart} from 'chart.js';
import {CredentialsDialogComponent} from "../dialogs/credentials-dialog/credentials-dialog.component";
import {MatDialog} from "@angular/material";
import {UserDialogComponent} from "../dialogs/user-dialog/user-dialog.component";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isUserLoading: boolean = true;
  isUserReady: boolean = false;
  isPaypalAllowed: boolean = false;
  me: any;
  errorMessage = '';
  isIncomesPerCustomerTypeLoading: boolean = true;
  incomesPerCustomerTypeChart = [];
  isIncomesPerMethodLoading: boolean = true;
  incomesPerMethodChart = [];
  isPaymentStateOfInvoicesLoading: boolean = false;
  paymentStateOfInvoicesChart = [];

  constructor(public translate: TranslateService, private alertService : AlertService, private userService : UserService, private authService: AuthService, public dialog: MatDialog, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.getMe();
    this.getIncomesPerCustomerType();
    this.getIncomesPerMethod();
    //this.getPaymentStateOfInvoices();
  }

  getMe() {
    this.userService.getMe().subscribe(
      data => {
        this.isUserLoading = false;
        this.isUserReady = true;
        this.me = data;
        this.isPaypalAllowed = data.credentials;
      },
      error => {
        this.isUserLoading = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  getIncomesPerCustomerType() {
    this.userService.getIncomesPerCustomerType().subscribe(
      data => {
        this.isIncomesPerCustomerTypeLoading = false;
        this.incomesPerCustomerType(data);
      },
      error => {
        this.isIncomesPerCustomerTypeLoading = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  getIncomesPerMethod() {
    this.userService.getIncomesPerMethod().subscribe(
      data => {
        this.isIncomesPerMethodLoading = false;
        this.incomesPerMethod(data);
      },
      error => {
        this.isIncomesPerMethodLoading = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  getPaymentStateOfInvoices() {
    this.userService.getPaymentStateOfInvoices().subscribe(
      data => {
        this.isPaymentStateOfInvoicesLoading = false;
        this.paymentStateOfInvoices(data);
      },
      error => {
        this.isPaymentStateOfInvoicesLoading = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  openUserDialog(): void {
    let config = this.mobileQuery.matches ? {maxWidth: '100%', minWidth: '100px', data: this.me } : {width: '600px',  data: this.me};
    let dialogRef = this.dialog.open(UserDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.me = result.data;
        this.authService.updateToken(result.token);
        this.alertService.success(result.message);
      }
    });
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

  incomesPerCustomerType(data) {
    this.translate.get(['home']).subscribe(translation => {
      this.incomesPerCustomerTypeChart = new Chart('incomes-per-customer-type', {
        type: 'line',
        data: {
          labels: [
            translation.home.stats.month.jan,
            translation.home.stats.month.feb,
            translation.home.stats.month.mar,
            translation.home.stats.month.apr,
            translation.home.stats.month.may,
            translation.home.stats.month.jun,
            translation.home.stats.month.jul,
            translation.home.stats.month.aug,
            translation.home.stats.month.sep,
            translation.home.stats.month.oct,
            translation.home.stats.month.nov,
            translation.home.stats.month.dec
          ],
          datasets: [{
            label: translation.home.stats.incomes_per_customer_type.deleted,
            data: data.deleted,
            borderColor: 'rgba(254, 70, 70, 1)',
            fill: true
          }, {
            label: translation.home.stats.incomes_per_customer_type.privates,
            data: data.privates,
            borderColor: 'rgba(56, 206, 36, 1)',
            fill: true
          }, {
            label: translation.home.stats.incomes_per_customer_type.professionals,
            data: data.professionals,
            borderColor: 'rgba(251, 175, 33, 1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: translation.home.stats.incomes_per_customer_type.title
          },
          legend: {
            position: 'top',
          },
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: translation.home.stats.incomes_per_customer_type.x_axe
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: translation.home.stats.incomes_per_customer_type.y_axe
              },
              ticks: {
                beginAtZero:true
              }
            }]
          }
        }
      });
    });
  }

  incomesPerMethod(data) {
    this.translate.get(['home']).subscribe(translation => {
      this.incomesPerMethodChart = new Chart('incomes-per-method', {
        type: 'doughnut',
        data: {
          labels: [
            translation.home.stats.method.advanced,
            translation.home.stats.method.asset,
            translation.home.stats.method.paypal,
            translation.home.stats.method.transfer,
            translation.home.stats.method.cash,
            translation.home.stats.method.check
          ],
          datasets: [{
            data: [data.advanced, data.asset, data.paypal, data.transfer, data.cash, data.check],
            backgroundColor: ['rgba(136, 137, 141, 1)', 'rgba(122, 177, 154, 1)', 'rgba(0, 112, 186, 1)', 'rgba(94, 192, 249, 1)', 'rgba(235, 175 ,87, 1)', 'rgba(146, 154, 219, 1)'],
            fill: true
          }]
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: translation.home.stats.incomes_per_method.title
          },
          legend: {
            position: 'top',
          },
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    });
  }

  paymentStateOfInvoices(data) {
    this.translate.get(['home']).subscribe(translation => {
      this.paymentStateOfInvoicesChart = new Chart('payment-state-of-invoices', {
        type: 'bar',
        data: {
          labels: [
            translation.home.stats.month.jan,
            translation.home.stats.month.feb,
            translation.home.stats.month.mar,
            translation.home.stats.month.apr,
            translation.home.stats.month.may,
            translation.home.stats.month.jun,
            translation.home.stats.month.jul,
            translation.home.stats.month.aug,
            translation.home.stats.month.sep,
            translation.home.stats.month.oct,
            translation.home.stats.month.nov,
            translation.home.stats.month.dec
          ],
          datasets: [{
            label: translation.home.stats.payment_state_of_invoices.payed,
            data: data.payed,
            backgroundColor: 'rgba(56, 206, 36, 1)',
            fill: true
          }, {
            label: translation.home.stats.payment_state_of_invoices.sum_to_pay,
            data: data.sumToPay,
            backgroundColor: 'rgba(254, 70, 70, 1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: translation.home.stats.payment_state_of_invoices.title
          },
          legend: {
            position: 'top',
          },
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          }
        }
      });
    });
  }
}
