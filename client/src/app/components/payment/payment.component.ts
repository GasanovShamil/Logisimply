import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {MediaMatcher} from '@angular/cdk/layout';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AlertService} from '../../services/alert.service';

declare let paypal: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, AfterViewChecked {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = true;
  isInvoiceReady = false;
  isPaypalAllowed = false;
  canAuthorizePayment = false;
  addScript: boolean = true;
  paramUser: string;
  paramInvoice: string;
  data = new Observable();
  credentials = 'default';
  payingAmount = 0;
  errorMessage = '';
  displayContent = ['reference', 'label', 'unitPriceET', 'quantity', 'discount', 'totalPriceET'];
  displayIncomes = ['method', 'amount', 'dateIncome'];
  paypalConfig = {
    env: 'sandbox',
    client: {
      sandbox: this.credentials
    },
    commit: true,
    payment: function(data, actions) {
      return actions.payment.create({
        payment: {
          transactions: [{
            amount: {
              total: this.payingAmount,
              currency: 'EUR'
            }
          }]
        }
      });
    },
    onAuthorize: function(data, actions) {
      return actions.payment.execute().then((payment) => {
        this.alertService.success("YEAH");
      })
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
    this.translate.use('fr');
    localStorage.setItem('Localize', 'fr');
    this.getInvoicePayment();
  }

  ngAfterViewChecked(): void {
    if (this.addScript)
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#paypal-checkout-button');
      })
  }

  getInvoicePayment() {
    this.dataService.getInvoicePayment(this.paramUser, this.paramInvoice).subscribe(
      data => {
        this.isLoadingResults = false;
        this.isInvoiceReady = true;
        this.isPaypalAllowed = data.user.credentials && data.user.credentials != '';
        this.data = data;
        this.payingAmount = data.sumToPay;
        this.canAuthorizePayment = true;
        this.credentials = data.user.credentials;
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
    this.canAuthorizePayment = !isNaN(this.payingAmount);
  }
}
