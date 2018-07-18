import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {AlertService} from '../../services/alert.service';
import {MatTableDataSource} from '@angular/material';

declare let paypal: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewChecked {
  displayContent = ['reference', 'label', 'unitPriceET', 'quantity', 'discount', 'totalPriceET'];
  displayIncomes = ['method', 'amount', 'dateIncome'];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults: boolean = true;
  isInvoiceReady: boolean = false;
  isPaypalAllowed: boolean = false;
  addScript: boolean = true;
  paramUser: string;
  paramInvoice: string;
  data: any;
  invoiceDataSource: MatTableDataSource<any>;
  payingAmount: number = 0;
  maxAmount: number = 0;
  errorMessage = '';
  paypalConfig = {
    env: 'sandbox',
    style: {
      label: 'pay',
      size:  'medium',
      shape: 'rect',
      color: 'blue'
    },
    payment: (data, actions) => {
      return actions.request.post('/api/payment/paypal/create', {
        user: this.paramUser,
        code: this.paramInvoice,
        amount: this.payingAmount
      }).then((res) => {
        return res.id;
      });
    },
    onAuthorize: (result, actions) => {
      return actions.request.post('/api/payment/paypal/execute', {
        user: this.paramUser,
        code: this.paramInvoice,
        amount: this.payingAmount,
        payment: result.paymentID,
        payer: result.payerID,
        data: result
      }).then((res) => {
        if (res.executeStatus !== 200)
          this.translate.get(['payment']).subscribe(translation => {
            this.alertService.error(translation.payment.paypal_error);
          });
        else if (res.incomeStatus !== 200)
          this.translate.get(['payment']).subscribe(translation => {
            this.alertService.error(translation.payment.income_error);
          });
        else {
          this.translate.get(['payment']).subscribe(translation => {
            this.alertService.error(translation.payment.paypal_success);
          });

          this.invoiceDataSource.data.push(res.data);
          this.invoiceDataSource._updateChangeSubscription();
        }
      });
    }
  };

  constructor(private route: ActivatedRoute, public translate: TranslateService, private alertService : AlertService, private dataService : DataService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.paramUser = this.route.snapshot.params.user;
    this.paramInvoice = this.route.snapshot.params.invoice;
  }

  ngOnInit() {
    this.getInvoicePayment();
  }

  ngAfterViewChecked(): void {
    if (this.isPaypalAllowed && this.addScript)
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#paypal-checkout-button');
      })
  }

  getInvoicePayment() {
    this.dataService.getInvoicePayment(this.paramUser, this.paramInvoice).subscribe(
      data => {
        this.isLoadingResults = false;
        this.isInvoiceReady = true;
        this.isPaypalAllowed = data.user.credentials;
        this.data = data;
        this.payingAmount = data.sumToPay;
        this.maxAmount = data.sumToPay;
        this.invoiceDataSource = new MatTableDataSource(this.data.incomes);
      },
      error => {
        this.isLoadingResults = false;
        this.errorMessage =  error.error.message;
      }
    );
  }

  addPaypalScript() {
    this.addScript = false;
    return new Promise((resolve, reject) => {
      let scriptTagElement = document.createElement('script');
      scriptTagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
      scriptTagElement.onload = resolve;
      document.body.appendChild(scriptTagElement);
    })
  }

  checkPayingAmount() {
    if (this.payingAmount > this.maxAmount)
      this.payingAmount = this.maxAmount;
    if (this.payingAmount < 1)
      this.payingAmount = 1;
  }
}
