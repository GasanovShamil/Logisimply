import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {MediaMatcher} from "@angular/cdk/layout";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AlertService} from "../../services/alert.service";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  isLoadingResults = true;
  isInvoiceReady = false;
  isPaypalAllowed = false;
  errorMessage = '';
  paramUser: string;
  paramInvoice: string;
  data = new Observable();
  payingAmount = 0;
  canAuthorizePayment = false;
  error = '';
  displayContent = ['reference', 'label', 'unitPriceET', 'quantity', 'discount', 'totalPriceET'];
  displayIncomes = ['method', 'amount', 'dateIncome'];

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

  getInvoicePayment() {
    this.dataService.getInvoicePayment(this.paramUser, this.paramInvoice).subscribe(
      data => {
        this.isLoadingResults = false;
        this.isInvoiceReady = true;
        this.isPaypalAllowed = data.user.credentials && data.user.credentials != '';
        this.data = data;
        this.payingAmount = data.sumToPay;
        this.canAuthorizePayment = true;
      },
      error => {
        this.isLoadingResults = false;
        this.error =  error.error.message;
      }
    );
  }

  checkPayingAmount() {
    this.canAuthorizePayment = !isNaN(this.payingAmount);
  }

  paymentSuccess() {
    this.alertService.success("YEAH");
  }
}
